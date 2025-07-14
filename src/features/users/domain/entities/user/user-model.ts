export type UserModel = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  profilePictureUrl?: string; // Optional field
};
