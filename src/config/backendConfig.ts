import ThirdPartyEmailPasswordNode from 'supertokens-node/recipe/thirdpartyemailpassword';
import SessionNode from 'supertokens-node/recipe/session';
import { appInfo } from './appInfo';
import { TypeInput } from 'supertokens-node/types';

export const backendConfig = (): TypeInput => {
    return {
        framework: 'express',
        supertokens: {
            connectionURI: 'https://auth.explorernet.com.br',
            apiKey: 'de2x7Q1JlvJyz3zdU87gIBYuyHphXj',
        },
        appInfo,
        recipeList: [
            ThirdPartyEmailPasswordNode.init({
                override: {
                    apis: (originalImplementation) => {
                        return {
                            ...originalImplementation,

                            // we override the thirdparty sign in / up API
                            thirdPartySignInUpPOST: async function (input) {
                                if (
                                    originalImplementation.thirdPartySignInUpPOST ===
                                    undefined
                                ) {
                                    throw Error('Should never come here');
                                }

                                let response =
                                    await originalImplementation.thirdPartySignInUpPOST(
                                        input
                                    );

                                // if sign in / up was successful...
                                if (response.status === 'OK') {
                                    // In this example we are using Google as our provider
                                    let accessToken =
                                        response.authCodeResponse.access_token;

                                    console.log(response, accessToken);
                                }

                                return response;
                            },
                        };
                    },
                },
                providers: [
                    ThirdPartyEmailPasswordNode.Google({
                        clientId:
                            '472466091401-013l2cci5hd2a1q9jb9jhsni0cc53m13.apps.googleusercontent.com',
                        clientSecret: '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',
                        scope: [
                            'https://www.googleapis.com/auth/userinfo.profile',
                        ],
                    }),
                ],
            }),
            SessionNode.init({
                override: {
                    functions: (originalImplementation) => {
                        return {
                            ...originalImplementation,
                            createNewSession: async function (input) {
                                let userId = input.userId;

                                let role = 'admin'; // TODO: fetch role based on userId

                                input.accessTokenPayload = {
                                    ...input.accessTokenPayload,
                                    role,
                                };

                                return originalImplementation.createNewSession(
                                    input
                                );
                            },
                        };
                    },
                },
            }),
        ],
        isInServerlessEnv: true,
    };
};
