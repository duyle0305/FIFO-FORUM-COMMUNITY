import type { CardProps } from 'antd';
import type { FC } from 'react';

import { Card, ConfigProvider } from 'antd';
import React from 'react';

import { themeConfig } from '@/consts/token';

interface RewardCardProps extends CardProps {}

const RewardCard: FC<RewardCardProps> = props => {
    return (
        <ConfigProvider
            theme={{
                ...themeConfig,
                components: {
                    ...themeConfig.components,
                    Card: {
                        ...themeConfig.components!.Card,
                        colorBorderSecondary: '#838383',
                    },
                },
            }}
        >
            <Card {...props} />
        </ConfigProvider>
    );
};

export default RewardCard;
