import { Card, Flex } from 'antd';

import BonusPoint from './bonusPoint';
import DailyPoint from './dailyPoint';

const AdminPointPage = () => {
    return (
        <Flex vertical gap={20}>
            <Card title="Daily Point">
                <DailyPoint />
            </Card>
            <Card title="Bonus Point">
                <BonusPoint />
            </Card>
        </Flex>
    );
};

export default AdminPointPage;
