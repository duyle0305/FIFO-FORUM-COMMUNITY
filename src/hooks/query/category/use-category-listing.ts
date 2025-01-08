import type { PaginationParams } from '@/types';
import type { Category } from '@/types/category/category';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import axiosInstance, { request } from '@/apis/request';
import { categoryKeys } from '@/consts/factory/category';
import { Response } from '@/types';

export type CategoryListingParams = PaginationParams & { categoryName?: string };

type CategoryListingProps = {
    params: CategoryListingParams;
    enabled?: boolean;
};

export const useCategoriesListing = ({ params, enabled }: CategoryListingProps) => {
    const fetchCategories = async (): Promise<Category[]> => {
        const { entity } = await request<Category[]>('get', '/category/getall', params, {
            paramsSerializer: {
                indexes: null,
            },
        });

        return entity;
    };

    return useQuery<Category[]>({
        queryKey: categoryKeys.listing(params),
        queryFn: fetchCategories,
        placeholderData: keepPreviousData,
        enabled,
    });
};

export const useCategoriesListingForStaff = ({ params, enabled }: CategoryListingProps) => {
    const fetchCategories = async (): Promise<Category[]> => {
        const { entity } = await request<Category[]>('get', '/category/getall/for-staff', params, {
            paramsSerializer: {
                indexes: null,
            },
        });

        return entity;
    };

    return useQuery<Category[]>({
        queryKey: categoryKeys.listingStaffs(params),
        queryFn: fetchCategories,
        placeholderData: keepPreviousData,
        enabled,
    });
};

export const useCategory = (id: string) => {
    const fetchCategory = async (): Promise<Category> => {
        const { entity } = await request<Category>('get', `/category/get/${id}`);

        return entity;
    };

    return useQuery<Category>({
        queryKey: categoryKeys.get(id),
        queryFn: fetchCategory,
        placeholderData: keepPreviousData,
        enabled: !!id,
    });
};
