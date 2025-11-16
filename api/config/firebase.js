import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Firebase Admin SDK Configuration
 * Initializes and exports Firebase Admin for database operations
 * @module FirebaseConfig
 */

/**
 * Firebase Admin service account credentials
 * @constant
 * @type {Object}
 */
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

/**
 * Initialize Firebase Admin SDK
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

/**
 * Firestore database instance
 * @constant
 */
const db = admin.firestore();

/**
 * Firebase Auth instance
 * @constant
 */
const auth = admin.auth();

export { db, auth };
export default admin;
