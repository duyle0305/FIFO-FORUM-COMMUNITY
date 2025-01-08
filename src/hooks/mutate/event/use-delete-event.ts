import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';

export const useDeleteEvent = (options: UseMutationOptions<unknown, AxiosError<unknown>, string> = {}) => {
    const deleteEvent = async (id: string) => {
        return axiosInstance.delete(`/event/delete/${id}`);
    };

    return useMutation<unknown, AxiosError<unknown>, string>({
        mutationKey: ['event', 'delete'],
        mutationFn: id => deleteEvent(id),
        ...options,
    });
};
