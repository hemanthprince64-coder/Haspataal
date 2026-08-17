import db from '@haspataal/db';

import { SemanticQuery, ReportExecutionResult } from './types';

export class SemanticReportBuilder {
  /**
   * Translates a semantic query (business entities) into a raw SQL query.
   */
  static async compileSemanticToSql(query: SemanticQuery): Promise<string> {
    // Look up the base entity to find the underlying table name
    const baseEntity = await db.semanticEntity.findUnique({
      where: { entityName: query.baseEntity },
    });

    if (!baseEntity) {
      throw new Error(`Semantic entity not found: ${query.baseEntity}`);
    }

    // In a real implementation, this would construct a complex JOIN/GROUP BY string
    // using the `baseEntity.attributes` and `baseEntity.relationships` JSON.
    let sql = `SELECT * FROM ${baseEntity.tableName}`;

    if (query.filters && query.filters.length > 0) {
      // Very simplified filter compilation mock
      sql += ' WHERE 1=1';
      query.filters.forEach((f) => {
        sql += ` AND ${f.attribute} = '${f.value}'`;
      });
    }

    return sql;
  }

  /**
   * Executes a predefined report.
   */
  static async executeReport(reportId: string): Promise<ReportExecutionResult> {
    const startTime = Date.now();

    const report = await db.reportDefinition.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    let sql = report.sqlQuery;
    if (!sql) {
      // Compile on the fly if not cached
      sql = await this.compileSemanticToSql(report.semanticQuery as any);

      // Cache it
      await db.reportDefinition.update({
        where: { id: reportId },
        data: { sqlQuery: sql },
      });
    }

    // Execute raw SQL
    // WARNING: In a real system, strictly sanitize and scope raw SQL execution
    const results = await db.$queryRawUnsafe<any[]>(sql);

    const latencyMs = Date.now() - startTime;

    // Log execution
    await db.reportExecutionLog.create({
      data: {
        reportId,
        status: 'SUCCESS',
        latencyMs,
        resultRowCnt: results.length,
      },
    });

    return {
      reportId,
      data: results,
      rowCount: results.length,
      latencyMs,
    };
  }
}
