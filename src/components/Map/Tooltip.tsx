import { Box } from '@mantine/core';
import * as React from 'react';

interface Props {
    x: number;
    y: number;
    children?: React.ReactNode;
}

export default function Tooltip({ x, y, children }: Props) {
    return (
        <Box
            sx={(theme) => ({
                backgroundColor:
                    theme.colorScheme === 'dark'
                        ? theme.colors.dark[7]
                        : theme.colors.gray[0],
                color: theme.colorScheme === 'dark' ? 'white' : 'black',
                borderRadius: 5,
                padding: 5,
                boxShadow: '0 0 0 2px rgb(0 0 0 / 10%)',
                opacity: 0.95,
                left: x,
                top: y,
                position: 'absolute',
            })}
        >
            {children}
        </Box>
    );
}
