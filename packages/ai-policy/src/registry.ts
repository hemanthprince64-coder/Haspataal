import db from '@haspataal/db';

export class AiModelManager {
  static async getModel(purpose: string) {
    const model = await db.aiModelRegistry.findFirst({
      where: { purpose, status: 'ACTIVE' },
      orderBy: { evaluationScore: 'desc' },
    });

    if (!model) {
      throw new Error(`No active AI model found for purpose: ${purpose}`);
    }

    return model;
  }
}

export class AiPromptManager {
  static async getPrompt(key: string) {
    const prompt = await db.aiPromptRegistry.findUnique({
      where: { key },
    });

    if (!prompt || prompt.status !== 'ACTIVE') {
      throw new Error(`No active AI prompt found for key: ${key}`);
    }

    return prompt;
  }
}
