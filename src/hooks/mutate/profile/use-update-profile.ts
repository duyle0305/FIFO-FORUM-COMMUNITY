import type { UpdateProfilePayload } from '@/types/account';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';

export const useUpdateProfile = (
    options: UseMutationOptions<unknown, AxiosError<unknown>, UpdateProfilePayload> = {},
) => {
    const updateProfile = async (payload: UpdateProfilePayload) => {
        return axiosInstance.put(`/account/update-info`, payload);
    };

    return useMutation<unknown, AxiosError<unknown>, UpdateProfilePayload>({
        mutationKey: ['profile', 'update'],
        mutationFn: updateProfile,
        ...options,
    });
};
