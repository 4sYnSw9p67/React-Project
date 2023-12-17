import { NewUser } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases } from "./config";

/**
 * Creates a new user account with the provided user details.
 *
 * @param {NewUser} user - The user details for creating the account.
 * @return {Promise<User>} - The newly created user account.
 */
export async function createUserAccount(user: NewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if (!newAccount) {
            throw Error;
        }

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        });

        return newUser;

    } catch (error) {
        console.log(error);
        return error;
    }
}

/**
 * Saves a user object to the database.
 *
 * @param {object} user - The user object to be saved.
 * @param {string} user.accountId - The ID of the user's account.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.name - The name of the user.
 * @param {URL} user.imageUrl - The URL of the user's image.
 * @param {string} [user.username] - The username of the user (optional).
 * @return {object} The newly created user object.
 */
export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;

}) {

    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            user,
        )

        return newUser;
    } catch (error) {
        console.log(error);
    }

}

/**
 * Sign in an account with the given email and password.
 *
 * @param {object} user - The user object containing the email and password.
 * @param {string} user.email - The email of the user.
 * @param {string} user.password - The password of the user.
 * @return {Promise<any>} A promise that resolves to the session object.
 */
export async function signInAccount(user: {
    email: string;
    password: string;
}) {
    try {
        const session = await account.createEmailSession(
            user.email,
            user.password
        )

        return session;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Retrieves the current user from the database.
 *
 * @return {Promise<Document>} The document representing the current user.
 */
export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) {
            throw Error;
        }

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            [
                Query.equal("accountId", currentAccount.$id),
            ]
        )

        if (!currentUser) {
            throw Error;
        };

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}
