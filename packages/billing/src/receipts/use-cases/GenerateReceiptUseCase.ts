import { ReceiptAggregate, GenerateReceiptCommand } from '../aggregates/ReceiptAggregate';

export class GenerateReceiptUseCase {
  private aggregate = new ReceiptAggregate();

  public async execute(command: GenerateReceiptCommand): Promise<string> {
    // In a real app, we might do authz checks here.
    return await this.aggregate.generate(command);
  }
}
