import * as firebaseAdmin from "firebase-admin";
import { firebaseApp } from "../services";
import { privateMiddleware } from "./middleware";

export interface ICreateUserInput {
  email: string;
  password: string;
  emailVerified?: boolean;
}

export function createFirebaseUser(form: ICreateUserInput): Promise<firebaseAdmin.auth.UserRecord> {
  // create firebase user
  return firebaseApp.auth()
    .createUser({
      email: form.email,
      password: form.password,
      emailVerified: form.emailVerified || false
    });
}

export function deleteFirebaseUser(uid: string): Promise<void> {
  // delete user firebase
  return firebaseApp.auth().deleteUser(uid);
}

export function getUserFirebaseByEmail(email: string): Promise<firebaseAdmin.auth.UserRecord> {
  // get user firebase by email
  return firebaseApp.auth().getUserByEmail(email);
}

export interface IUserFirebaseForm {
  password?: string;
  email?: string;
  emailVerified?: boolean;
}

// update information of user, but create this function to update password for user
export function updateUserFirebaseByAuthId(
  authId: string, form: IUserFirebaseForm
): Promise<firebaseAdmin.auth.UserRecord> {
  return firebaseApp.auth().updateUser(authId, form);
}

export function verifyFirebaseToken(token: string): Promise<string> {
  return firebaseApp.auth()
    .verifyIdToken(token)
    .then((user) => {
      return user.uid;
    }).catch((error) => Promise.reject(error));
}

export function firebaseAuthMiddleware(authId?: string): any {

  return privateMiddleware(authId || verifyFirebaseToken);
}

export async function deleteAllFirebaseUser() {
  try {
    const listUsersResult = await firebaseApp.auth().listUsers(10);
    await Promise.all(listUsersResult.users.map(
      (e) => firebaseApp.auth().deleteUser(e.uid)
    ));

    return null;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getFirebaseUserByIds(uids: string[]) {
  try {
    return await Promise.all(uids.map(async e => {
      try {
        return await firebaseApp.auth().getUser(e);
      } catch (error) {
        return null;
      }
    }));
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getFirebaseUserById(uid: string) {
  try {
    return firebaseApp.auth().getUser(uid);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function listUsersFirebase(pageSize, pageToken) {
  try {
    pageSize = pageSize ? parseInt(pageSize, 0) : 100;

    return await firebaseApp.auth().listUsers(pageSize, pageToken);
  } catch (error) {
    return Promise.reject(error);
  }
}
