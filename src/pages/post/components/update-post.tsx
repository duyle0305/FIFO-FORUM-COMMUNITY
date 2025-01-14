import type { TopicListingParams } from '@/hooks/query/topic/use-topics-listing';
import type { RootState } from '@/stores';
import type { OnAction } from '@/types';
import type { UpdatePostPayload } from '@/types/post/post';
import type { UploadFile, UploadProps } from 'antd';
import type { FC } from 'react';

import { PaperClipOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Flex, Form, Image, Input, message, Modal, Select, Space, Tooltip, Upload } from 'antd';
import { getStorage, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import EmojiSvg from '/public/emoji.svg';
import GallerySvg from '/public/gallery.svg';
import Tiptap from '@/components/tiptap/tiptap';
import { UserInfo } from '@/components/user/user-info';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/consts/common';
import { bookmarkKeys } from '@/consts/factory/bookmark';
import { postKeys } from '@/consts/factory/post';
import { useUpdatePost } from '@/hooks/mutate/post/use-update-post';
import { useCategoriesListing } from '@/hooks/query/category/use-category-listing';
import { useGetPost } from '@/hooks/query/post/use-get-post';
import { useTagsListing } from '@/hooks/query/tag/use-tags-listing';
import { useTopicsListing } from '@/hooks/query/topic/use-topics-listing';
import { useMessage } from '@/hooks/use-message';
import { useUploadFile } from '@/hooks/use-upload-file';
import { setPost } from '@/stores/post';

interface UpdatePostProps {
    onCancel?: OnAction;
}

const initialParams: TopicListingParams = {
    page: DEFAULT_PAGE,
    perPage: DEFAULT_PAGE_SIZE,
};

export const UpdatePost: FC<UpdatePostProps> = ({ onCancel }) => {
    const { accountInfo } = useSelector((state: RootState) => state.account);
    const [form] = Form.useForm();
    const storage = getStorage();

    const watchContent = Form.useWatch('content', form);

    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const { type, open } = useSelector((state: RootState) => state.post.modal);
    const queryClient = useQueryClient();
    const { success, error } = useMessage();
    const id = useSelector((state: RootState) => state.post.id);

    const { imgUrl, imgUrlList, setImgUrlList, uploadFile } = useUploadFile();
    const { imgUrlList: urlFileList, setImgUrlList: setUrlFileList, uploadFile: upLoadAnotherFile } = useUploadFile();

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [anotherFileList, setAnotherFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const { data: categories } = useCategoriesListing({ params: initialParams });

    const { data: topics, isLoading: isLoadingTopics } = useTopicsListing({ params: initialParams });
    const { data: tags, isLoading: isLoadingTags } = useTagsListing({ params: initialParams });
    const { data: detail } = useGetPost(id ?? '');
    const { mutate: updatePost, isPending: isPendingUpdatePost } = useUpdatePost(id ?? '', {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: postKeys.listing(),
            });
            queryClient.invalidateQueries({
                queryKey: postKeys.get(id ?? ''),
            });
        },
    });

    const onFinish = (values: UpdatePostPayload) => {
        updatePost(
            {
                ...values,
                imageUrlList:
                    fileList.length > 0
                        ? fileList.map(file => ({
                              url: file.url as string,
                          }))
                        : [],
                ...(urlFileList.length > 0 && {
                    linkFile: urlFileList[0] as string,
                    postFileUrlRequest: urlFileList.map(url => ({ url: url as string })),
                }),
            },
            {
                onSuccess: () => {
                    success('Post updated successfully!');
                    onCancel && onCancel();
                    dispatch(setPost({ id: undefined }));
                    form.resetFields();
                    setImgUrlList([]);
                    setUrlFileList([]);
                    setAnotherFileList([]);
                    window.location.reload();
                },
                onError: err => {
                    error(err.message);
                },
            },
        );
    };

    const onChangeFile: UploadProps['onChange'] = ({ file, fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const onRemoveFile = (file: UploadFile) => {
        const index = fileList.indexOf(file);

        if (index > -1) {
            const newImgUrlList = imgUrlList.slice();

            newImgUrlList.splice(index, 1);
            setImgUrlList(newImgUrlList);
            setFileList(fileList.filter(item => item.uid !== file.uid));
        }
    };

    const onChangeAnotherFile: UploadProps['onChange'] = ({ file, fileList }) => {
        setAnotherFileList(fileList);
    };

    const onRemoveAnotherFile = (file: UploadFile) => {
        const index = anotherFileList.indexOf(file);

        if (index > -1) {
            const newImgUrlList = urlFileList.slice();

            newImgUrlList.splice(index, 1);
            setUrlFileList(newImgUrlList);
            setAnotherFileList(anotherFileList.filter(item => item.uid !== file.uid));
        }
    };

    useEffect(() => {
        const appendFieldFileList = fileList.map((file, index) => {
            return {
                ...file,
                url: imgUrlList[index],
            };
        });

        setFileList(appendFieldFileList);
    }, [imgUrlList]);

    useEffect(() => {
        if (detail) {
            setImgUrlList(detail?.imageList?.map(image => image.url) || []);
            setFileList(
                detail?.imageList?.map(image => ({
                    uid: image.imageId,
                    name: image.url,
                    url: image.url,
                    status: 'done',
                })) || [],
            );
            form.setFieldsValue({
                title: detail?.title,
                content: detail?.content,
                topicId: detail?.topic?.topicId,
                tagId: detail?.tag?.tagId,
            });
            setUrlFileList(detail?.postFileList?.length > 0 ? detail?.postFileList?.map(file => file.url) : []);
            setAnotherFileList(
                detail?.postFileList?.length > 0
                    ? detail?.postFileList?.map(file => ({
                          uid: file?.url,
                          name: ref(storage, file?.url)?.name,
                          url: file?.url,
                          status: 'done',
                      }))
                    : [],
            );
        }
    }, [detail, type, open]);

    return (
        <Modal title="Update Post" open={type === 'update' && open} onCancel={onCancel} footer={null} width={'80vw'}>
            <Card>
                <Flex vertical gap={10}>
                    <UserInfo account={accountInfo!} />

                    <Form<UpdatePostPayload> layout="vertical" form={form} name="updatePost" onFinish={onFinish}>
                        <Form.Item<UpdatePostPayload>
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: 'Please enter post title!' }]}
                        >
                            <Input size="large" placeholder="Post title goes here..." />
                        </Form.Item>

                        <Form.Item<UpdatePostPayload>
                            name="topicId"
                            label="Topic"
                            rules={[{ required: true, message: 'Please select a topic!' }]}
                        >
                            <Select
                                size="large"
                                loading={isLoadingTopics}
                                placeholder="Select a topic"
                                options={topics?.map(topic => ({
                                    label: topic.name,
                                    value: topic.topicId,
                                }))}
                                disabled
                            />
                        </Form.Item>

                        <Form.Item<UpdatePostPayload>
                            name="tagId"
                            label="Tags"
                            rules={[{ required: true, message: 'Please select a tag!' }]}
                        >
                            <Select
                                size="large"
                                loading={isLoadingTags}
                                placeholder="Select tags"
                                options={tags?.map(tag => ({
                                    label: tag.name,
                                    value: tag.tagId,
                                }))}
                                disabled
                            />
                        </Form.Item>

                        <Form.Item<UpdatePostPayload> name="content" label="Description">
                            {/* <Input.TextArea
                                size="large"
                                rows={5}
                                placeholder="Let's share what going on your mind..."
                            /> */}
                            <Tiptap
                                onChange={content => form.setFieldValue('content', content)}
                                content={watchContent || detail?.content || ''}
                                key={detail?.content || watchContent}
                            />
                        </Form.Item>
                    </Form>

                    <Flex gap={10} wrap>
                        <Upload listType="picture-card" fileList={fileList} onRemove={onRemoveFile} />
                        {previewImage && (
                            <Image
                                wrapperStyle={{ display: 'none' }}
                                preview={{
                                    visible: previewOpen,
                                    onVisibleChange: visible => setPreviewOpen(visible),
                                    afterOpenChange: visible => !visible && setPreviewImage(''),
                                }}
                                src={previewImage}
                            />
                        )}
                    </Flex>

                    <Upload fileList={anotherFileList} onRemove={onRemoveAnotherFile} />

                    <Flex align="center" justify="space-between">
                        <Space size="large">
                            <Upload
                                customRequest={uploadFile}
                                onChange={onChangeFile}
                                onRemove={onRemoveFile}
                                showUploadList={false}
                                fileList={fileList}
                            >
                                <Button type="text" icon={<img src={GallerySvg} />} />
                            </Upload>

                            {categories?.find(category => category.categoryId === searchParams.get('category'))
                                ?.name !== 'KNOWLEDGE SHARING' && (
                                <Upload
                                    customRequest={upLoadAnotherFile}
                                    onChange={onChangeAnotherFile}
                                    onRemove={onRemoveAnotherFile}
                                    showUploadList={false}
                                    fileList={anotherFileList}
                                    maxCount={1}
                                    accept=".zip,.rar,.7zip,.tar,.tar.gz"
                                    multiple
                                >
                                    <Tooltip title="Upload File">
                                        <Button type="text" icon={<PaperClipOutlined />} />
                                    </Tooltip>
                                </Upload>
                            )}
                        </Space>

                        <Space>
                            <Button loading={isPendingUpdatePost} form="updatePost" type="primary" htmlType="submit">
                                Update
                            </Button>
                        </Space>
                    </Flex>
                </Flex>
            </Card>
        </Modal>
    );
};
