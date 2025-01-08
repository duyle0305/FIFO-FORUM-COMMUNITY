import { Card, Divider, Empty } from 'antd';
import { useEffect } from 'react';

import PageBreadcrumbs from '@/components/core/page-breadcrumbs';
import { PostItem } from '@/components/post/post-item';
import { useBookmarkListing } from '@/hooks/query/bookmark/use-bookmark-listing';

import { PostWrapper } from '../post/layout/post-wrapper';

const BookmarksPage = () => {
    const { data } = useBookmarkListing();

    return (
        <PostWrapper showBreadcrumb={false}>
            {data ? data.map(post => <PostItem data={post} key={post.postId} />) : <Empty />}
        </PostWrapper>
    );
};

export default BookmarksPage;
