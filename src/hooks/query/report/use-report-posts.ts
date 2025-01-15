import type { PaginationParams } from '@/types';
import type { FeedbackStatus } from '@/types/feedback/feedback';
import type { AccountReport, PostReport } from '@/types/report/report';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { request } from '@/apis/request';
import { reportKeys } from '@/consts/factory/report';

export type FeedbackListingParams = PaginationParams;

export type PostReportParams = PaginationParams & {
    reportPostStatusList?: FeedbackStatus[];
    username?: string;
};

type PostReportProps = {
    params: PostReportParams;
};

export const useReportPostsListing = ({ params }: PostReportProps) => {
    const fetchPostReport = async () => {
        const { entity } = await request<PostReport[]>(
            'get',
            '/post-report/getall/for-staff',
            {},
            {
                params,
                paramsSerializer: {
                    indexes: null,
                },
            },
        );

        return entity;
    };

    return useQuery<PostReport[]>({
        queryKey: reportKeys.reportPostListing(params),
        queryFn: fetchPostReport,
        placeholderData: keepPreviousData,
    });
};

export const useReportAccountListing = () => {
    const fetchAccountReport = async () => {
        const { entity } = await request<AccountReport[]>(
            'get',
            '/report-account/get-all',
            {},
            {
                paramsSerializer: {
                    indexes: null,
                },
            },
        );

        return entity;
    };

    return useQuery<AccountReport[]>({
        queryKey: reportKeys.reportAccountListing(),
        queryFn: fetchAccountReport,
        placeholderData: keepPreviousData,
    });
};
