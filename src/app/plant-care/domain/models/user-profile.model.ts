export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  joinDate: string;
  photoUrl: string;
  subscriptionLevel: string;
}

export interface UserSecurityProfile {
  password: string;
}

export type CompleteUserProfile = UserProfile & UserSecurityProfile;
