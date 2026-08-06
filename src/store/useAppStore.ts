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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loginAsGuest: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string; type?: 'appwrite' | 'local'; code?: string }>;
  resetPasswordDirect: (email: string, newPassword: string) => { success: boolean; error?: string };
  updatePasswordRecovery: (userId: string, secret: string, password: string) => Promise<boolean>;

  addPhoto: (imageUrl: string, description?: string) => void;
  deletePhoto: (photoId: string) => void;
  deleteAllPhotos: () => void;
  adminDeletePhoto: (photoId: string) => void;
  toggleLike: (photoId: string) => void;
  togglePinPhoto: (photoId: string) => void;
  addComment: (photoId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;

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
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword) {
          return { success: false, error: 'Por favor ingresa tu correo y contraseña' };
        }

        const { users, loginNotifications } = get();
        let user: User | undefined;
        
        if (cleanEmail === ADMIN_EMAIL.toLowerCase() && cleanPassword === ADMIN_PASSWORD) {
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
            try {
              await account.createEmailPasswordSession(cleanEmail, cleanPassword);
            } catch (err: any) {
              if (err?.message?.includes('session is active') || err?.code === 409) {
                await account.deleteSession('current').catch(() => {});
                await account.createEmailPasswordSession(cleanEmail, cleanPassword);
              } else {
                throw err;
              }
            }
            
            const appwriteUser = await account.get();
            user = {
              id: appwriteUser.$id,
              username: appwriteUser.name,
              email: appwriteUser.email,
              password: cleanPassword,
              role: 'user',
              createdAt: new Date(appwriteUser.$createdAt),
            };

            const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
            let updatedUsers = [...users];
            if (existingIndex >= 0) {
              updatedUsers[existingIndex] = user;
            } else {
              updatedUsers.push(user);
            }
            set({ users: updatedUsers });
          } catch (error: any) {
            console.log('Appwrite login error/fallback to local:', error?.message || error);
            user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
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
          return { success: true };
        }
        
        return { success: false, error: 'Correo electrónico o contraseña incorrectos' };
      },

      register: async (username: string, email: string, password: string) => {
        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        if (!cleanUsername || !cleanEmail || !cleanPassword) {
          return { success: false, error: 'Todos los campos son requeridos' };
        }

        if (cleanPassword.length < 6) {
          return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }

        const { users, loginNotifications } = get();
        
        if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
          return { success: false, error: 'El correo electrónico ya está registrado' };
        }

        let newUser: User | null = null;
        let isAppwriteSuccess = false;
        
        try {
          const appwriteUser = await account.create(ID.unique(), cleanEmail, cleanPassword, cleanUsername);
          await account.createEmailPasswordSession(cleanEmail, cleanPassword).catch(() => {});
          
          newUser = {
            id: appwriteUser.$id,
            username: appwriteUser.name,
            email: appwriteUser.email,
            password: cleanPassword,
            role: 'user',
            createdAt: new Date(appwriteUser.$createdAt),
          };
          isAppwriteSuccess = true;
        } catch (error: any) {
          console.log('Appwrite register error/fallback:', error?.message || error);
          if (error?.code === 409) {
            return { success: false, error: 'El correo electrónico ya está registrado' };
          }
          
          // Fallback to local user registration if Appwrite server is paused, offline, or rejected
          newUser = {
            id: 'user_' + Date.now(),
            username: cleanUsername,
            email: cleanEmail,
            password: cleanPassword,
            role: 'user',
            createdAt: new Date(),
          };
        }
        
        if (newUser) {
          set({ users: [...users, newUser], currentUser: newUser, isAuthenticated: true, isGuest: false });
          
          const newNotification: LoginNotification = {
            id: crypto.randomUUID(),
            userId: newUser.id,
            username: newUser.username,
            type: 'register',
            timestamp: new Date(),
            read: false,
          };
          
          if (isAppwriteSuccess) {
            try {
              fb.addNotificationToAppwrite({ userId: newUser.id, username: newUser.username, type: 'register' });
            } catch (e) {
              set({ loginNotifications: [newNotification, ...loginNotifications] });
            }
          } else {
            set({ loginNotifications: [newNotification, ...loginNotifications] });
          }
          return { success: true };
        }

        return { success: false, error: 'No se pudo crear la cuenta. Intenta nuevamente.' };
      },

      logout: () => {
        account.deleteSession('current').catch(() => {});
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

      resetPassword: async (email: string) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
          return { success: false, error: 'Por favor ingresa tu correo electrónico' };
        }

        const { users } = get();
        const localUser = users.find(u => u.email.toLowerCase() === cleanEmail);

        try {
          const url = new URL(window.location.href);
          url.search = '';
          await account.createRecovery(cleanEmail, url.toString());
          return {
            success: true,
            type: 'appwrite',
            message: 'Te hemos enviado un correo con las instrucciones y el enlace de recuperación.'
          };
        } catch (error: any) {
          console.log('Appwrite password reset error/fallback:', error?.message || error);
          
          if (localUser) {
            const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
            return {
              success: true,
              type: 'local',
              code: recoveryCode,
              message: `Código de recuperación generado: ${recoveryCode}`,
            };
          }

          return {
            success: false,
            error: 'No se encontró ninguna cuenta registrada con este correo electrónico.'
          };
        }
      },

      resetPasswordDirect: (email: string, newPassword: string) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = newPassword.trim();
        if (cleanPassword.length < 6) {
          return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }

        const { users } = get();
        const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

        if (userIndex >= 0) {
          const updatedUsers = [...users];
          updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: cleanPassword };
          set({ users: updatedUsers });
          return { success: true };
        }

        const newUser: User = {
          id: 'user_' + Date.now(),
          username: cleanEmail.split('@')[0],
          email: cleanEmail,
          password: cleanPassword,
          role: 'user',
          createdAt: new Date(),
        };
        set({ users: [...users, newUser] });
        return { success: true };
      },

      updatePasswordRecovery: async (userId: string, secret: string, password: string) => {
        const cleanPassword = password.trim();
        const { users } = get();

        let appwriteSuccess = false;
        try {
          await account.updateRecovery(userId, secret, cleanPassword);
          appwriteSuccess = true;
        } catch (error) {
          console.error('Appwrite password recovery update error:', error);
        }

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex >= 0) {
          const updatedUsers = [...users];
          updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: cleanPassword };
          set({ users: updatedUsers });
          return true;
        }

        return appwriteSuccess;
      },

      addPhoto: async (imageUrl: string, description?: string) => {
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
          await fb.addPhotoToAppwrite({
            userId: currentUser.id,
            username: currentUser.username,
            imageUrl,
            description,
            likes: [],
          });
          
          await fb.addNotificationToAppwrite({
            userId: currentUser.id,
            username: currentUser.username,
            type: 'upload',
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

      markAllNotificationsRead: async () => {
        const { loginNotifications } = get();
        // Optimistic update locally
        set({
          loginNotifications: loginNotifications.map(n => ({ ...n, read: true }))
        });
        try {
          await fb.clearAllNotifications(); // This now updates them to read: true
        } catch (e) {
          console.error('Error marking all notifications as read', e);
        }
      },

      deleteNotification: async (notificationId: string) => {
        const { loginNotifications } = get();
        // Optimistic: remove from local state immediately
        set({
          loginNotifications: loginNotifications.filter(n => n.id !== notificationId),
        });
        try {
          await fb.deleteNotificationFromAppwrite(notificationId);
        } catch (e) {
          console.error('Error deleting notification', e);
          // Revert if cloud delete fails
          set({ loginNotifications });
        }
      },

      togglePinPhoto: async (photoId: string) => {
        const { photos, currentUser } = get();
        if (!currentUser) return;

        const photo = photos.find(p => p.id === photoId);
        if (!photo) return;

        if (photo.userId !== currentUser.id && currentUser.role !== 'admin') return;

        const newPinnedState = !photo.pinned;

        set({
          photos: photos.map(p =>
            p.id === photoId ? { ...p, pinned: newPinnedState } : p
          ),
        });

        try {
          await fb.updatePhotoPinned(photoId, newPinnedState);
        } catch (e) {
          console.error('Error toggling pinned state', e);
        }
      },

      toggleLike: (photoId: string) => {
        const { photos, currentUser } = get();
        if (!currentUser) return;
        
        let hasLikedBefore = false;
        const updatedPhotos = photos.map(photo => {
          if (photo.id === photoId) {
            const hasLiked = photo.likes.includes(currentUser.id);
            hasLikedBefore = hasLiked;
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
            
            // Add notification only if liking (not unliking)
            if (!hasLikedBefore) {
              fb.addNotificationToAppwrite({
                userId: currentUser.id,
                username: currentUser.username,
                type: 'like',
              });
            }
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
          
          await fb.addNotificationToAppwrite({
            userId: currentUser.id,
            username: currentUser.username,
            type: 'comment',
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