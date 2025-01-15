import type { SignUpRequest } from '@/types/auth';
import type { DefaultError, UseMutationOptions } from '@tanstack/react-query';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';

export const useSignUp = (options: UseMutationOptions<boolean, DefaultError, SignUpRequest> = {}) => {
    const signIn = async (payload: SignUpRequest) => {
        return axiosInstance.post('/authenticate/sign-up', payload);
    };

    return useMutation<any, DefaultError, SignUpRequest>({
        mutationKey: ['auth', 'signup'],
        mutationFn: signIn,
        ...options,
    });
};
