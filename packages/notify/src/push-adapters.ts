export class PushNotificationAdapter {
  public channel = 'PUSH';

  async deliver(): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return { success: false, error: 'Provider unavailable' };
  }

  validateConfig(config: Record<string, any>): boolean {
    return !!config.fcmToken;
  }
}

export class InAppNotificationAdapter {
  public channel = 'IN_APP';

  async deliver(): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return { success: false, error: 'Provider unavailable' };
  }
}
