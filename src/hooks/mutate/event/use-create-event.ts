import type { Event } from '@/types/event';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';

export const useCreateEvent = (options: UseMutationOptions<unknown, AxiosError<unknown>, Event> = {}) => {
    const createEvent = async (payload: Event) => {
        return axiosInstance.post('/event/create-event', payload);
    };

    return useMutation<unknown, AxiosError<unknown>, Event>({
        mutationKey: ['event', 'create'],
        mutationFn: payload => createEvent(payload),
        ...options,
    });
};

// export const useCreate = (options: UseMutationOptions<unknown, AxiosError<unknown>, Event> = {}) => {
//     const createReward = async (payload: Event) => {
//         return axiosInstance.post('/reward/create-reward', payload);
//     };

//     return useMutation<unknown, AxiosError<unknown>, Event>({
//         mutationKey: ['reward', 'create'],
//         mutationFn: payload => createReward(payload),
//         ...options,
//     });
// };
