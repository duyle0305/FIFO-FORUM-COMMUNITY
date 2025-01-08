import type { Event } from '@/types/event';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';

export const useUpdateEvent = (id: string, options: UseMutationOptions<unknown, AxiosError<unknown>, Event> = {}) => {
    const updateReward = async (payload: Event) => {
        return axiosInstance.put(`/event/update/${id}`, payload);
    };

    return useMutation<unknown, AxiosError<unknown>, Event>({
        mutationKey: ['reward', 'update', id],
        mutationFn: payload => updateReward(payload),
        ...options,
    });
};
