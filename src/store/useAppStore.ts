import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Photo, UserSettings, AuthMode, LoginNotification } from '../types';
import * as fb from '../appwriteService';
import { account, ID } from '../appwrite';

export interface AppState {
  currentUser: User | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  authMode: AuthMode;
  accessCode: string;
  users: User[];
  photos: Photo[];
  loginNotifications: LoginNotification[];
  settings: UserSettings;
  isAppwriteReady: boolean;

  setAccessCode: (code: string) => void;
  setAuthMode: (mode: AuthMode) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginAsGuest: () => void;

  addPhoto: (imageUrl: string, description?: string) => void;
  deletePhoto: (photoId: string) => void;
  deleteAllPhotos: () => void;
  adminDeletePhoto: (photoId: string) => void;
  toggleLike: (photoId: string) => void;
  addComment: (photoId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  markNotificationRead: (notificationId: string) => void;
  clearAllNotifications: () => void;

  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  initAppwrite: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  primaryColor: '#8b5cf6',
  fontSize: 'medium',
  layout: 'masonry',
  sortOrder: 'newest',
  photosPerPage: 12,
  showLikes: true,
  showUsernames: true,
  animationsEnabled: true,
  backgroundGradient: 'from-violet-600 via-indigo-600 to-purple-700',
  cardStyle: 'rounded',
  showDescriptions: true,
};

const ACCESS_CODE = 'ARTXUS2026';
const ADMIN_EMAIL = 'admin@artxus.com';
const ADMIN_PASSWORD = 'admin123';

let fbUnsubPhotos: (() => void) | null = null;
let fbUnsubNotifs: (() => void) | null = null;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isGuest: false,
      isAuthenticated: false,
      authMode: 'access',
      accessCode: '',
      users: [],
      photos: [],
      loginNotifications: [],
      settings: defaultSettings,
      isAppwriteReady: false,

      setAccessCode: (code: string) => {
        if (code.toUpperCase() === ACCESS_CODE) {
          set({ accessCode: code, authMode: 'login' });
        }
      },

      setAuthMode: (mode: AuthMode) => set({ authMode: mode }),

      initAppwrite: () => {
        if (fbUnsubPhotos) return;
        
        try {
          fbUnsubPhotos = fb.subscribeToPhotos((photos) => {
            set({ photos, isAppwriteReady: true });
          });
          
          fbUnsubNotifs = fb.subscribeToNotifications((notifications) => {
            set({ loginNotifications: notifications });
          });
        } catch (e) {
          console.log('Appwrite not configured, using localStorage mode');
        }
      },

      login: async (email: string, password: string) => {
        const { users, loginNotifications } = get();
        let user: User | undefined;
        
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          user = {
            id: 'admin',
            username: 'Administrador',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
            createdAt: new Date(),
          };
        } else {
          try {
            await account.createEmailPasswordSession(email, password);
            const appwriteUser = await account.get();
            user = {
              id: appwriteUser.$id,
              username: appwriteUser.name,
              email: appwriteUser.email,
              password: password,
              role: 'user',
              createdAt: new Date(appwriteUser.$createdAt),
            };
          } catch (error) {
            console.error('Appwrite login error:', error);
            user = users.find(u => u.email === email && u.password === password);
          }
        }
        
        if (user) {
          set({ currentUser: user, isAuthenticated: true, isGuest: false });
          
          const newNotification: LoginNotification = {
            id: crypto.randomUUID(),
            userId: user.id,
            username: user.username,
            type: 'login',
            timestamp: new Date(),
            read: false,
          };
          
          try {
            fb.addNotificationToAppwrite({ userId: user.id, username: user.username, type: 'login' });
          } catch (e) {
            set({ loginNotifications: [newNotification, ...loginNotifications] });
          }
          return true;
        }
        return false;
      },

      register: async (username: string, email: string, password: string) => {
        const { users, loginNotifications } = get();
        if (users.some(u => u.email === email)) return false;
        
        try {
          const appwriteUser = await account.create(ID.unique(), email, password, username);
          await account.createEmailPasswordSession(email, password);
          
          const newUser: User = {
            id: appwriteUser.$id,
            username: appwriteUser.name,
            email: appwriteUser.email,
            password: password,
            role: 'user',
            createdAt: new Date(appwriteUser.$createdAt),
          };
          
          set({ users: [...users, newUser], currentUser: newUser, isAuthenticated: true, isGuest: false });
          
          const newNotification: LoginNotification = {
            id: crypto.randomUUID(),
            userId: newUser.id,
            username: newUser.username,
            type: 'register',
            timestamp: new Date(),
            read: false,
          };
          
          try {
            fb.addNotificationToAppwrite({ userId: newUser.id, username: newUser.username, type: 'register' });
          } catch (e) {
            set({ loginNotifications: [newNotification, ...loginNotifications] });
          }
          return true;
        } catch (error: any) {
          console.error('Appwrite register error:', error);
          if (error.code === 409) {
            return false;
          }
          return false;
        }
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false, isGuest: false, authMode: 'login' });
      },

      loginAsGuest: () => {
        set({
          isGuest: true,
          isAuthenticated: true,
          currentUser: {
            id: 'guest',
            username: 'Invitado',
            email: 'guest@artxus.com',
            password: '',
            role: 'user',
            createdAt: new Date(),
          },
        });
      },

      addPhoto: (imageUrl: string, description?: string) => {
        const { currentUser, photos } = get();
        if (!currentUser) return;
        
        const newPhoto: Photo = {
          id: crypto.randomUUID(),
          userId: currentUser.id,
          username: currentUser.username,
          imageUrl,
          description,
          likes: [],
          createdAt: new Date(),
        };
        
        try {
          fb.addPhotoToAppwrite({
            userId: currentUser.id,
            username: currentUser.username,
            imageUrl,
            description,
            likes: [],
          });
        } catch (e) {
          set({ photos: [newPhoto, ...photos] });
        }
      },

      deletePhoto: (photoId: string) => {
        const { photos, currentUser } = get();
        const photo = photos.find(p => p.id === photoId);
        if (photo && (photo.userId === currentUser?.id || currentUser?.role === 'admin')) {
          try {
            fb.deletePhotoFromAppwrite(photoId);
            fb.deleteImage(photo.imageUrl);
          } catch (e) {
            set({ photos: photos.filter(p => p.id !== photoId) });
          }
        }
      },

      deleteAllPhotos: () => {
        const { currentUser, photos } = get();
        if (currentUser?.role === 'admin') {
          try {
            fb.deleteAllPhotosFromAppwrite();
          } catch (e) {
            set({ photos: [] });
          }
        }
      },

      adminDeletePhoto: (photoId: string) => {
        const { photos } = get();
        const photo = photos.find(p => p.id === photoId);
        if (photo) {
          try {
            fb.deletePhotoFromAppwrite(photoId);
            fb.deleteImage(photo.imageUrl);
          } catch (e) {
            set({ photos: photos.filter(p => p.id !== photoId) });
          }
        }
      },

      markNotificationRead: (notificationId: string) => {
        const { loginNotifications } = get();
        try {
          fb.markNotificationRead(notificationId);
        } catch (e) {
          set({
            loginNotifications: loginNotifications.map(n =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
          });
        }
      },

      clearAllNotifications: () => {
        const { loginNotifications } = get();
        try {
          fb.clearAllNotifications();
        } catch (e) {
          set({
            loginNotifications: loginNotifications.map(n => ({ ...n, read: true })),
          });
        }
      },

      toggleLike: (photoId: string) => {
        const { photos, currentUser } = get();
        if (!currentUser) return;
        
        const updatedPhotos = photos.map(photo => {
          if (photo.id === photoId) {
            const hasLiked = photo.likes.includes(currentUser.id);
            return {
              ...photo,
              likes: hasLiked
                ? photo.likes.filter(id => id !== currentUser.id)
                : [...photo.likes, currentUser.id],
            };
          }
          return photo;
        });
        
        set({ photos: updatedPhotos });
        
        try {
          const photo = photos.find(p => p.id === photoId);
          if (photo) {
            fb.updatePhotoLikes(photoId, updatedPhotos.find(p => p.id === photoId)?.likes || []);
          }
        } catch (e) {}
      },

      addComment: async (photoId: string, text: string) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          await fb.addComment({
            photoId,
            userId: currentUser.id,
            username: currentUser.username,
            text
          });
        } catch (e) {
          console.error('Error adding comment:', e);
        }
      },

      deleteComment: async (commentId: string) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          await fb.deleteComment(commentId);
        } catch (e) {
          console.error('Error deleting comment:', e);
        }
      },

      updateSettings: (newSettings: Partial<UserSettings>) => {
        const { settings } = get();
        set({ settings: { ...settings, ...newSettings } });
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: 'artxus-storage',
      partialize: (state) => ({
        users: state.users,
        photos: state.photos,
        loginNotifications: state.loginNotifications,
        settings: state.settings,
      }),
    }
  )
);