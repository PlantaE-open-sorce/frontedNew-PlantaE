export interface PublicProfile {
  id: string;
  ownerId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  timezone?: string;
  slug: string;
}

export interface UpdatePublicProfilePayload {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  slug?: string;
}
