import type { SignInRequest } from '@/types/auth';
import type { DefaultError, UseMutationOptions } from '@tanstack/react-query';

import { useMutation } from '@tanstack/react-query';

import { apiSignIn } from '@/apis/auth.api';

export const useSignIn = (options: UseMutationOptions<boolean, DefaultError, SignInRequest> = {}) => {
    const signIn = async (payload: SignInRequest) => {
        const { username } = payload;

        return apiSignIn(payload);
    };

    return useMutation<any, DefaultError, SignInRequest>({
        mutationKey: ['auth', 'signin'],
        mutationFn: signIn,
        ...options,
    });
};
