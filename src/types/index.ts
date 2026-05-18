export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface LoginNotification {
  id: string;
  userId: string;
  username: string;
  type: 'login' | 'register' | 'upload' | 'comment' | 'like';
  timestamp: Date;
  read: boolean;
}

export interface Comment {
  id: string;
  photoId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
}

export interface Photo {
  id: string;
  userId: string;
  username: string;
  imageUrl: string;
  description?: string;
  likes: string[];
  createdAt: Date;
  commentCount?: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  layout: 'grid' | 'masonry' | 'list';
  sortOrder: 'newest' | 'oldest' | 'most_liked';
  photosPerPage: number;
  showLikes: boolean;
  showUsernames: boolean;
  animationsEnabled: boolean;
  backgroundGradient: string;
  cardStyle: 'rounded' | 'sharp' | 'circle';
  showDescriptions: boolean;
}

export type AuthMode = 'access' | 'login' | 'register' | 'guest';
