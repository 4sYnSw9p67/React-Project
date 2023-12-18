import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { createUserAccount, signInAccount, signOutAccount } from '../appwrite/api';
import { NewUser } from '@/types';

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

