export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  isActive: boolean;
}