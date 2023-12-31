import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import {
    createPost,
    createUserAccount,
    deletePost,
    deleteSavedPost,
    getCurrentUser,
    getPostById,
    getRecentPosts,
    getUserPosts,
    getUsers,
    likePost,
    savePost,
    searchPosts,
    signInAccount,
    signOutAccount,
    updatePost,
    getInfinitePosts,
    getUserById
} from '../appwrite/api';
import { NewPost, NewUser, UpdatePost } from '@/types';
import { QUERY_KEYS } from './queryKeys';

// ============================================================
// AUTH QUERIES
// ============================================================

/**
 * Creates a new user account by using the useMutation hook.
 *
 * @return {useMutation} The result of the useMutation hook.
 */
export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: NewUser) => createUserAccount(user),
    });
}

/**
 * Generates a mutation hook for signing in to an account.
 *
 * @return {MutationHook} The generated mutation hook.
 */
export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: {
            email: string,
            password: string,
        }
        ) => signInAccount(user),
    });
}


/**
 * Returns a mutation hook for signing out of an account.
 *
 * @return {useMutation} A mutation hook for signing out.
 */
export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount,
    });
}

// ============================================================
// POST QUERIES
// ============================================================

/**
 * A hook that creates a new post.
 *
 * @return {MutationFunction} The mutation function used to create a post.
 */
export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: NewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
        },
    });
};

/**
 * Returns a mutation hook for updating a post.
 *
 * @return {MutationHook} The mutation hook.
 */
export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: UpdatePost) => updatePost(post),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
            });
        },
    });
};

/**
 * Returns a mutation function that can be used to delete a post.
 *
 * @return {MutationFunction} The mutation function.
 */
export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
            deletePost(postId, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
        },
    });
};

/**
 * Retrieves the recent posts using the useQuery hook.
 *
 * @return {QueryResult} The result of the useQuery hook.
 */
export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    });
};


/**
 * Use this hook to like a post.
 *
 * @return {MutationFunction} The mutation function.
 */
export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            postId,
            likesArray,
        }: {
            postId: string;
            likesArray: string[];
        }) => likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

/**
 * Generates a custom hook for saving a post.
 *
 * @returns {Object} The mutation object.
 */
export const useSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
            savePost(userId, postId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

/**
 * Returns a mutation function for deleting a saved post.
 *
 * @return {MutationFunction} The mutation function for deleting a saved post.
 */
export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

/**
 * Retrieves a post by its ID.
 *
 * @param {string} postId - The ID of the post to retrieve.
 * @return {unknown} The result of the query.
 */
export const useGetPostById = (postId?: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId,
    });
};

/**
 * Retrieves the user's posts using the provided user ID.
 *
 * @param {string} userId - The ID of the user.
 * @return {unknown} The result of the query.
 */
export const useGetUserPosts = (userId?: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
        queryFn: () => getUserPosts(userId),
        enabled: !!userId,
    });
};

/**
 * A hook that fetches infinite posts using useInfiniteQuery.
 *
 * @return {QueryResult} The result of the query.
 */
export const useGetPosts = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: getInfinitePosts as any,
        getNextPageParam: (lastPage: any) => {
            // If there's no data, there are no more pages.
            if (lastPage && lastPage.documents.length === 0) {
                return null;
            }

            // Use the $id of the last document as the cursor.
            const lastId = lastPage.documents[lastPage?.documents.length - 1].$id;
            return lastId;
        },
    });
};

/**
 * Returns the search results for a given search term.
 *
 * @param {string} searchTerm - The term to search for in the posts.
 * @return {Query} The search results as a query object.
 */
export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => searchPosts(searchTerm),
        enabled: !!searchTerm,
    });
};


// ============================================================
// USER QUERIES
// ============================================================

/**
 * Retrieves the current user using a query.
 *
 * @return {QueryResult} The result of the query with the current user.
 */
export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    });
};

/**
 * Returns a query to get a list of users.
 *
 * @param {number} limit - The maximum number of users to retrieve.
 * @return {Query} The query object for getting users.
 */
export const useGetUsers = (limit?: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS],
        queryFn: () => getUsers(limit),
    });
};

/**
 * Retrieves user information by their ID.
 *
 * @param {string} userId - The ID of the user.
 * @return {unknown} The result of the query to get the user by ID.
 */
export const useGetUserById = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });
};
