import { NewPost, NewUser, UpdatePost } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

// ============================================================
// AUTH
// ============================================================

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

/**
 * Signs out the account.
 *
 * @return {Promise<any>} The session object.
 */
export async function signOutAccount() {
    try {
        const session = await account.deleteSession(
            "current"
        );
        return session;
    } catch (error) {
        console.log(error);
    }
}

// ============================================================
// POSTS
// ============================================================

/**
 * Creates a new post.
 *
 * @param {NewPost} post - The post object containing the details of the new post.
 * @return {Promise<any>} A promise that resolves with the newly created post.
 */
export async function createPost(post: NewPost) {
    try {
        // Upload file to appwrite storage
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw Error;

        // Get file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        // Convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // Create post
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        return newPost;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Uploads a file to the server.
 *
 * @param {File} file - The file to be uploaded.
 * @return {Promise<any>} A promise that resolves with the uploaded file.
 */
export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );

        return uploadedFile;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Retrieves the file preview URL for a given file ID.
 *
 * @param {string} fileId - The ID of the file to retrieve the preview for.
 * @return {string} The URL of the file preview, or null if the file preview is not available.
 */
export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100
        );

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Deletes a file.
 *
 * @param {string} fileId - The ID of the file to be deleted.
 * @return {Promise<{ status: string }>} - A promise that resolves to an object with a status property indicating the success of the operation.
 */
export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

/**
 * Retrieves posts from the database that match the given search term.
 *
 * @param {string} searchTerm - The term to search for in the post captions.
 * @return {Promise<any>} - A promise that resolves to an array of posts that match the search term.
 */
export async function searchPosts(searchTerm: string) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            [Query.search("caption", searchTerm)]
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Retrieves a list of infinite posts based on the provided page parameter.
 *
 * @param {number} pageParam - The page parameter to determine the starting point of the posts.
 * @return {Promise<any>} - A promise that resolves to the list of posts.
 */
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            queries
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Retrieves a post by its ID.
 *
 * @param {string} postId - The ID of the post to retrieve.
 * @return {Promise<object>} The retrieved post object.
 */
export async function getPostById(postId?: string) {
    if (!postId) throw Error;

    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            postId
        );

        if (!post) throw Error;

        return post;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Updates a post with new information.
 *
 * @param {UpdatePost} post - The post object containing the updated information.
 * @return {Promise} Returns a promise that resolves to the updated post.
 */
export async function updatePost(post: UpdatePost) {
    const hasFileToUpdate = post.file.length > 0;

    try {
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        };

        if (hasFileToUpdate) {
            // Upload new file to appwrite storage
            const uploadedFile = await uploadFile(post.file[0]);
            if (!uploadedFile) throw Error;

            // Get new file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
        }

        // Convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        //  Update post
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags,
            }
        );

        // Failed to update
        if (!updatedPost) {
            // Delete new file that has been recently uploaded
            if (hasFileToUpdate) {
                await deleteFile(image.imageId);
            }

            // If no new file uploaded, just throw error
            throw Error;
        }

        // Safely delete old file after successful update
        if (hasFileToUpdate) {
            await deleteFile(post.imageId);
        }

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Deletes a post and its associated image.
 *
 * @param {string} postId - The ID of the post to delete.
 * @param {string} imageId - The ID of the image associated with the post.
 * @return {Promise<{ status: string }>} - A promise that resolves to an object with a status property of "Ok" if the post and image were successfully deleted.
 */
export async function deletePost(postId?: string, imageId?: string) {
    if (!postId || !imageId) return;

    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            postId
        );

        if (!statusCode) throw Error;

        await deleteFile(imageId);

        return { status: "Ok" };
    } catch (error) {
        console.log(error);
    }
}

/**
 * Updates the likes of a post with the specified postId.
 *
 * @param {string} postId - The ID of the post to update the likes for.
 * @param {string[]} likesArray - An array of strings representing the new likes for the post.
 * @return {Promise<any>} - A promise that resolves to the updated post object if successful, otherwise an error is thrown.
 */
export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            postId,
            {
                likes: likesArray,
            }
        );

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Saves a post for a given user.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} postId - The ID of the post.
 * @return {Promise<object>} The updated post.
 */
export async function savePost(userId: string, postId: string) {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId,
            }
        );

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Deletes a saved post with the given record ID.
 *
 * @param {string} savedRecordId - The ID of the saved record to delete.
 * @return {Promise<{ status: string }>} A promise that resolves to an object with a status property of "Ok" upon successful deletion.
 */
export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId
        );

        if (!statusCode) throw Error;

        return { status: "Ok" };
    } catch (error) {
        console.log(error);
    }
}

/**
 * Retrieves the posts created by a user.
 *
 * @param {string} userId - The ID of the user. Optional.
 * @return {Promise<any>} A promise that resolves to an array of posts created by the user.
 */
export async function getUserPosts(userId?: string) {
    if (!userId) return;

    try {
        const post = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
        );

        if (!post) throw Error;

        return post;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Retrieves the most recent posts from the database.
 *
 * @return {Promise<Post[]>} An array of recent posts.
 */
export async function getRecentPosts() {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(20)]
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}


// ============================================================
// USER
// ============================================================

/**
 * Retrieves a list of users from the database.
 *
 * @param {number} limit - The maximum number of users to retrieve (optional).
 * @return {Promise<any[]>} A promise that resolves with an array of users.
 */
export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];

    if (limit) {
        queries.push(Query.limit(limit));
    }

    try {
        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            queries
        );

        if (!users) throw Error;

        return users;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Retrieves a user by their unique ID.
 *
 * @param {string} userId - The ID of the user to retrieve.
 * @return {Promise<any>} A promise that resolves with the user object, or null if the user does not exist.
 */
export async function getUserById(userId: string) {
    try {
        const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            userId
        );

        if (!user) throw Error;

        return user;
    } catch (error) {
        console.log(error);
    }
}
