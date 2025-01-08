import type { RootState } from '@/stores';
import type { PostModalType } from '@/stores/post';
import type { ReportAccountReasons } from '@/types/report/report';

import { Button, Card, Divider, Flex, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import PageBreadcrumbs from '@/components/core/page-breadcrumbs';
import { PostItem } from '@/components/post/post-item';
import { queryClient } from '@/components/provider/query-provider';
import { SOCKET_EVENT } from '@/consts/common';
import { postKeys } from '@/consts/factory/post';
import { useCreateReportPost } from '@/hooks/mutate/report/use-create-report';
import { useGetPost } from '@/hooks/query/post/use-get-post';
import { useMessage } from '@/hooks/use-message';
import { setPost } from '@/stores/post';
import { reportAccountReasons } from '@/types/report/report';
import { useWebSocket } from '@/utils/socket';

import { UpdatePost } from '../post/components/update-post';
import ReportReason from '../user-profile/components/report-reason';

const PostDetailPage = () => {
    const socket = useWebSocket();
    const { id } = useParams();

    const dispatch = useDispatch();
    const { modal } = useSelector((state: RootState) => state.post);

    const { success } = useMessage();

    const { data } = useGetPost(id || '');

    const [selectedReason, setSelectedReason] = useState<ReportAccountReasons>();

    const { mutate: createReport, isPending: isPendingCreateReport } = useCreateReportPost(id || '');

    const handleCancel = (type: PostModalType) => {
        dispatch(setPost({ modal: { open: false, type } }));
    };

    const handleReportAccount = () => {
        if (!selectedReason) {
            return;
        }

        createReport(selectedReason, {
            onSuccess: () => {
                success('Reported successfully!');
                setSelectedReason(undefined);
                dispatch(setPost({ modal: { open: false, type: 'report' } }));
            },
        });
    };

    useEffect(() => {
        socket.on(SOCKET_EVENT.LIKE, () => {
            queryClient.invalidateQueries({
                queryKey: postKeys.get(id || ''),
            });
        });

        socket.on(SOCKET_EVENT.DISLIKE, () => {
            queryClient.invalidateQueries({
                queryKey: postKeys.get(id || ''),
            });
        });

        return () => {
            socket.off(SOCKET_EVENT.COMMENT);
        };
    }, []);

    return (
        <Flex vertical gap={20}>
            <Card>
                <PageBreadcrumbs />
                <Divider />
            </Card>
            {data && <PostItem data={data} showComment={true} />}
            <Modal
                title="Report"
                open={modal.open && modal.type === 'report'}
                onCancel={() => handleCancel('report')}
                footer={null}
            >
                {reportAccountReasons.map((reason, index) => (
                    <ReportReason
                        key={index}
                        reason={reason}
                        selectedReason={selectedReason}
                        setSelectedReason={setSelectedReason}
                    />
                ))}

                <Flex justify="center">
                    <Button
                        type="primary"
                        onClick={handleReportAccount}
                        loading={isPendingCreateReport}
                        disabled={!selectedReason}
                    >
                        Submit
                    </Button>
                </Flex>
            </Modal>

            <UpdatePost onCancel={() => handleCancel('update')} />
        </Flex>
    );
};

export default PostDetailPage;
