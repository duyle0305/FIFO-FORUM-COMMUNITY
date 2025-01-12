import { EditOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Table } from 'antd';
import React, { useEffect, useState } from 'react';

import { get, post, put } from '@/utils/service';

interface DailyPoint {
    maxPoint: number;
    pointPerPost: number;
    pointCostPerDownload: number;
    pointEarnedPerDownload: number;
    reportThresholdForAutoDelete: number;
}

const DailyPointTable = () => {
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [points, setPoints] = useState<any>();
    const [selectedPoint, setSelectedPoint] = useState<DailyPoint>();

    useEffect(() => {
        get('/point/getall').then((res: any) => {
            if (res.status === 200) {
                setPoints(res.data.entity);
            }
        });
    }, [refresh]);

    const handleEditClick = (point: any) => {
        setSelectedPoint(point);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setSelectedPoint((prevPoint: any) => ({
            ...prevPoint,
            [name]: value,
        }));
    };

    const handleSave = () => {
        put('/point/update', selectedPoint).then((res: any) => {
            if (res.status === 200) {
                message.success('Daily Point updated successfully');
                setShowModal(false);
                setSelectedPoint(undefined);
                setRefresh(!refresh);
            }
        });
    };

    const columns = [
        {
            title: 'Max Point',
            dataIndex: 'maxPoint',
            key: 'maxPoint',
        },
        {
            title: 'Point Per Post',
            dataIndex: 'pointPerPost',
            key: 'pointPerPost',
        },
        {
            title: 'Point Cost Per Download',
            dataIndex: 'pointCostPerDownload',
            key: 'pointCostPerDownload',
        },
        {
            title: 'Point Earned Per Download',
            dataIndex: 'pointEarnedPerDownload',
            key: 'pointEarnedPerDownload',
        },
        {
            title: 'Report Threshold For Auto Delete',
            dataIndex: 'reportThresholdForAutoDelete',
            key: 'reportThresholdForAutoDelete',
        },
        {
            title: 'Edit',
            key: 'edit',
            render: (_record: any) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEditClick(_record)} />
            ),
        },
    ];

    return (
        points && (
            <div>
                <Table columns={columns} dataSource={points} pagination={false} rowKey="maxPoint" />

                <Modal title="Edit Points" visible={showModal} onCancel={handleCloseModal} onOk={handleSave}>
                    <Form layout="vertical">
                        <Form.Item label="Max Point">
                            <Input
                                type="number"
                                name="maxPoint"
                                value={selectedPoint?.maxPoint}
                                min={0}
                                onChange={handleChange}
                            />
                        </Form.Item>
                        <Form.Item label="Point Per Post">
                            <Input
                                type="number"
                                name="pointPerPost"
                                value={selectedPoint?.pointPerPost}
                                min={0}
                                onChange={handleChange}
                            />
                        </Form.Item>
                        <Form.Item label="Point Cost Per Download">
                            <Input
                                type="number"
                                name="pointCostPerDownload"
                                value={selectedPoint?.pointCostPerDownload}
                                min={0}
                                onChange={handleChange}
                            />
                        </Form.Item>
                        <Form.Item label="Point Earned Per Download">
                            <Input
                                type="number"
                                name="pointEarnedPerDownload"
                                value={selectedPoint?.pointEarnedPerDownload}
                                min={0}
                                onChange={handleChange}
                            />
                        </Form.Item>
                        <Form.Item label="Report Threshold For Auto Delete">
                            <Input
                                type="number"
                                name="reportThresholdForAutoDelete"
                                value={selectedPoint?.reportThresholdForAutoDelete}
                                min={0}
                                onChange={handleChange}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        )
    );
};

export default DailyPointTable;
