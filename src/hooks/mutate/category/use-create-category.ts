import type { CreateCategoryPayload } from '@/types/category/category';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';

export const useCreateCategory = (
    options: UseMutationOptions<unknown, AxiosError<unknown>, CreateCategoryPayload> = {},
) => {
    const createCategory = async (payload: CreateCategoryPayload) => {
        return axiosInstance.post('/category/create', payload);
    };

    return useMutation<unknown, AxiosError<unknown>, CreateCategoryPayload>({
        mutationKey: ['category', 'create'],
        mutationFn: payload => createCategory(payload),
        ...options,
    });
};
