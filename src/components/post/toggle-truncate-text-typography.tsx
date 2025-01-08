import { Typography } from 'antd';
import React, { useEffect, useState } from 'react';

interface ToggleTruncateTextTypographyProps {
    content: string;
    maxLength: number;
}

const ToggleTruncateTextTypography = ({ content, maxLength }: ToggleTruncateTextTypographyProps) => {
    const [text, setText] = React.useState('');
    const [isShowMore, setIsShowMore] = useState(false);
    const [isShowLess, setIsShowLess] = useState(false);

    const handleToggle = () => {
        if (isShowMore) {
            setText(content);
            setIsShowLess(true);
            setIsShowMore(false);
        } else {
            setText(`${content.slice(0, maxLength)}... `);
            setIsShowMore(true);
            setIsShowLess(false);
        }
    };

    useEffect(() => {
        if (content?.length > maxLength) {
            setIsShowMore(true);
            setText(`${content.slice(0, maxLength)}... `);
        } else {
            setText(content);
        }
    }, [content, maxLength]);

    return (
        <Typography.Paragraph onClick={e => e.stopPropagation()}>
            <div
                onClick={e => e.stopPropagation()}
                dangerouslySetInnerHTML={{
                    __html: text,
                }}
            />
            {isShowLess && (
                <Typography.Link
                    style={{
                        color: '#1890ff',
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        handleToggle();
                    }}
                >
                    Read Less
                </Typography.Link>
            )}
            {isShowMore && (
                <Typography.Link
                    style={{
                        color: '#1890ff',
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        handleToggle();
                    }}
                >
                    Read More
                </Typography.Link>
            )}
        </Typography.Paragraph>
    );
};

export default ToggleTruncateTextTypography;
