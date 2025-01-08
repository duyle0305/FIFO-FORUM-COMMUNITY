import type { RootState } from '@/stores';
import type { Account } from '@/types/account';
import type { Follow } from '@/types/follow';

import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Flex, Image, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { followKeys } from '@/consts/factory/follow';
import { useCreateFollow } from '@/hooks/mutate/follow/use-create-follow';
import { useDeleteFollow } from '@/hooks/mutate/follow/use-delete-follow';
import { useToggleFollow } from '@/hooks/mutate/follow/use-toggle-follow';
import { useMessage } from '@/hooks/use-message';
import { setAccountState } from '@/stores/account';
import { PATHS } from '@/utils/paths';

import AvatarPlaceholder from '../../../assets/logos/FIFO logo.png';

interface RecommendedItemProps {
    account: Account;
    follows?: Follow[];
}

export const RecommendedItem = ({ account, follows }: RecommendedItemProps) => {
    const navigate = useNavigate();

    const { accountInfo } = useSelector((state: RootState) => state.account);

    const dispatch = useDispatch();

    const { mutate: toggleFollow } = useToggleFollow();

    const { error } = useMessage();
    const queryClient = useQueryClient();

    const handleToggleFollow = () => {
        toggleFollow(account?.accountId, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: followKeys.listing(),
                });
                queryClient.invalidateQueries({
                    queryKey: followKeys.recommendations(),
                });
            },
            onError: err => {
                error(err.message);
            },
        });
    };

    return (
        <Flex align="flex-start" gap={10} justify="space-between" onClick={() => navigate(PATHS.RECOMMENDATIONS)}>
            <Flex
                gap={10}
                style={{ cursor: 'pointer' }}
                onClick={e => {
                    e.stopPropagation();
                    navigate(`/user-profile/${account?.accountId}`);
                    dispatch(setAccountState({ userInfo: account }));
                }}
            >
                <Image
                    style={{
                        borderRadius: 10,
                        width: 58,
                        height: 58,
                        objectFit: 'cover',
                        boxShadow: '0px 3px 4px 0px #FA89240F',
                    }}
                    src={account?.avatar || AvatarPlaceholder}
                    alt="creator"
                    preview={false}
                />

                <Flex vertical style={{ minWidth: 94 }}>
                    <Typography.Text>{account?.username}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {account?.handle}
                    </Typography.Text>
                </Flex>
            </Flex>

            {follows?.find(follow => follow?.followee?.accountId === account?.accountId) ? (
                <Button
                    type="primary"
                    size="small"
                    onClick={e => {
                        e.stopPropagation();
                        handleToggleFollow();
                    }}
                >
                    <MinusOutlined style={{ fontSize: 12, marginRight: 2 }} />
                    Unfollow
                </Button>
            ) : (
                <Button
                    type="primary"
                    size="small"
                    onClick={e => {
                        e.stopPropagation();
                        handleToggleFollow();
                    }}
                >
                    <PlusOutlined style={{ fontSize: 12, marginRight: 2 }} />
                    Follow
                </Button>
            )}
        </Flex>
    );
};
