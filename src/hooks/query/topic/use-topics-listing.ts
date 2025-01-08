import type { PaginationParams } from '@/types';
import type { Topic } from '@/types/topic/topic';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import axiosInstance, { request } from '@/apis/request';
import { topicKeys } from '@/consts/factory/topic';
import { Response } from '@/types';

export type TopicListingParams = PaginationParams & {
    categoryId?: string;
    name?: string;
};

type TopicListingProps = {
    params: TopicListingParams;
};

export const useTopicsListing = ({ params }: TopicListingProps) => {
    const fetchTopics = async (): Promise<Topic[]> => {
        const { entity } = await request<Topic[]>('get', '/topic/getall', params, {
            paramsSerializer: {
                indexes: null,
            },
        });

        return entity;
    };

    return useQuery<Topic[]>({
        queryKey: topicKeys.listing(params),
        queryFn: fetchTopics,
        placeholderData: keepPreviousData,
    });
};

export const useTopic = (id: string) => {
    const fetchTopic = async (): Promise<Topic> => {
        const { entity } = await request<Topic>('get', `/topic/get/${id}`);

        return entity;
    };

    return useQuery<Topic>({
        queryKey: topicKeys.get(id),
        queryFn: fetchTopic,
    });
};
