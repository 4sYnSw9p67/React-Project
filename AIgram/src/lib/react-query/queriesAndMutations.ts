import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { createPost, createUserAccount, deleteSavedPost, getCurrentUser, getRecentPosts, getUsers, likePost, savePost, signInAccount, signOutAccount, updatePost } from '../appwrite/api';
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

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    });
};

export const useGetUsers = (limit?: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS],
        queryFn: () => getUsers(limit),
    });
};
