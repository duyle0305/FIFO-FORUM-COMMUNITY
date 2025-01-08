import type { Feedback, FeedbackStatus } from '@/types/feedback/feedback';
import type { GetProp } from 'antd';

import { FilterOutlined } from '@ant-design/icons';
import { Button, Checkbox, Empty, Flex, Popover, Tag, Typography } from 'antd';
import React, { useEffect } from 'react';
import { IoIosRefresh } from 'react-icons/io';

import { useFeedbackListing } from '@/hooks/query/feedback/use-feedback-listing';

import AdminFeedbackWrapper from '../layout/admin-feedback-wrapper';
import { mapFeedbackStatusColor } from '../utils/map-feedback-status-color';
import AdminFeedbackItem from './admin-feedback-item';

const AdminFeedbackList = () => {
    const { data: feedbacks } = useFeedbackListing();

    const [selectedStatus, setSelectedStatus] = React.useState<string[]>([]);

    const [filterFeedback, setFilterFeedback] = React.useState<any>();

    useEffect(() => {
        setFilterFeedback(feedbacks?.filter(feedback => feedback.status === 'PENDING'));
    }, [feedbacks]);

    if (!feedbacks || !feedbacks.length) {
        return <Empty />;
    }

    const optionsWithDisabled = [
        {
            label: (
                <Tag
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 24,
                        fontSize: 12,
                    }}
                    color={mapFeedbackStatusColor('PENDING')}
                >
                    PENDING
                </Tag>
            ),
            value: 'PENDING',
        },
        {
            label: (
                <Tag
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 24,
                        fontSize: 12,
                    }}
                    color={mapFeedbackStatusColor('REJECTED')}
                >
                    REJECTED
                </Tag>
            ),
            value: 'REJECTED',
        },
        {
            label: (
                <Tag
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 24,
                        fontSize: 12,
                    }}
                    color={mapFeedbackStatusColor('APPROVED')}
                >
                    APPROVED
                </Tag>
            ),
            value: 'APPROVED',
        },
    ];

    const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = checkedValues => {
        setSelectedStatus(checkedValues as string[]);
    };

    const content = (
        <Flex vertical justify="center" align="center" gap={12}>
            <Typography.Title level={5}>STATUS</Typography.Title>
            <Checkbox.Group onChange={onChange}>
                <Flex vertical gap={8}>
                    {optionsWithDisabled.map(option => (
                        <Checkbox key={option.value} value={option.value}>
                            {option.label}
                        </Checkbox>
                    ))}
                </Flex>
            </Checkbox.Group>

            <Button
                type="primary"
                onClick={() => {
                    setFilterFeedback(
                        feedbacks.filter(feedback => selectedStatus.includes(feedback.status as FeedbackStatus)),
                    );
                }}
            >
                Apply
            </Button>
        </Flex>
    );

    return (
        <AdminFeedbackWrapper>
            <Flex justify="space-between">
                <Flex gap={8}>
                    <Popover content={content} trigger="click" arrow={false}>
                        <Button icon={<FilterOutlined />}>Filter</Button>
                    </Popover>

                    <Button
                        icon={<IoIosRefresh />}
                        onClick={() => {
                            window.location.reload();
                            // onChange(['PENDING']);
                            // setFilterFeedback(feedbacks?.filter(feedback => feedback.status === 'PENDING'));
                        }}
                    />
                </Flex>
            </Flex>
            {filterFeedback &&
                filterFeedback.map((feedback: Feedback) => (
                    <AdminFeedbackItem key={feedback.feedbackId} data={feedback} />
                ))}
        </AdminFeedbackWrapper>
    );
};

export default AdminFeedbackList;
