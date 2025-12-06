export interface ProfileDetails {
  fullName: string;
  timezone: string;
  language: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  slug: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  timezone: string;
  language: string;
}
