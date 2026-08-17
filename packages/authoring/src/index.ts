import { ArtifactRegistry, ArtifactType } from '@haspataal/artifact-registry';

/**
 * Base Authoring Agent that handles the formal compilation pipeline.
 */
export abstract class AuthoringAgent {
  protected abstract artifactType: ArtifactType;

  /**
   * Generates an AST, validates it, runs static analysis, and registers it as a DRAFT.
   */
  async generate(prompt: string, context: Record<string, any>) {
    // 1. LLM Generation
    const ast = await this.llmGenerateAST(prompt, context);

    // 2. Validation
    this.validateSchema(ast);

    // 3. Static Analysis
    this.staticAnalysis(ast);

    // 4. Register Draft
    const artifact = await ArtifactRegistry.registerArtifact(
      this.artifactType,
      ast.name || `Generated ${this.artifactType}`,
      'AI',
      ast,
      this.extractDependencies(ast),
    );

    return artifact;
  }

  protected abstract llmGenerateAST(prompt: string, context: Record<string, any>): Promise<any>;
  protected abstract validateSchema(ast: any): void;
  protected abstract staticAnalysis(ast: any): void;
  protected abstract extractDependencies(ast: any): string[];
}

export class RuleGenerator extends AuthoringAgent {
  protected artifactType: ArtifactType = 'RULE';

  protected async llmGenerateAST(prompt: string, context: Record<string, any>) {
    // In a real implementation, this calls an LLM.
    return {
      name: 'AI Generated Rule',
      operator: 'AND',
      nodes: [],
    };
  }

  protected validateSchema(ast: any) {
    if (!ast.operator) throw new Error('Invalid Rule AST: Missing operator');
  }

  protected staticAnalysis(ast: any) {
    // Detect circular dependencies, unreachable branches, etc.
  }

  protected extractDependencies(ast: any) {
    return ['icu_occupancy_feature'];
  }
}
