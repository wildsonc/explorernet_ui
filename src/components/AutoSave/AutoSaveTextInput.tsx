import { ActionIcon, TextInput, TextInputProps } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { ArrowBack, Check } from 'tabler-icons-react';
import api from '../../services/api';

export default function AutoSaveTextInput(props: TextInputProps) {
    const [value, setValue] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [newValue] = useDebouncedValue(value, 1000);

    useEffect(() => {
        const getValue = async () => {
            const response = await api.get(`api/key?name=${props.name}`);
            setValue(response.data.value);
            setCurrentValue(response.data.value);
        };
        getValue();
    }, []);

    const update = (value: any) => {
        api.post('api/key', { key: props.name, value }).then((response) => {
            showNotification({
                title: 'Salvo',
                message: 'Campo atualizado com sucesso!',
                color: 'green',
                icon: <Check />,
            });
        });
    };

    useEffect(() => {
        if (value && currentValue != value) {
            update(value);
        }
    }, [newValue]);

    return (
        <TextInput
            {...props}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            rightSection={
                <ActionIcon
                    onClick={() => {
                        setValue(currentValue);
                        update(currentValue);
                    }}
                >
                    <ArrowBack />
                </ActionIcon>
            }
        />
    );
}
