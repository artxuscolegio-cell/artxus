import { Client, Databases, Storage, ID, Query, Account } from 'appwrite';

export const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '69efe45c0038f1a51a1a';

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

export const APPWRITE_CONFIG = {
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '69efe697003dd36a1a4a',
    photosCollectionId: import.meta.env.VITE_APPWRITE_PHOTOS_COLLECTION_ID || 'photos',
    notificationsCollectionId: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',
    commentsCollectionId: import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || 'comments',
    bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || 'photos_bucket'
};

export { ID, Query };
