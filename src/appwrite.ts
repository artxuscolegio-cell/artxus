import { Client, Databases, Storage, ID, Query } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);

export const APPWRITE_CONFIG = {
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    photosCollectionId: import.meta.env.VITE_APPWRITE_PHOTOS_COLLECTION_ID,
    notificationsCollectionId: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
    commentsCollectionId: import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID,
    bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID
};

export { ID, Query };
