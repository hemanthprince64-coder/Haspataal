module.exports = {
  'no-direct-prisma-in-pages': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow direct Prisma access in Next.js pages or layouts',
        category: 'Healthcare Security',
        recommended: true,
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      const isPageOrLayout = filename.endsWith('page.tsx') || filename.endsWith('layout.tsx');

      return {
        ImportDeclaration(node) {
          if (!isPageOrLayout) return;

          const source = node.source.value;
          if (source === '@prisma/client' || source.includes('lib/prisma')) {
            context.report({
              node,
              message: 'Direct database access via Prisma is forbidden in pages and layouts. Please use a central service from lib/services.ts instead.',
            });
          }
        },
      };
    },
  },
  'no-patient-data-in-logs': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow logging potentially sensitive patient PHI data',
        category: 'Healthcare Privacy (PHI)',
        recommended: true,
      },
      schema: [],
    },
    create(context) {
      const sensitiveFields = ['patientId', 'phone', 'email', 'dateOfBirth'];

      return {
        CallExpression(node) {
          const callee = node.callee;
          const isLogger =
            (callee.type === 'MemberExpression' &&
              callee.object.name === 'console' &&
              callee.property.name === 'log') ||
            (callee.type === 'MemberExpression' &&
              callee.object.name === 'logger' &&
              callee.property.name === 'info');

          if (!isLogger) return;

          node.arguments.forEach((arg) => {
            if (arg.type === 'ObjectExpression') {
              arg.properties.forEach((prop) => {
                if (
                  prop.type === 'Property' &&
                  prop.key.type === 'Identifier' &&
                  sensitiveFields.includes(prop.key.name)
                ) {
                  context.report({
                    node: prop,
                    message: `Potential PHI leak: Do not log sensitive patient field '${prop.key.name}'. Use anonymized IDs or remove from logs.`,
                  });
                }
              });
            }
          });
        },
      };
    },
  },
};
