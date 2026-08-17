export abstract class BaseStateMachine<TState extends string | number | symbol> {
  protected abstract transitions: Record<TState, TState[]>;

  public canTransition(from: TState, to: TState): boolean {
    if (from === to) return true;
    const allowed = this.transitions[from];
    if (!allowed) return false;
    return allowed.includes(to);
  }

  public validateTransition(from: TState, to: TState): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid state transition from ${String(from)} to ${String(to)}`);
    }
  }
}
