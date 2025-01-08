import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';

export const useResetPassword = (
    options: UseMutationOptions<
        unknown,
        AxiosError<unknown>,
        { email: string; password: string; confirmPassword: string }
    > = {},
) => {
    const resetPassword = async (payload: { email: string; password: string; confirmPassword: string }) => {
        return axiosInstance.put(`/authenticate/forget-password?email=${payload.email}`, {
            password: payload.password,
            confirmPassword: payload.confirmPassword,
        });
    };

    return useMutation<unknown, AxiosError<unknown>, { email: string; password: string; confirmPassword: string }>({
        mutationKey: ['auth', 'reset-password'],
        mutationFn: payload => resetPassword(payload),
        ...options,
    });
};
