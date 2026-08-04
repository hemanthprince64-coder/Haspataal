import { RefundAggregate, CreateRefundCommand } from '../aggregates/RefundAggregate';

export class RefundPaymentUseCase {
  async execute(command: CreateRefundCommand) {
    // Basic validation
    if (command.amount <= 0) {
      throw new Error('Refund amount must be positive');
    }
    if (!command.reason || command.reason.trim().length === 0) {
      throw new Error('Refund reason is required');
    }

    return await RefundAggregate.initiateRefund(command);
  }
}
