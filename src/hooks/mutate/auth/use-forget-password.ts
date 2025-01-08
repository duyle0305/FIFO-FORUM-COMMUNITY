import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';

export const useForgetPassword = (
    options: UseMutationOptions<unknown, AxiosError<unknown>, { email: string }> = {},
) => {
    const forgetPassword = async (payload: { email: string }) => {
        return axiosInstance.post(`/authenticate/send/email/forget-password?email=${payload.email}`);
    };

    return useMutation<unknown, AxiosError<unknown>, { email: string }>({
        mutationKey: ['auth', 'forget-password'],
        mutationFn: payload => forgetPassword(payload),
        ...options,
    });
};
