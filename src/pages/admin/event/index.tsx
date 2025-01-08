import type { RootState } from '@/stores';
import type { Event } from '@/types/event';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/lib';

import { CameraOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Flex,
    Form,
    Image,
    Input,
    Modal,
    Row,
    Space,
    Table,
    Typography,
    Upload,
} from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { SecondaryButton } from '@/components/core/secondary-button';
import { FULL_TIME_FORMAT } from '@/consts/common';
import { eventKeys } from '@/consts/factory/event';
import { useCreateEvent } from '@/hooks/mutate/event/use-create-event';
import { useDeleteEvent } from '@/hooks/mutate/event/use-delete-event';
import { useUpdateEvent } from '@/hooks/mutate/event/use-update-event';
import { useGetEvent } from '@/hooks/query/event/use-event-detail';
import { useEventListing } from '@/hooks/query/event/use-event-listing';
import { useMessage } from '@/hooks/use-message';
import { useUploadFile } from '@/hooks/use-upload-file';
import { GLOBAL_DATETIME_FORMAT_BE } from '@/utils/datetime';

const { confirm } = Modal;

interface ModalState {
    type: 'add' | 'edit' | 'detail';
    open: boolean;
    id?: string;
}

type FormValue = {
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    image: string;
    content: string;
    link: string;
};

const AdminEventPage = () => {
    const [form] = Form.useForm();
    const message = useMessage();
    const queryClient = useQueryClient();
    const { accountInfo } = useSelector((state: RootState) => state.account);

    const [modalState, setModalState] = useState<ModalState>({
        type: 'add',
        open: false,
    });
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const { imgUrlList, setImgUrlList, uploadFile } = useUploadFile();

    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const { data, isFetching } = useEventListing();

    const [sortedData, setSortedData] = useState<any>();

    useEffect(() => {
        if (data) {
            const sorted = [...data].sort((a, b) => {
                const currentDate = moment();
                const diffA = moment(a.startDate).diff(currentDate);
                const diffB = moment(b.startDate).diff(currentDate);

                return Math.abs(diffA) - Math.abs(diffB);
            });

            setSortedData(sorted);
        }
    }, [data]);

    const { data: detail } = useGetEvent(modalState.id ?? '');
    const { mutate: createEvent, isPending: isPendingCreateEvent } = useCreateEvent();
    const { mutate: updateEvent, isPending: isPendingUpdateEvent } = useUpdateEvent(modalState.id ?? '');
    const { mutate: deleteEvent, isPending: isPendingDeleteEvent } = useDeleteEvent();

    const handleDelete = (id: string) => {
        confirm({
            title: 'Do you want to delete this event?',
            onOk() {
                deleteEvent(id, {
                    onSuccess: () => {
                        message.success('Event deleted successfully');
                        queryClient.invalidateQueries({
                            queryKey: eventKeys.listing(),
                        });
                        setModalState({ type: 'detail', open: false });
                    },
                    onError: () => {
                        message.error('Event deletion failed');
                    },
                });
            },
            onCancel() {},
        });
    };

    const columns: ColumnsType<Event> = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (image: string) => <Image src={image} alt="event" style={{ width: '100px', height: '100px' }} />,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title, record) => (
                <Typography.Text
                    style={{
                        color: '#1890ff',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                        setModalState({
                            type: 'detail',
                            open: true,
                            id: record.eventId,
                        });
                    }}
                >
                    {title}
                </Typography.Text>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            ellipsis: true,
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (startDate: string) => moment(startDate).format(FULL_TIME_FORMAT),
            sorter: (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix(),
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (endDate: string) => moment(endDate).format(FULL_TIME_FORMAT),
            sorter: (a, b) => moment(a.endDate).unix() - moment(b.endDate).unix(),
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
                            setModalState({ type: 'edit', open: true, id: record.eventId });
                            setStartDate(dayjs(record.startDate));
                            setEndDate(dayjs(record.endDate));
                        }}
                    />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record?.eventId)} />
                </Space>
            ),
        },
    ];

    const uploadButton = () => <Button size="large" type="text" icon={<CameraOutlined />} />;

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

    const onFinish = (values: FormValue) => {
        createEvent(
            {
                ...values,
                image: imgUrlList[0],
                eventId: '',
                status: 'ACTIVE',
            },
            {
                onSuccess: () => {
                    message.success('Event created successfully');
                    queryClient.invalidateQueries({
                        queryKey: eventKeys.listing(),
                    });
                    setModalState({ type: 'add', open: false });
                    form.resetFields();
                    setFileList([]);
                    setPreviewImage('');
                },
                onError: (err: any) => {
                    message.error(err?.message || 'Event creation failed');
                },
            },
        );
    };

    const onFinishUpdate = (values: FormValue) => {
        updateEvent(
            {
                ...values,
                startDate: startDate?.format(GLOBAL_DATETIME_FORMAT_BE),
                endDate: endDate?.format(GLOBAL_DATETIME_FORMAT_BE),
                image: imgUrlList[0],
                eventId: detail?.eventId ?? '',
                status: 'ACTIVE',
            },
            {
                onSuccess: () => {
                    message.success('Event updated successfully');
                    queryClient.invalidateQueries({
                        queryKey: eventKeys.listing(),
                    });
                    setModalState({ type: 'edit', open: false });
                    form.resetFields();
                    setFileList([]);
                    setPreviewImage('');
                },
                onError: (err: any) => {
                    message.error(err?.message || 'Event update failed');
                },
            },
        );
    };

    const onCancelCreate = () => {
        setModalState({ type: 'add', open: false });
    };

    const onCancelUpdate = () => {
        setModalState({ type: 'edit', open: false });
    };

    const [startDate, setStartDate] = useState<any>(null);
    const [endDate, setEndDate] = useState<any>(null);

    useEffect(() => {
        if (detail) {
            form.setFieldsValue({
                title: detail.title,
                startDate: detail.startDate,
                endDate: detail.endDate,
                location: detail.location,
                content: detail.content,
                link: detail.link,
            });
            setImgUrlList([detail.image]);
            setFileList([
                {
                    uid: '-1',
                    name: detail.image,
                    status: 'done',
                    url: detail.image,
                },
            ]);
            setPreviewImage(detail.image);
        }
    }, [detail]);

    console.log(startDate, endDate);

    return (
        <Card>
            <Flex vertical gap={20}>
                <Flex justify="space-between" align="center">
                    <Typography.Title level={4}>Event</Typography.Title>
                    <SecondaryButton
                        onClick={() => {
                            setModalState({ type: 'add', open: true });
                            form.resetFields();
                            setFileList([]);
                            setPreviewImage('');
                        }}
                    >
                        Add New Event
                    </SecondaryButton>
                </Flex>

                <Table<Event>
                    loading={isFetching}
                    columns={columns}
                    dataSource={sortedData}
                    rowKey="eventId"
                    pagination={{
                        showQuickJumper: true,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            </Flex>

            <Modal
                title="Add New Event"
                open={modalState.type === 'add' && modalState.open}
                footer={null}
                onCancel={onCancelCreate}
                width={'80vw'}
            >
                <Form layout="vertical" form={form} name="event-form" onFinish={onFinish}>
                    <Flex vertical align="center" justify="center" gap={10}>
                        <Upload
                            accept="image/*"
                            customRequest={uploadFile}
                            listType="picture-circle"
                            maxCount={1}
                            showUploadList={false}
                            onChange={onChangeFile}
                            onRemove={onRemoveFile}
                        >
                            {uploadButton()}
                        </Upload>

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
                    </Flex>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FormValue>
                                label="Event Title"
                                name="title"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter event title',
                                    },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item<FormValue>
                                label="Start Date"
                                name="startDate"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter start date',
                                    },
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    size="large"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item<FormValue>
                                label="End Date"
                                name="endDate"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter end date',
                                    },
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    size="large"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item<FormValue>
                                label="Location"
                                name="location"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter location',
                                    },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item<FormValue>
                                label="Content"
                                name="content"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter content',
                                    },
                                ]}
                            >
                                <Input
                                    size="large"
                                    style={{
                                        width: '100%',
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item<FormValue> label="Link" name="link">
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Flex justify="end">
                        <Button htmlType="button" onClick={onCancelCreate}>
                            Cancel
                        </Button>
                        <Button type="primary" loading={isPendingCreateEvent} htmlType="submit">
                            Save
                        </Button>
                    </Flex>
                </Form>
            </Modal>

            <Modal
                title="Update Event"
                open={modalState.type === 'edit' && modalState.open}
                footer={null}
                onCancel={onCancelUpdate}
                width={'80vw'}
            >
                <Form layout="vertical" form={form} name="event-form" onFinish={onFinishUpdate}>
                    <Flex vertical align="center" justify="center" gap={10}>
                        <Upload
                            accept="image/*"
                            customRequest={uploadFile}
                            listType="picture-circle"
                            maxCount={1}
                            showUploadList={false}
                            onChange={onChangeFile}
                            onRemove={onRemoveFile}
                        >
                            {uploadButton()}
                        </Upload>

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
                    </Flex>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FormValue>
                                label="Event Title"
                                name="title"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter event title',
                                    },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>

                        <Col span={12} style={{ marginTop: 8 }}>
                            <label>Start Date</label>
                            <div>
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    size="large"
                                    style={{ width: '100%' }}
                                    value={startDate}
                                    onChange={date => setStartDate(date)}
                                />
                            </div>
                        </Col>

                        <Col span={12} style={{ marginTop: 8 }}>
                            <label>End Date</label>
                            <div>
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    size="large"
                                    style={{ width: '100%' }}
                                    value={endDate}
                                    onChange={date => setEndDate(date)}
                                />
                            </div>
                        </Col>

                        <Col span={12}>
                            <Form.Item<FormValue>
                                label="Location"
                                name="location"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter location',
                                    },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item<FormValue>
                                label="Content"
                                name="content"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter content',
                                    },
                                ]}
                            >
                                <Input
                                    size="large"
                                    style={{
                                        width: '100%',
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item<FormValue> label="Link" name="link">
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Flex justify="end">
                        <Button htmlType="button" onClick={onCancelUpdate}>
                            Cancel
                        </Button>
                        <Button type="primary" loading={isPendingUpdateEvent} htmlType="submit">
                            Save
                        </Button>
                    </Flex>
                </Form>
            </Modal>

            <Modal
                title="Event Detail"
                open={modalState.type === 'detail' && modalState.open}
                footer={null}
                onCancel={() => setModalState({ type: 'detail', open: false })}
                width={'80vw'}
            >
                <Flex gap={20}>
                    <Image
                        src={detail?.image}
                        alt="event"
                        style={{
                            objectFit: 'contain',
                            borderRadius: 16,
                            width: '100%',
                            height: '100%',
                        }}
                    />

                    <Flex vertical gap={10}>
                        <Flex justify="space-between">
                            <Typography.Title level={4}>{detail?.title}</Typography.Title>

                            <Button.Group>
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setModalState({ type: 'edit', open: true, id: detail?.eventId });
                                    }}
                                />
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(detail?.eventId ?? '')}
                                />
                            </Button.Group>
                        </Flex>
                        <Typography.Paragraph>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: detail?.content ?? '',
                                }}
                            />
                        </Typography.Paragraph>
                    </Flex>
                </Flex>
            </Modal>
        </Card>
    );
};

export default AdminEventPage;
