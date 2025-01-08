import type { RootState } from '@/stores';

import '../index.less';

import {
    CaretDownFilled,
    EyeInvisibleOutlined,
    EyeTwoTone,
    KeyOutlined,
    LogoutOutlined,
    MoneyCollectOutlined,
    UserOutlined,
    WalletOutlined,
} from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import {
    Avatar,
    Badge,
    Button,
    Dropdown,
    Flex,
    Form,
    Input,
    Layout,
    message,
    Modal,
    notification,
    theme as antTheme,
    Typography,
} from 'antd';
import React, { type FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Logo from '/public/ftech-logo.svg';
import BaseInput from '@/components/core/input';
import { SOCKET_EVENT } from '@/consts/common';
import { bookmarkKeys } from '@/consts/factory/bookmark';
import { postKeys } from '@/consts/factory/post';
import { upvoteKeys } from '@/consts/factory/upvote';
import { useNotifications } from '@/hooks/query/notification/use-notifications';
import { useDebounce } from '@/hooks/use-debounce';
import { loggout } from '@/stores/account';
import { PATHS } from '@/utils/paths';
import { put } from '@/utils/service';
import { useWebSocket } from '@/utils/socket';

import AvatarPlaceholder from '../../../assets/logos/FIFO logo.png';
import NotificationIcon from './components/notification';

const { Header } = Layout;

interface HeaderProps {
    collapsed: boolean;
    toggle: () => void;
}

const HeaderComponent: FC<HeaderProps> = ({ collapsed, toggle }) => {
    const { logged, device, accountInfo } = useSelector((state: RootState) => state.account);
    const navigate = useNavigate();
    const token = antTheme.useToken();
    const dispatch = useDispatch();
    const [keyword, setKeyword] = useState('  ');
    const [openSearch, setOpenSearch] = useState(false);
    const socket = useWebSocket();
    const queryClient = useQueryClient();

    const [api, contextHolder] = notification.useNotification();

    const openNotification = (title: string, description: string) => {
        api.open({
            message: title,
            description,
        });
    };

    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleChangePasswordClick = () => {
        form.setFieldsValue({ email: accountInfo?.email });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        form.resetFields();
        setIsModalVisible(false);
    };

    const [form] = Form.useForm();

    const searchKeyword = useDebounce(keyword, 500);

    const handleSaveChanges = async () => {
        try {
            const values = await form.validateFields();
            // Call API with form values
            const body = {
                currentPassword: values?.currentPassword,
                password: values?.password,
                confirmPassword: values?.confirmPassword,
            };

            await put(`/authenticate/change-password?email=${accountInfo?.email}`, body);

            message.success('Password changed successfully');
            form.resetFields();
            setIsModalVisible(false);
        } catch (error: any) {
            console.log('Failed to change password:', error);
            message.error(error.password || error.confirmPassword || 'Failed to change password');
        }
    };

    const { data: notifications } = useNotifications();

    const resetKeyword = () => {
        setKeyword('  ');
    };

    const onLogout = async () => {
        localStorage.clear();
        dispatch(loggout());
        navigate(PATHS.SIGNIN);
    };

    const toLogin = () => {
        navigate(PATHS.SIGNIN);
    };

    const toProfile = () => {
        navigate(PATHS.PROFILE);
    };

    const toHome = () => {
        navigate(PATHS.HOME);
    };

    const toWallet = () => {
        navigate(PATHS.WALLET);
    };

    const toDeposit = () => {
        navigate(PATHS.DEPOSIT);
    };

    const handleNavigateWithParams = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            navigate(`${PATHS.SEARCH}?keyword=${keyword}`);
        }
    };

    useEffect(() => {
        socket.on('connect', () => {
            console.log('connected');
        });

        socket.on(SOCKET_EVENT.COMMENT, () => {
            queryClient.invalidateQueries({
                queryKey: postKeys.listing(),
            });
            queryClient.invalidateQueries({
                queryKey: bookmarkKeys.listing(),
            });
        });

        socket.on(SOCKET_EVENT.UPDATE_DELETE_COMMENT, () => {
            queryClient.invalidateQueries({
                queryKey: postKeys.listing(),
            });
            queryClient.invalidateQueries({
                queryKey: bookmarkKeys.listing(),
            });
        });

        socket.on(SOCKET_EVENT.LIKE, () => {
            queryClient.invalidateQueries({
                queryKey: upvoteKeys.listing(),
            });
            queryClient.invalidateQueries({
                queryKey: postKeys.listing(),
            });
            queryClient.invalidateQueries({
                queryKey: bookmarkKeys.listing(),
            });
        });

        socket.on(SOCKET_EVENT.DISLIKE, () => {
            queryClient.invalidateQueries({
                queryKey: upvoteKeys.listing(),
            });
            queryClient.invalidateQueries({
                queryKey: postKeys.listing(),
            });
            queryClient.invalidateQueries({
                queryKey: bookmarkKeys.listing(),
            });
        });

        socket.on(SOCKET_EVENT.NOTIFICATION, data => {
            console.log('notification', data);
        });

        socket.on('disconnect', () => {
            console.log('disconnected');
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    return (
        <Header className="layout-page-header bg-2" style={{ backgroundColor: token.token.colorBgContainer }}>
            {contextHolder}
            {device !== 'MOBILE' && (
                <div className="logo" style={{ width: collapsed ? 80 : 200, cursor: 'pointer' }} onClick={toHome}>
                    <img src={Logo} alt="logo.svg" style={{ marginRight: collapsed ? '2px' : '20px' }} />
                </div>
            )}

            <div className="layout-page-header-main">
                <div onClick={toggle}>
                    {/* <span id="sidebar-trigger">{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}</span> */}
                </div>

                <div className="search-container">
                    {/* <Dropdown
                        open={false}
                        menu={{
                            items: searchDropdownItems,
                        }} 
                        items={items.filter(Boolean)}
                    > */}
                    <BaseInput.Search
                        placeholder="Type here to search..."
                        className="search"
                        onChange={e => setKeyword(encodeURIComponent(e.target.value))}
                        // onBlur={() => setOpenSearch(false)}
                        // onFocus={() => setOpenSearch(true)}
                        onKeyDown={handleNavigateWithParams}
                        onSearch={() => navigate(`${PATHS.SEARCH}?keyword=${keyword}`)}
                    />
                    {/* </Dropdown> */}
                </div>

                <div className="actions">
                    {logged && accountInfo ? (
                        <Flex gap={20} align="center">
                            <Badge
                                count={
                                    // notifications &&
                                    // notifications?.length > 0 &&
                                    // notifications?.filter(noti => !noti.read).length
                                    notifications && notifications.length > 0
                                        ? notifications.filter(noti => !noti.read).length
                                        : null // hoặc 0
                                }
                            >
                                <NotificationIcon />
                            </Badge>
                            <Dropdown
                                menu={{
                                    items: [
                                        accountInfo?.role?.name !== 'STAFF' && accountInfo?.role?.name !== 'ADMIN'
                                            ? {
                                                  key: '0',
                                                  icon: <WalletOutlined />,
                                                  label: <span onClick={toWallet}>Wallet</span>,
                                              }
                                            : null,
                                        accountInfo?.role?.name !== 'STAFF'
                                            ? {
                                                  key: '1',
                                                  icon: <MoneyCollectOutlined />,
                                                  label: <span onClick={toDeposit}>Deposit</span>,
                                              }
                                            : null,
                                        accountInfo?.role?.name !== 'ADMIN'
                                            ? {
                                                  key: '2',
                                                  icon: <UserOutlined />,
                                                  label: <span onClick={toProfile}>Profile</span>,
                                              }
                                            : null,

                                        {
                                            key: '3',
                                            icon: <KeyOutlined />,
                                            label: <span onClick={handleChangePasswordClick}>Change Password</span>,
                                        },
                                        {
                                            key: '4',
                                            icon: <LogoutOutlined />,
                                            label: <span onClick={onLogout}>Logout</span>,
                                        },
                                    ],
                                }}
                            >
                                <span className="user-action" style={{ fontSize: '16px' }}>
                                    <Flex align="center" gap={10}>
                                        <Avatar
                                            size={48}
                                            src={accountInfo?.avatar || AvatarPlaceholder}
                                            className="user-avatar"
                                            alt="avatar"
                                        />
                                        <Typography.Text style={{ fontWeight: 500, fontSize: '16px' }}>
                                            {accountInfo.username}
                                        </Typography.Text>
                                        <CaretDownFilled style={{ fontSize: '16px' }} />
                                    </Flex>
                                </span>
                            </Dropdown>
                        </Flex>
                    ) : (
                        <span style={{ cursor: 'pointer' }} onClick={toLogin}>
                            Login
                        </span>
                    )}
                </div>
            </div>
            <Modal
                title="Change Password"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Please enter your  current password' }]}
                    >
                        <Input.Password
                            placeholder="Current Password"
                            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>
                    <Form.Item
                        label="New Password"
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password
                            placeholder="New Password"
                            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }

                                    return Promise.reject(new Error('The two passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Confirm Password"
                            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Header>
    );
};

export default HeaderComponent;
