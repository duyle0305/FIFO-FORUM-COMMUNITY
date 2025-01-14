import type { FC } from 'react';

import { Flex } from 'antd';

interface MenuWrapperProps {
    children: React.ReactNode;
}

export const MenuWrapper: FC<MenuWrapperProps> = ({ children }) => {
    return (
        <Flex vertical gap={20}>
            {children}
        </Flex>
    );
};
