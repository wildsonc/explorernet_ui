import { Code, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

interface TemplateProps {
    name: string;
    components: [
        {
            example: {
                body_text: [string[]];
                header_text: string[];
            };
            buttons?: [{ text: string; example?: string[] }];
            text: string;
            type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
            format?: 'DOCUMENT' | 'IMAGE' | 'TEXT';
        }
    ];
}

export interface ValidatorProps {
    bodyArgs: { value: number; valid: boolean };
    buttonArgs: { value: number; valid: boolean };
    titleArgs: { value: number; valid: boolean };
    hasImage: { value: boolean; valid: boolean };
    hasDocument: { value: boolean; valid: boolean };
    hasFilename: { value: boolean; valid: boolean };
    company: { value: boolean; valid: boolean };
    phone: { value: boolean; valid: boolean };
}

interface Props {
    template?: TemplateProps;
    query: any;
    setValid: (v: boolean) => void;
}

const TemplateValidator = ({ template, query, setValid }: Props) => {
    useEffect(() => setValid(false), []);

    let columns: string[] = [];
    for (let key in query[0]) {
        columns.push(key);
    }

    if (!template || !query) return <></>;

    const image = template.components.filter(
        (e) => e.type == 'HEADER' && e.format == 'IMAGE'
    )[0];
    const title = template.components.filter(
        (e) => e.type == 'HEADER' && e.format == 'TEXT'
    )[0];
    const document = template.components.filter(
        (e) => e.type == 'HEADER' && e.format == 'DOCUMENT'
    )[0];
    const body = template.components.filter((e) => e.type == 'BODY')[0];
    const buttons = template.components.filter((e) => e.type == 'BUTTONS')[0];
    const buttonsVars = buttons?.buttons?.filter((e) => 'example' in e);

    const bodyArgs = body?.example ? body.example.body_text[0].length : 0;
    const buttonArgs = buttonsVars ? buttonsVars.length : 0;
    const titleArgs = title?.example ? title.example.header_text.length : 0;
    const hasImage = image ? true : false;
    const hasDocument = document ? true : false;
    const hasFilename = hasDocument ? true : false;

    const is_valid = (column: string, arg: any, bool = false) => {
        if (!arg) return true;
        if (arg == 0) return true;
        if (columns.includes(column)) {
            if (bool) {
                return true;
            } else {
                if (query[0][column].length == arg) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    };

    const validator: ValidatorProps = {
        company: {
            value: true,
            valid: is_valid('company', true, true),
        },
        phone: {
            value: true,
            valid: is_valid('phone', true, true),
        },
        bodyArgs: {
            value: bodyArgs,
            valid: is_valid('body', bodyArgs),
        },
        buttonArgs: {
            value: buttonArgs,
            valid: is_valid('button', buttonArgs),
        },
        titleArgs: {
            value: titleArgs,
            valid: is_valid('title', titleArgs),
        },
        hasImage: {
            value: hasImage,
            valid: is_valid('image', hasImage, true),
        },
        hasDocument: {
            value: hasDocument,
            valid: is_valid('document', hasDocument, true),
        },
        hasFilename: {
            value: hasFilename,
            valid: is_valid('filename', hasFilename, true),
        },
    };

    let valid = true;
    for (let [key, value] of Object.entries(validator)) {
        if (!value.valid) {
            valid = false;
        }
    }
    setValid(valid);

    return (
        <Stack align="flex-end" spacing="xs" p={5}>
            <Text weight={500} size="sm">
                Campos obrigatórios
            </Text>
            <Text
                color={validator.company.valid ? 'green' : 'red'}
                weight={500}
            >
                company: <Code>string</Code>
            </Text>
            <Text
                color={validator.phone.valid ? 'green' : 'red'}
                mt={-10}
                weight={500}
            >
                phone: <Code>string</Code>
            </Text>
            {validator.hasImage.value && (
                <Text
                    color={validator.hasImage.valid ? 'green' : 'red'}
                    mt={-10}
                    weight={500}
                >
                    image: <Code>url</Code>
                </Text>
            )}
            {validator.hasDocument.value && (
                <Text
                    color={validator.hasDocument.valid ? 'green' : 'red'}
                    mt={-10}
                    weight={500}
                >
                    document: <Code>url</Code>
                </Text>
            )}
            {validator.hasFilename.value && (
                <Text
                    color={validator.hasFilename.valid ? 'green' : 'red'}
                    mt={-10}
                    weight={500}
                >
                    filename: <Code>str</Code>
                </Text>
            )}
            {validator.titleArgs.value > 0 && (
                <Text
                    color={validator.titleArgs.valid ? 'green' : 'red'}
                    mt={-10}
                    weight={500}
                >
                    title:{' '}
                    <Code>
                        Array[
                        {validator.titleArgs.value}]
                    </Code>
                </Text>
            )}
            {validator.bodyArgs.value > 0 && (
                <Text
                    color={validator.bodyArgs.valid ? 'green' : 'red'}
                    mt={-10}
                    weight={500}
                >
                    body:{' '}
                    <Code>
                        Array[
                        {validator.bodyArgs.value}]
                    </Code>
                </Text>
            )}
            {validator.buttonArgs.value > 0 && (
                <Text
                    color={validator.buttonArgs.valid ? 'green' : 'red'}
                    mt={-10}
                    weight={500}
                >
                    button:{' '}
                    <Code>
                        Array[
                        {validator.buttonArgs.value}]
                    </Code>
                </Text>
            )}
        </Stack>
    );
};

export default TemplateValidator;
