import type { RootState } from '@/stores';
import type { CommentCreatePayload, CreateReplyPayload, TComment } from '@/types/comment/comment';

import { Comment } from '@ant-design/compatible';
import { CloseOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, SendOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Dropdown, Flex, Form, Input, InputRef, List, Modal, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOnClickOutside } from 'usehooks-ts';

import { DATE_FORMAT, FULL_TIME_FORMAT, SOCKET_EVENT } from '@/consts/common';
import { commentKeys } from '@/consts/factory/comment';
import { postKeys } from '@/consts/factory/post';
import { useCreateReply } from '@/hooks/mutate/comment/use-create-comment';
import { useDeleteComment } from '@/hooks/mutate/comment/use-delete-comment';
import { useUpdateComment } from '@/hooks/mutate/comment/use-update-comment';
import { useCommentByPost } from '@/hooks/query/comment/use-comment-by-post';
import { useMessage } from '@/hooks/use-message';
import { setAccountState } from '@/stores/account';
import dayjsConfig from '@/utils/dayjs';
import { useWebSocket } from '@/utils/socket';

import AvatarPlaceholder from '../../assets/logos/FIFO logo.png';

const { confirm } = Modal;

interface PostCommentListProps {
    postId: string;
    isShown: boolean;
}

const PostCommentList = ({ postId, isShown }: PostCommentListProps) => {
    const socket = useWebSocket();
    const inputRef = useRef<any>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const [form] = Form.useForm();
    const [formReply] = Form.useForm();

    const [commentId, setCommentId] = useState<string | null>(null);
    // const [isEdit, setIsEdit] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [isEditReply, setIsEditReply] = useState(false);
    const [isShowReply, setIsShowReply] = useState(false);
    const [isCommentHighlighted, setIsCommentHighlighted] = useState(false);

    const { accountInfo } = useSelector((state: RootState) => state.account);

    const { success } = useMessage();
    const queryClient = useQueryClient();

    const { data: comments } = useCommentByPost(postId, isShown);
    const { mutate: deleteComment } = useDeleteComment();
    const { mutate: updateComment } = useUpdateComment();
    const { mutate: createReply } = useCreateReply();

    useEffect(() => {
        socket.on(SOCKET_EVENT.UPDATE_DELETE_COMMENT, () => {
            queryClient.invalidateQueries({
                queryKey: commentKeys.byPost(postId),
            });
        });

        return () => {
            socket.off(SOCKET_EVENT.COMMENT);
        };
    }, []);

    const searchCommentId = searchParams.get('commentId');

    useEffect(() => {
        console.log('searchCommentId', searchCommentId);

        // Scroll to comment

        if (searchCommentId) {
            setIsCommentHighlighted(true);
            const commentElement = document.getElementById(searchCommentId);

            console.log('commentElement', commentElement);

            if (commentElement) {
                commentElement.scrollIntoView({ behavior: 'smooth' });
            }
        }

        const timeout = setTimeout(() => {
            setIsCommentHighlighted(false);
        }, 3000);

        return () => {
            clearTimeout(timeout);
        };
    }, [searchCommentId, comments]);

    if (!comments) {
        return null;
    }

    // const isAllowShowActions = (comment: TComment) => {
    //     return (
    //         accountInfo?.role?.name === 'ADMIN' ||
    //         accountInfo?.role?.name === 'STAFF' ||
    //         comment?.account?.accountId === accountInfo?.accountId
    //     );
    // };
    const isAllowShowActions = (comment: TComment) => {
        const isAdminOrStaff = accountInfo?.role?.name === 'ADMIN' || accountInfo?.role?.name === 'STAFF';
        const isOwner = comment?.account?.accountId === accountInfo?.accountId;

        // Nếu là ADMIN hoặc STAFF, chỉ cho phép xóa
        if (isAdminOrStaff) {
            return true; // Chỉ cho phép xóa
        }

        // Nếu là chủ sở hữu, cho phép cả chỉnh sửa và xóa
        return isOwner;
    };

    const handleDelete = (comment: TComment) => {
        confirm({
            title: 'Are you sure you want to delete this comment?',
            onOk() {
                deleteComment(comment?.commentId, {
                    onSuccess: () => {
                        success('Delete comment successfully');
                        queryClient.invalidateQueries({
                            queryKey: postKeys.listing(),
                        });
                        // queryClient.invalidateQueries({
                        //     queryKey: commentKeys.byPost(postId),
                        // });
                    },
                });
            },
        });
    };

    // const handleUpdate = (id: string) => {
    //     setIsEdit(true);
    //     setCommentId(id);
    // };
    // const handleUpdate = (id: string) => {
    //     setEditingCommentId(id);
    // };
    const handleUpdate = (id: string) => {
        if (isShowReply) {
            confirm({
                title: 'Are you sure you want to cancel your reply?',
                onOk() {
                    setIsShowReply(false);
                    setCommentId(null);
                    setEditingCommentId(id);
                },
            });
        } else {
            setEditingCommentId(id);
        }
    };

    const handleUpdateReply = (id: string) => {
        setIsEditReply(true);
        setCommentId(id);
    };

    // const handleClickOutside = () => {
    //     setIsEdit(false);
    // };
    const handleClickOutside = () => {
        if (editingCommentId) {
            confirm({
                title: 'Are you sure you want to cancel editing?',
                onOk() {
                    setEditingCommentId(null);
                },
            });
        }
    };

    const handleClickOutsideReply = () => {
        setIsShowReply(false);
    };

    // const onFinish = (values: CommentCreatePayload) => {
    //     updateComment(
    //         {
    //             content: values.content,
    //             id: commentId as string,
    //         },
    //         {
    //             onSuccess: () => {
    //                 setIsEdit(false);
    //                 setIsEditReply(false);
    //                 queryClient.invalidateQueries({
    //                     queryKey: postKeys.listing(),
    //                 });
    //                 queryClient.invalidateQueries({
    //                     queryKey: commentKeys.byPost(postId),
    //                 });
    //             },
    //         },
    //     );
    // };
    const onFinish = (values: CommentCreatePayload) => {
        updateComment(
            {
                content: values.content,
                id: editingCommentId as string,
            },
            {
                onSuccess: () => {
                    setEditingCommentId(null);
                    queryClient.invalidateQueries({
                        queryKey: postKeys.listing(),
                    });
                    queryClient.invalidateQueries({
                        queryKey: commentKeys.byPost(postId),
                    });
                },
            },
        );
    };

    // const handleShowReply = (commentId: string) => {
    //     setIsShowReply(true);
    //     setCommentId(commentId);
    // };

    const handleShowReply = (commentId: string) => {
        if (editingCommentId) {
            confirm({
                title: 'Do you want to cancel editing your comment?',
                onOk() {
                    setEditingCommentId(null);
                    setIsShowReply(true);
                    setCommentId(commentId);
                    formReply.resetFields();
                },
            });
        } else if (formReply.getFieldValue('content')) {
            confirm({
                title: 'You have unsaved reply content. Discard and start a new reply?',
                onOk() {
                    formReply.resetFields();
                    setIsShowReply(true);
                    setCommentId(commentId);
                },
            });
        } else {
            setIsShowReply(true);
            setCommentId(commentId);
        }
    };

    const onFinishReply = (values: CreateReplyPayload) => {
        createReply(
            {
                ...values,
                postId,
                parentCommentId: commentId as string,
            },
            {
                onSuccess: () => {
                    setIsShowReply(false);
                    setCommentId(null);
                    formReply.resetFields();
                    queryClient.invalidateQueries({
                        queryKey: postKeys.listing(),
                    });
                    queryClient.invalidateQueries({
                        queryKey: commentKeys.byPost(postId),
                    });
                },
            },
        );
    };

    const renderShowReplyReplyRecursive = (comment: TComment) => {
        if (comment?.replies?.length) {
            return (
                <List
                    //  key={cj?.commentId}
                    className="comment-list"
                    header={`${comment?.replies?.length} replies`}
                    itemLayout="horizontal"
                    dataSource={comment?.replies}
                    rowKey={rep => rep?.commentId}
                    renderItem={(rep: TComment) => (
                        <li
                            style={{
                                position: 'relative',
                                width: '100%',
                            }}
                        >
                            <Comment
                                actions={[
                                    <>
                                        {isShowReply && commentId === rep.commentId ? (
                                            <Flex align="center" gap={8}>
                                                <Form<CreateReplyPayload> form={formReply} onFinish={onFinishReply}>
                                                    <Form.Item<CreateReplyPayload>
                                                        name="content"
                                                        style={{
                                                            marginBottom: 0,
                                                        }}
                                                    >
                                                        <Input
                                                            style={{
                                                                minWidth: 550,
                                                            }}
                                                            size="large"
                                                            ref={inputRef}
                                                            placeholder="Enter reply here..."
                                                        />
                                                    </Form.Item>
                                                </Form>
                                                <Button
                                                    size="small"
                                                    htmlType="button"
                                                    icon={<CloseOutlined />}
                                                    onClick={handleClickOutsideReply}
                                                />
                                                <Button
                                                    size="small"
                                                    htmlType="submit"
                                                    icon={<SendOutlined />}
                                                    // onClick={() => onFinishReply}
                                                />
                                            </Flex>
                                        ) : (
                                            <Flex vertical gap={8}>
                                                {rep?.updatedDate && (
                                                    <Typography.Text type="secondary">
                                                        {dayjsConfig(rep?.updatedDate).fromNow()}
                                                    </Typography.Text>
                                                )}

                                                <Button type="text" onClick={() => handleShowReply(rep.commentId)}>
                                                    Reply
                                                </Button>
                                            </Flex>
                                        )}
                                    </>,
                                ]}
                                author={
                                    <Typography.Text
                                        type="secondary"
                                        onClick={e => {
                                            e.stopPropagation();
                                            navigate(
                                                rep?.account.accountId === accountInfo?.accountId
                                                    ? `/profile`
                                                    : `/user-profile/${rep?.account?.accountId}`,
                                            );
                                            dispatch(setAccountState({ userInfo: rep?.account }));
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {rep?.account?.username}
                                    </Typography.Text>
                                } // avatar={rep?.account?.avatar || AvatarPlaceholder}
                                avatar={
                                    <img
                                        src={rep?.account?.avatar || AvatarPlaceholder}
                                        alt="avatar"
                                        onClick={e => {
                                            e.stopPropagation();
                                            navigate(
                                                rep?.account.accountId === accountInfo?.accountId
                                                    ? `/profile`
                                                    : `/user-profile/${rep?.account?.accountId}`,
                                            );
                                            dispatch(setAccountState({ userInfo: rep?.account }));
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                }
                                datetime={moment(rep.createdDate).format(FULL_TIME_FORMAT)}
                                content={
                                    <>
                                        {isEditReply && commentId === rep.commentId ? (
                                            <Flex align="center" gap={8}>
                                                <Form<CommentCreatePayload>
                                                    form={formReply}
                                                    initialValues={{ content: rep?.content }}
                                                    style={{
                                                        width: '100%',
                                                    }}
                                                    onFinish={onFinish}
                                                >
                                                    <Form.Item<CommentCreatePayload>
                                                        name="content"
                                                        style={{
                                                            marginBottom: 0,
                                                        }}
                                                    >
                                                        <Input size="large" ref={inputRef} />
                                                    </Form.Item>
                                                </Form>
                                                <Button
                                                    size="small"
                                                    htmlType="button"
                                                    icon={<CloseOutlined />}
                                                    onClick={handleClickOutside}
                                                />
                                            </Flex>
                                        ) : (
                                            rep?.content
                                        )}
                                    </>
                                }
                                // content={
                                //     <>
                                //         {editingCommentId === item.commentId ? (
                                //             <Flex align="center" gap={8}>
                                //                 <Form<CommentCreatePayload>
                                //                     form={form}
                                //                     initialValues={{ content: item?.content }}
                                //                     style={{
                                //                         width: '100%',
                                //                     }}
                                //                     onFinish={onFinish}
                                //                 >
                                //                     <Form.Item<CommentCreatePayload>
                                //                         name="content"
                                //                         style={{
                                //                             marginBottom: 0,
                                //                         }}
                                //                     >
                                //                         <Input size="large" ref={inputRef} />
                                //                     </Form.Item>
                                //                 </Form>
                                //                 <Button
                                //                     size="small"
                                //                     htmlType="button"
                                //                     icon={<CloseOutlined />}
                                //                     onClick={handleClickOutside}
                                //                 />
                                //             </Flex>
                                //         ) : (
                                //             item?.content
                                //         )}
                                //     </>
                                // }
                            >
                                {renderShowReplyReplyRecursive(rep)}
                            </Comment>

                            {isAllowShowActions(rep) && (
                                <Dropdown
                                    menu={{
                                        items: [
                                            // Chỉ hiển thị "Edit" nếu không phải là ADMIN hoặc STAFF
                                            ...(accountInfo?.role?.name !== 'ADMIN' &&
                                            accountInfo?.role?.name !== 'STAFF'
                                                ? [
                                                      {
                                                          key: '0',
                                                          icon: <EditOutlined />,
                                                          label: <span>Edit reply</span>,
                                                          onClick: () => handleUpdateReply(rep.commentId),
                                                      },
                                                  ]
                                                : []),
                                            {
                                                key: '1',
                                                icon: <DeleteOutlined />,
                                                label: <span>Delete reply</span>,
                                                onClick: () => handleDelete(rep),
                                            },
                                        ],
                                    }}
                                >
                                    <Button
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 0,
                                        }}
                                        type="text"
                                        icon={<EllipsisOutlined style={{ fontSize: 20 }} />}
                                    />
                                </Dropdown>
                            )}
                        </li>
                    )}
                />
            );
        }
    };

    return (
        <List
            className="comment-list"
            header={`${comments?.length} replies`}
            itemLayout="horizontal"
            dataSource={comments}
            rowKey={item => item?.commentId}
            renderItem={(item: TComment) => (
                <li
                    style={{
                        position: 'relative',
                        width: '100%',
                        ...(item.commentId === searchCommentId &&
                            isCommentHighlighted && {
                                border: '1px solid #1890ff',
                                borderRadius: 8,
                            }),
                    }}
                    id={item.commentId}
                >
                    <Comment
                        actions={[
                            <>
                                {isShowReply && commentId === item.commentId ? (
                                    <Flex align="center" gap={8}>
                                        <Form<CreateReplyPayload> form={formReply} onFinish={onFinishReply}>
                                            <Form.Item<CreateReplyPayload>
                                                name="content"
                                                style={{
                                                    marginBottom: 0,
                                                }}
                                            >
                                                <Input
                                                    style={{
                                                        minWidth: 550,
                                                    }}
                                                    size="large"
                                                    ref={inputRef}
                                                    placeholder="Enter reply here..."
                                                />
                                            </Form.Item>
                                        </Form>
                                        <Button
                                            size="small"
                                            htmlType="button"
                                            icon={<CloseOutlined />}
                                            onClick={handleClickOutsideReply}
                                        />
                                        <Button
                                            size="small"
                                            htmlType="submit"
                                            icon={<SendOutlined />}
                                            onClick={() => formReply.submit()}
                                        />
                                    </Flex>
                                ) : (
                                    <Flex vertical gap={8}>
                                        {item?.updatedDate && (
                                            <Typography.Text type="secondary">
                                                {dayjsConfig(item?.updatedDate).fromNow()}
                                            </Typography.Text>
                                        )}

                                        <Button type="text" onClick={() => handleShowReply(item.commentId)}>
                                            Reply
                                        </Button>
                                    </Flex>
                                )}
                            </>,
                        ]}
                        author={
                            <Typography.Text
                                onClick={e => {
                                    e.stopPropagation();
                                    navigate(
                                        item?.account.accountId === accountInfo?.accountId
                                            ? `/profile`
                                            : `/user-profile/${item?.account?.accountId}`,
                                    );
                                    dispatch(setAccountState({ userInfo: item?.account }));
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {item?.account?.username}
                            </Typography.Text>
                        }
                        // avatar={item?.account?.avatar || AvatarPlaceholder}
                        avatar={
                            <img
                                src={item?.account?.avatar || AvatarPlaceholder}
                                alt="avatar"
                                onClick={e => {
                                    e.stopPropagation();
                                    navigate(
                                        item?.account.accountId === accountInfo?.accountId
                                            ? `/profile`
                                            : `/user-profile/${item?.account?.accountId}`,
                                    );
                                    dispatch(setAccountState({ userInfo: item?.account }));
                                }}
                                style={{ cursor: 'pointer' }}
                            />
                        }
                        datetime={moment(item.createdDate).format(FULL_TIME_FORMAT)}
                        // content={
                        //     <>
                        //         {isEdit ? (
                        //             <Flex align="center" gap={8}>
                        //                 <Form<CommentCreatePayload>
                        //                     form={form}
                        //                     initialValues={{ content: item?.content }}
                        //                     style={{
                        //                         width: '100%',
                        //                     }}
                        //                     onFinish={onFinish}
                        //                 >
                        //                     <Form.Item<CommentCreatePayload>
                        //                         name="content"
                        //                         style={{
                        //                             marginBottom: 0,
                        //                         }}
                        //                     >
                        //                         <Input size="large" ref={inputRef} />
                        //                     </Form.Item>
                        //                 </Form>
                        //                 <Button
                        //                     size="small"
                        //                     htmlType="button"
                        //                     icon={<CloseOutlined />}
                        //                     onClick={handleClickOutside}
                        //                 />
                        //             </Flex>
                        //         ) : (
                        //             item?.content
                        //         )}
                        //     </>
                        // }
                        content={
                            <>
                                {editingCommentId === item.commentId ? (
                                    <Flex align="center" gap={8}>
                                        <Form<CommentCreatePayload>
                                            form={form}
                                            initialValues={{ content: item?.content }}
                                            style={{
                                                width: '100%',
                                            }}
                                            onFinish={onFinish}
                                        >
                                            <Form.Item<CommentCreatePayload>
                                                name="content"
                                                style={{
                                                    marginBottom: 0,
                                                }}
                                            >
                                                <Input size="large" ref={inputRef} />
                                            </Form.Item>
                                        </Form>
                                        <Button
                                            size="small"
                                            htmlType="button"
                                            icon={<CloseOutlined />}
                                            onClick={handleClickOutside}
                                        />
                                    </Flex>
                                ) : (
                                    item?.content
                                )}
                            </>
                        }
                    >
                        {renderShowReplyReplyRecursive(item)}
                    </Comment>

                    {isAllowShowActions(item) && (
                        <Dropdown
                            menu={{
                                items: [
                                    // Chỉ hiển thị "Edit" nếu không phải là ADMIN hoặc STAFF
                                    ...(accountInfo?.role?.name !== 'ADMIN' && accountInfo?.role?.name !== 'STAFF'
                                        ? [
                                              {
                                                  key: '0',
                                                  icon: <EditOutlined />,
                                                  label: <span>Edit comment</span>,
                                                  onClick: () => handleUpdate(item.commentId),
                                              },
                                          ]
                                        : []),
                                    {
                                        key: '1',
                                        icon: <DeleteOutlined />,
                                        label: <span>Delete comment</span>,
                                        onClick: () => handleDelete(item),
                                    },
                                ],
                            }}
                        >
                            <Button
                                style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 0,
                                }}
                                type="text"
                                icon={<EllipsisOutlined style={{ fontSize: 20 }} />}
                            />
                        </Dropdown>
                    )}
                </li>
            )}
        />
    );
};

export default PostCommentList;
