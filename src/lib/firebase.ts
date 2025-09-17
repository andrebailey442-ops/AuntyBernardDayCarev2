
'use server';

import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let adminApp: admin.app.App | null = null;

function initializeAdminApp() {
  if (getApps().length > 0) {
    adminApp = admin.app();
    return;
  }

  const {
    FIREBASE_PROJECT_ID: projectId,
    FIREBASE_CLIENT_EMAIL: clientEmail,
    FIREBASE_PRIVATE_KEY: privateKey,
  } = process.env;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      'Firebase server environment variables are not fully set. Server-side Firebase features will be disabled.'
    );
    return;
  }

  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    if (error.message.includes('private key')) {
      console.error('Failed to parse private key:', error);
      throw new Error(
        'Failed to parse private key. Check the FIREBASE_PRIVATE_KEY format in your environment variables.'
      );
    }
    throw error;
  }
}

function getDb() {
  if (!adminApp) {
    initializeAdminApp();
  }
  return adminApp ? admin.firestore() : null;
}

export { getDb };
