export interface NotificationPreference {
  type: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

export interface NotificationSettings {
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  digestTime: string | null;
  preferences: NotificationPreference[];
}

export interface UpdateNotificationsPayload extends NotificationSettings {}
