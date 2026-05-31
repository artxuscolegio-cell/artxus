import { client, databases, storage, APPWRITE_CONFIG, ID, Query } from './appwrite';
import imageCompression from 'browser-image-compression';
import type { Photo, LoginNotification, Comment } from './types';

export async function uploadImage(file: File): Promise<string> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  
  let fileToUpload: File | Blob = file;
  try {
    fileToUpload = await imageCompression(file, options);
    if (!(fileToUpload instanceof File)) {
      fileToUpload = new File([fileToUpload], file.name, { type: file.type });
    }
  } catch (error) {
    console.error('Error compressing image:', error);
  }

  try {
    const result = await storage.createFile(
      APPWRITE_CONFIG.bucketId,
      ID.unique(),
      fileToUpload as File
    );
    return storage.getFileView(APPWRITE_CONFIG.bucketId, result.$id).toString();
  } catch (error: any) {
    console.error('Appwrite upload error:', error);
    throw new Error(error.message || 'Error al subir archivo a Appwrite Storage');
  }
}

export async function deleteImage(imageUrl: string) {
  try {
    const urlObj = new URL(imageUrl);
    const parts = urlObj.pathname.split('/');
    const fileIdIndex = parts.indexOf('files') + 1;
    if (fileIdIndex > 0 && fileIdIndex < parts.length) {
      const fileId = parts[fileIdIndex];
      await storage.deleteFile(APPWRITE_CONFIG.bucketId, fileId);
    }
  } catch (e) {
    console.log('Image delete error:', e);
  }
}

export function subscribeToPhotos(callback: (photos: Photo[]) => void) {
  const fetchPhotos = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.photosCollectionId,
        [Query.orderDesc('createdAt')]
      );
      
      const photos = response.documents.map(doc => ({
        id: doc.$id,
        userId: doc.userId,
        username: doc.username,
        imageUrl: doc.imageUrl,
        description: doc.description,
        likes: doc.likes || [],
        createdAt: new Date(doc.createdAt),
      })) as Photo[];
      
      callback(photos);
    } catch (e) {
      console.error('Error fetching photos', e);
    }
  };

  fetchPhotos();
  const unsubscribe = client.subscribe(
    `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.photosCollectionId}.documents`,
    () => fetchPhotos()
  );
  
  return unsubscribe;
}

export async function addPhotoToAppwrite(photo: Omit<Photo, 'id' | 'createdAt'>) {
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.photosCollectionId,
    ID.unique(),
    {
      userId: photo.userId,
      username: photo.username,
      imageUrl: photo.imageUrl,
      description: photo.description || '',
      likes: photo.likes || [],
      createdAt: new Date().toISOString()
    }
  );
  return doc.$id;
}

export async function deletePhotoFromAppwrite(photoId: string) {
  await databases.deleteDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.photosCollectionId,
    photoId
  );
}

export async function updatePhotoLikes(photoId: string, likes: string[]) {
  await databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.photosCollectionId,
    photoId,
    { likes }
  );
}

export function subscribeToNotifications(callback: (notifications: LoginNotification[]) => void) {
  const fetchNotifs = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.notificationsCollectionId,
        [Query.orderDesc('timestamp')]
      );
      
      const notifications = response.documents.map(doc => ({
        id: doc.$id,
        userId: doc.userId,
        username: doc.username,
        type: doc.type,
        timestamp: new Date(doc.timestamp),
        read: doc.read,
      })) as LoginNotification[];
      
      callback(notifications);
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  };

  fetchNotifs();
  const unsubscribe = client.subscribe(
    `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.notificationsCollectionId}.documents`,
    () => fetchNotifs()
  );
  
  return unsubscribe;
}

export async function addNotificationToAppwrite(notification: Omit<LoginNotification, 'id' | 'timestamp' | 'read'>) {
  await databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.notificationsCollectionId,
    ID.unique(),
    {
      userId: notification.userId,
      username: notification.username,
      type: notification.type,
      read: false,
      timestamp: new Date().toISOString()
    }
  );
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>) {
  await databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.commentsCollectionId,
    ID.unique(),
    {
      ...comment,
      createdAt: new Date().toISOString(),
    }
  );
}

export async function getComments(photoId: string): Promise<Comment[]> {
  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.commentsCollectionId,
    [Query.equal('photoId', photoId), Query.orderAsc('createdAt')]
  );
  
  return response.documents.map(doc => ({
    id: doc.$id,
    photoId: doc.photoId,
    userId: doc.userId,
    username: doc.username,
    text: doc.text,
    createdAt: new Date(doc.createdAt),
  }));
}

export async function deleteComment(commentId: string) {
  await databases.deleteDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.commentsCollectionId,
    commentId
  );
}

export function subscribeToComments(photoId: string, callback: (comments: Comment[]) => void) {
  const unsubscribe = client.subscribe(
    `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.commentsCollectionId}.documents`,
    async () => {
      const comments = await getComments(photoId);
      callback(comments);
    }
  );
  
  return unsubscribe;
}

export async function markNotificationRead(notificationId: string) {
  await databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.notificationsCollectionId,
    notificationId,
    { read: true }
  );
}

export async function clearAllNotifications() {
  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.notificationsCollectionId
  );
  
  const promises = response.documents.map(doc => 
    databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.notificationsCollectionId,
      doc.$id
    )
  );
  
  await Promise.all(promises);
}

export async function deleteAllPhotosFromAppwrite() {
  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.photosCollectionId
  );
  
  const promises = response.documents.map(doc => 
    databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.photosCollectionId,
      doc.$id
    )
  );
  
  await Promise.all(promises);
}

export const isAppwriteConfigured = () => {
  return APPWRITE_CONFIG.databaseId && APPWRITE_CONFIG.bucketId;
};
