import { ReceiptAggregate } from '../aggregates/ReceiptAggregate';

export interface VoidReceiptCommand {
  receiptId: string;
  hospitalId: string;
  userId: string;
  reason: string;
}

export class VoidReceiptUseCase {
  private aggregate = new ReceiptAggregate();

  public async execute(command: VoidReceiptCommand): Promise<void> {
    await this.aggregate.void(
      command.receiptId,
      command.reason,
      command.userId,
      command.hospitalId,
    );
  }
}
