import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { createUserAccount, signInAccount } from '../appwrite/api';
import { NewUser } from '@/types';


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
