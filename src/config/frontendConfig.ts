import ThirdPartyEmailPasswordReact from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import SessionReact from 'supertokens-auth-react/recipe/session';
import { appInfo } from './appInfo';
import { ptbr } from './translation';

export const frontendConfig = () => {
    return {
        languageTranslations: {
            translations: {
                ptbr,
            },
            defaultLanguage: 'ptbr',
        },
        appInfo,
        recipeList: [
            ThirdPartyEmailPasswordReact.init({
                palette: {
                    background: '#333',
                    inputBackground: '#292929',
                    error: '#ad2e2e',
                    textTitle: 'white',
                    textLabel: 'white',
                    textInput: '#a9a9a9',
                    textPrimary: 'white',
                    textLink: '#a9a9a9',
                    superTokensBrandingBackground: '#333',
                    superTokensBrandingText: '#333',
                },
                signInAndUpFeature: {
                    providers: [ThirdPartyEmailPasswordReact.Google.init()],
                },
            }),
            SessionReact.init(),
        ],
    };
};
