import type { CreateTopicPayload } from '@/types/topic/topic';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';
import { CreateCategoryPayload } from '@/types/category/category';

export const useUpdateTopic = (
    id: string,
    options: UseMutationOptions<unknown, AxiosError<unknown>, CreateTopicPayload> = {},
) => {
    const updateCategory = async (payload: CreateTopicPayload) => {
        return axiosInstance.put(`/topic/update/${id}`, payload);
    };

    return useMutation<unknown, AxiosError<unknown>, CreateTopicPayload>({
        mutationKey: ['topic', 'update', id],
        mutationFn: payload => updateCategory(payload),
        ...options,
    });
};
