import type { UserListingParams } from '@/hooks/query/user/use-user-listing';
import type { RootState } from '@/stores';
import type { Account } from '@/types/account';
import type { SignUpRequest } from '@/types/auth';
import type { ColumnsType } from 'antd/es/table';
import type { FormProps } from 'antd/lib';

import { DeleteOutlined, EditOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Flex, Form, Input, message, Modal, Select, Space, Table, Tag, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import BaseButton from '@/components/core/button';
import BaseInput from '@/components/core/input';
import { SecondaryButton } from '@/components/core/secondary-button';
import { queryClient } from '@/components/provider/query-provider';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/consts/common';
import { userKeys } from '@/consts/factory/user';
import { useDeleteAccount } from '@/hooks/mutate/auth/use-delete-account';
import { useSignUp } from '@/hooks/mutate/auth/use-signup';
import { useCategoriesListing } from '@/hooks/query/category/use-category-listing';
import { useUsersListing } from '@/hooks/query/user/use-user-listing';
import { useDebounce } from '@/hooks/use-debounce';
import { PATHS } from '@/utils/paths';
import { get, put } from '@/utils/service';

const { confirm } = Modal;

type FieldType = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

interface ModalState {
    type: 'add' | 'edit' | 'detail';
    open: boolean;
    id?: string;
}
const { Option } = Select;

const AdminStaffPage = () => {
    const navigate = useNavigate();
    const [params, setParams] = useState<UserListingParams>({ page: DEFAULT_PAGE, perPage: DEFAULT_PAGE_SIZE });
    const [search, setSearch] = useState('');

    const searchDebounce = useDebounce(search, 500);

    useEffect(() => {
        console.log(searchDebounce);
        setParams(() =>
            searchDebounce
                ? {
                      username: searchDebounce,
                      email: searchDebounce,
                      page: DEFAULT_PAGE,
                      perPage: DEFAULT_PAGE_SIZE,
                      status: 'ACTIVE',
                  }
                : {
                      page: DEFAULT_PAGE,
                      perPage: DEFAULT_PAGE_SIZE,
                      status: 'ACTIVE',
                  },
        );
    }, [searchDebounce]);

    const { data, isFetching } = useUsersListing({ params: { ...params } });
    const { data: _categories } = useCategoriesListing({ params: { page: DEFAULT_PAGE, perPage: 100 } });

    const validateConfirmPassword = (_: any, value: string) => {
        const password = form.getFieldValue('password');

        if (value && value !== password) {
            return Promise.reject(new Error('Passwords do not match!'));
        }

        return Promise.resolve();
    };

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
        // {
        //     title: 'Email',
        //     dataIndex: 'email',
        //     key: 'email',
        // },
        {
            title: 'Points',
            dataIndex: 'wallet',
            key: 'wallet',
            render: (_, record) => `${record?.wallet?.balance} MC`,
        },
        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
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

    const [isModalVisible, setIsModalVisible] = useState(false);
    const { mutate: signup } = useSignUp();

    const handleOk = () => {
        form.submit();
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const showModal = () => {
        setModalState({ type: 'add', open: true });
        form.resetFields();
    };

    const onFinish: FormProps<FieldType>['onFinish'] = async values => {
        // message.success('Registration account successfully');
        // console.log(selectedCategories);
        const req: SignUpRequest = {
            email: values.email,
            username: values.username,
            password: values.password,
            confirmPassword: values.confirmPassword,
            address: '',
            gender: '',
            role: 'STAFF',
            categoryList: [...selectedCategories],
        };

        signup(req, {
            onSuccess: result => {
                if (result) {
                    message.success('Registration account successfully');
                    form.resetFields();
                    setModalState({ type: 'add', open: false });
                    window.location.reload();
                    setSelectedCategories([]);
                }
            },
            onError: error => {
                message.error(error.message);
            },
        });
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
        // console.log('Failed:', errorInfo);
    };

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [modalState, setModalState] = useState<ModalState>({
        type: 'add',
        open: false,
    });

    const [form] = Form.useForm();
    const { loading } = useSelector((state: RootState) => state.global);

    const onCancelCreate = () => {
        setModalState({ type: 'add', open: false });
    };

    console.log(data);

    return (
        <Card>
            <Flex vertical gap={20}>
                <Flex justify="space-between" align="center">
                    <Typography.Title level={4}>Staffs</Typography.Title>
                    <SecondaryButton onClick={showModal}>Add New Staff</SecondaryButton>
                </Flex>
                <BaseInput.Search
                    placeholder="Type here to search..."
                    className="search"
                    size="large"
                    onChange={e => setSearch(e.target.value)}
                />

                <Table<Account>
                    loading={isFetching}
                    columns={columns}
                    dataSource={data?.filter(d => d.role.name === 'STAFF')}
                    rowKey="accountId"
                    pagination={{
                        showQuickJumper: true,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            </Flex>

            <Modal
                title="Add New Category"
                open={modalState.type === 'add' && modalState.open}
                footer={null}
                onCancel={onCancelCreate}
            >
                <Form form={form} initialValues={{}} onFinish={onFinish} onFinishFailed={onFinishFailed}>
                    <Form.Item<FieldType>
                        name="username"
                        rules={[
                            { required: true, message: 'Please input your username!' },
                            { min: 8, message: 'Username must be at least 8 characters' },
                            { max: 20, message: 'Username cannot exceed 20 characters' },
                        ]}
                    >
                        <Input size="large" width={100} placeholder="Username" prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item<FieldType>
                        name="email"
                        rules={[
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Please input a valid email!' },
                        ]}
                    >
                        <Input size="large" width={100} placeholder="Email" prefix={<MailOutlined />} />
                    </Form.Item>

                    <Form.Item<FieldType>
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 8, message: 'Password must be at least 8 characters' },
                            { max: 20, message: 'Passowrd cannot exceed 20 characters' },
                        ]}
                    >
                        <Input.Password size="large" width={100} placeholder="Password" prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item<FieldType>
                        name="confirmPassword"
                        rules={[
                            { required: true, message: 'Please input your confirm password!' },
                            {
                                validator: validateConfirmPassword, // Custom validator for password match
                            },
                        ]}
                    >
                        <Input.Password
                            size="large"
                            width={100}
                            placeholder="Confirm Password"
                            prefix={<LockOutlined />}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Select
                            mode="multiple"
                            placeholder="Select categories"
                            value={selectedCategories}
                            onChange={value => setSelectedCategories(value)}
                            style={{ width: '100%' }}
                        >
                            {_categories?.map(category => (
                                <Option key={category?.categoryId} value={category?.name}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <BaseButton
                            size="large"
                            className="auth-submit-button"
                            shape="round"
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Create a new account
                        </BaseButton>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default AdminStaffPage;
