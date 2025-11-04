export type ThemePreference = 'day' | 'night';

export interface NotificationPreferences {
  sms: boolean;
  email: boolean;
  phoneCall: boolean;
  socialMedia: boolean;
}

export interface AlarmSettings {
  type: string;
  options: string[];
}

export interface SettingsState {
  language: 'es' | 'en';
  theme: ThemePreference;
  notifications: NotificationPreferences;
  alarm: AlarmSettings;
}
