import type { UserListingParams } from '@/hooks/query/user/use-user-listing';
import type { Account } from '@/types/account';
import type { ColumnsType } from 'antd/es/table';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Flex, message, Modal, Space, Table, Tag, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BaseInput from '@/components/core/input';
import { queryClient } from '@/components/provider/query-provider';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, FULL_TIME_FORMAT } from '@/consts/common';
import { userKeys } from '@/consts/factory/user';
import { useDeleteAccount } from '@/hooks/mutate/auth/use-delete-account';
import { useUsersListing } from '@/hooks/query/user/use-user-listing';
import { useDebounce } from '@/hooks/use-debounce';
import { PATHS } from '@/utils/paths';
import { put } from '@/utils/service';

const { confirm } = Modal;

const AdminUserPage = () => {
    const navigate = useNavigate();
    const [params, setParams] = useState<UserListingParams>({ page: DEFAULT_PAGE, perPage: DEFAULT_PAGE_SIZE });
    const [search, setSearch] = useState('');

    const searchDebounce = useDebounce(search, 500);

    // useEffect(() => {
    //     setParams(() =>
    //         searchDebounce
    //             ? {
    //                   username: searchDebounce,
    //                   email: searchDebounce,
    //                   page: DEFAULT_PAGE,
    //                   perPage: DEFAULT_PAGE_SIZE,
    //               }
    //             : {
    //                   page: DEFAULT_PAGE,
    //                   perPage: DEFAULT_PAGE_SIZE,
    //               },
    //     );
    // }, [searchDebounce]);
    useEffect(() => {
        setParams(prev => ({ ...prev, username: searchDebounce, email: searchDebounce, page: DEFAULT_PAGE }));
    }, [searchDebounce]);
    // const { data, isFetching } = useUsersListing({ params: { ...params } });

    // useEffect(() => {
    //     console.log(data); // Log dữ liệu từ API
    // }, [data]);

    // useEffect(() => {
    //     console.log(searchDebounce); // Log giá trị searchDebounce
    // }, [searchDebounce]);

    const { data: usernameData, isFetching: isFetchingUsername } = useUsersListing({
        params: { username: searchDebounce, page: DEFAULT_PAGE, perPage: DEFAULT_PAGE_SIZE },
    });

    const { data: emailData, isFetching: isFetchingEmail } = useUsersListing({
        params: { email: searchDebounce, page: DEFAULT_PAGE, perPage: DEFAULT_PAGE_SIZE },
    });

    const combinedData = React.useMemo(() => {
        if (!usernameData || !emailData) return [];
        const uniqueData = [...usernameData, ...emailData].reduce((acc, current) => {
            if (!acc.find(item => item.accountId === current.accountId)) {
                acc.push(current);
            }

            return acc;
        }, [] as Account[]);

        return uniqueData;
    }, [usernameData, emailData]);

    const isFetching = isFetchingUsername || isFetchingEmail;

    const { mutate: deleteAccount, isPending: isPendingDeleteTag } = useDeleteAccount();

    const handleDelete = (id: string) => {
        confirm({
            title: 'Do you want to delete this user?',
            onOk() {
                deleteAccount(id, {
                    onSuccess: () => {
                        message.success('User deleted successfully');
                        queryClient.invalidateQueries({
                            queryKey: userKeys.listing(),
                        });
                    },
                    onError: () => {
                        message.error('Tag deletion failed');
                    },
                });
            },
            onCancel() {},
        });
    };

    const handleUpdateStatus = (account: Account) => {
        confirm({
            title: 'Do you want to update status of this user?',
            onOk() {
                const body = { status: account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };

                put(`/account/update-status/${account.accountId}`, body).then(resp => {
                    if (resp.status === 200) {
                        queryClient.invalidateQueries({
                            queryKey: userKeys.listing(),
                        });
                    }
                });
                message.success('User status updated successfully');
            },
            onCancel() {},
        });
    };

    const columns: ColumnsType<Account> = [
        {
            title: 'User Name',
            dataIndex: 'username',
            key: 'username',
            render: (_, record) => (
                <Typography.Text
                    style={{
                        color: '#1890ff',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                        navigate(PATHS.USER_PROFILE.replace(':id', record.accountId));
                    }}
                >
                    {record.username}
                </Typography.Text>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Points',
            dataIndex: 'wallet',
            key: 'wallet',
            render: (_, record) => `${record?.wallet?.balance} MC`,
            sorter: (a, b) => (a?.wallet?.balance ?? 0) - (b?.wallet?.balance ?? 0),
        },
        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            render: text => moment(text).format(FULL_TIME_FORMAT),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Tag bordered={false} color={record?.status === 'ACTIVE' ? 'green' : 'red'}>
                    {record.status}
                </Tag>
            ),
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
        {
            title: 'Actions',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            handleUpdateStatus(record);
                        }}
                    />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record?.accountId)} />
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Flex vertical gap={20}>
                <Typography.Title level={4}>Users</Typography.Title>

                <BaseInput.Search
                    placeholder="Type here to search..."
                    className="search"
                    size="large"
                    onChange={e => setSearch(e.target.value)}
                />

                <Table<Account>
                    loading={isFetching}
                    columns={columns}
                    dataSource={
                        combinedData?.filter(
                            d =>
                                d.role.name === 'USER' &&
                                (d.status === 'ACTIVE' || d.status === 'INACTIVE') &&
                                (!searchDebounce ||
                                    d.username?.toLowerCase().includes(searchDebounce.toLowerCase()) || // Kiểm tra username
                                    d.email?.toLowerCase().includes(searchDebounce.toLowerCase())), // Kiểm tra email
                        ) || []
                    }
                    rowKey="accountId"
                    pagination={{
                        showQuickJumper: true,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            </Flex>
        </Card>
    );
};

export default AdminUserPage;
