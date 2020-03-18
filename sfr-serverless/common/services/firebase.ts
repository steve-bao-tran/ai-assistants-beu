import * as firebaseAdmin from "firebase-admin";

let firebaseApp: firebaseAdmin.app.App;

if (!firebaseApp) {

  firebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID
    })
  });
}

export { firebaseApp };
