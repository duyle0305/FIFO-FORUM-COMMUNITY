import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, Table } from 'antd';
import React, { useEffect, useState } from 'react';

import { deleteRequest, get, post, put } from '@/utils/service';

interface BonusPoint {
    typeBonusId: string;
    name: string;
    quantity: number;
    pointBonus: number;
}

const { Option } = Select;

const BonusPoint = () => {
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [points, setPoints] = useState<any>();
    const [selectedPoint, setSelectedPoint] = useState<BonusPoint | undefined>();

    useEffect(() => {
        get('/type-bonus/getall').then((res: any) => {
            if (res.status === 200) {
                setPoints(res.data.entity);
            }
        });
    }, [refresh]);

    const handleEditClick = (point: any) => {
        setSelectedPoint(point);
        setShowModal(true);
    };

    const handleDeleteClick = (point: any) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this point?',
            onOk: () => {
                deleteRequest(`/type-bonus/delete/${point.typeBonusId}`).then((res: any) => {
                    if (res.status === 200) {
                        message.success('Point ' + point.name + ' deleted successfully');
                        setRefresh(!refresh);
                    }
                });
            },
        });
    };

    const handleAddNewClick = () => {
        setSelectedPoint({
            typeBonusId: '',
            name: 'UPVOTE',
            quantity: 0,
            pointBonus: 0,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
        const { name, value } = e.target ? e.target : e;

        setSelectedPoint((prevPoint: any) => ({
            ...prevPoint,
            [name]: value,
        }));
    };

    const handleSave = () => {
        const apiCall = selectedPoint?.typeBonusId ? put : post;
        const endpoint = selectedPoint?.typeBonusId
            ? `/type-bonus/update/${selectedPoint?.typeBonusId}`
            : '/type-bonus/create';

        apiCall(endpoint, selectedPoint)
            .then((res: any) => {
                if (res.status === 200) {
                    message.success('Bonus Point ' + selectedPoint.name + ' saved successfully');
                    setShowModal(false);
                    setSelectedPoint(undefined);
                    setRefresh(!refresh);
                }
            })
            .catch(error => {
                message.error('Failed to save Bonus Point ' + selectedPoint.name);
            });
    };

    const columns = [
        // {
        //     title: 'Type Bonus ID',
        //     dataIndex: 'typeBonusId',
        //     key: 'typeBonusId',
        // },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: (a: any, b: any) => a.quantity - b.quantity,
        },
        {
            title: 'Point Bonus',
            dataIndex: 'pointBonus',
            key: 'pointBonus',
            sorter: (a: any, b: any) => a.pointBonus - b.pointBonus,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_record: any) => (
                <>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEditClick(_record)} />
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteClick(_record)} />
                </>
            ),
        },
    ];

    return (
        points && (
            <div>
                <Button style={{ marginBottom: 10 }} type="primary" icon={<PlusOutlined />} onClick={handleAddNewClick}>
                    Add New
                </Button>
                <Table columns={columns} dataSource={points} pagination={false} rowKey="typeBonusId" />

                <Modal
                    title={selectedPoint?.typeBonusId ? 'Edit Point' : 'Add Point'}
                    visible={showModal}
                    onCancel={handleCloseModal}
                    onOk={handleSave}
                >
                    <Form layout="vertical">
                        {/* <Form.Item label="Type Bonus ID">
                            <Input
                                type="text"
                                name="typeBonusId"
                                value={selectedPoint?.typeBonusId}
                                onChange={handleChange}
                            />
                        </Form.Item> */}
                        <Form.Item label="Name">
                            <Select
                                value={selectedPoint?.name}
                                onChange={value => handleChange({ target: { name: 'name', value } })}
                                // defaultValue="UPVOTE"
                            >
                                <Option value="UPVOTE">UPVOTE</Option>
                                <Option value="COMMENT">COMMENT</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Quantity">
                            <Input
                                type="number"
                                name="quantity"
                                value={selectedPoint?.quantity}
                                min={0}
                                onChange={handleChange}
                            />
                        </Form.Item>
                        <Form.Item label="Point Bonus">
                            <Input
                                type="number"
                                name="pointBonus"
                                value={selectedPoint?.pointBonus}
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

export default BonusPoint;
