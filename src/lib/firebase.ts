
'use server';

import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This function is intended to be used on the server side.
// It checks for Firebase environment variables and initializes the Firebase Admin app
// if it hasn't been initialized already.

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return admin.app();
  }

  const {
    FIREBASE_PROJECT_ID: projectId,
    FIREBASE_CLIENT_EMAIL: clientEmail,
    FIREBASE_PRIVATE_KEY: privateKey,
  } = process.env;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set.'
    );
  }

  try {
    return admin.initializeApp({
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

getFirebaseAdmin();
export const db = admin.firestore();
