import type { CommentCreatePayload, CreateReplyPayload } from '@/types/comment/comment';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import axiosInstance from '@/apis/request';

export const useCreateComment = (
    options: UseMutationOptions<unknown, AxiosError<unknown>, CommentCreatePayload> = {},
) => {
    const createComment = async (payload: CommentCreatePayload) => {
        return axiosInstance.post('/comment/create', payload);
    };

    return useMutation<unknown, AxiosError<unknown>, CommentCreatePayload>({
        mutationKey: ['comment', 'create'],
        mutationFn: payload => createComment(payload),
        ...options,
    });
};

export const useCreateReply = () => {
    const createReply = async (payload: CreateReplyPayload) => {
        return axiosInstance.post('/comment/create/reply', payload);
    };

    return useMutation<unknown, AxiosError<unknown>, CreateReplyPayload>({
        mutationKey: ['comment', 'create', 'reply'],
        mutationFn: payload => createReply(payload),
    });
};
