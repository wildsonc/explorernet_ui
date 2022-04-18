export const ptbr = {
    // Header
    EMAIL_PASSWORD_SIGN_IN_HEADER_TITLE: 'Entrar',
    EMAIL_PASSWORD_SIGN_UP_HEADER_TITLE: 'Criar conta',
    EMAIL_PASSWORD_RESET_HEADER_TITLE: 'Recuperar sua senha',
    EMAIL_PASSWORD_RESET_SUBMIT_PW_HEADER_TITLE: 'Criar nova senha',
    // Form
    THIRD_PARTY_PROVIDER_DEFAULT_BTN_START: 'Entrar com ',
    THIRD_PARTY_PROVIDER_DEFAULT_BTN_END: '',
    EMAIL_PASSWORD_RESET_HEADER_SUBTITLE:
        'Enviaremos um e-mail para redefinir sua senha',
    EMAIL_PASSWORD_RESET_SUBMIT_PW_HEADER_SUBTITLE: '',

    EMAIL_PASSWORD_SIGN_IN_HEADER_SUBTITLE_START: '',
    EMAIL_PASSWORD_SIGN_IN_HEADER_SUBTITLE_SIGN_UP_LINK: '',
    EMAIL_PASSWORD_SIGN_IN_HEADER_SUBTITLE_END: '',

    EMAIL_PASSWORD_SIGN_UP_HEADER_SUBTITLE_START: 'Já possuí conta?',
    EMAIL_PASSWORD_SIGN_UP_HEADER_SUBTITLE_SIGN_IN_LINK: 'Entrar',
    EMAIL_PASSWORD_SIGN_UP_HEADER_SUBTITLE_END: '',

    THIRD_PARTY_EMAIL_PASSWORD_SIGN_IN_AND_UP_DIVIDER_OR: 'ou',
    // Inputs
    EMAIL_PASSWORD_SIGN_IN_FOOTER_FORGOT_PW_LINK: 'Esqueci a senha',
    EMAIL_PASSWORD_EMAIL_LABEL: 'Email',
    EMAIL_PASSWORD_EMAIL_PLACEHOLDER: 'Email',
    EMAIL_PASSWORD_PASSWORD_LABEL: 'Senha',
    EMAIL_PASSWORD_PASSWORD_PLACEHOLDER: 'Senha',
    EMAIL_PASSWORD_NEW_PASSWORD_LABEL: 'Nova senha',
    EMAIL_PASSWORD_NEW_PASSWORD_PLACEHOLDER: 'Nova senha',
    EMAIL_PASSWORD_CONFIRM_PASSWORD_LABEL: 'Confirmar senha',
    EMAIL_PASSWORD_CONFIRM_PASSWORD_PLACEHOLDER: 'Confirmar sua senha',
    // Button submit
    EMAIL_PASSWORD_SIGN_IN_SUBMIT_BTN: 'Entrar',
    EMAIL_PASSWORD_SIGN_UP_SUBMIT_BTN: 'Criar',
    EMAIL_PASSWORD_RESET_SEND_BTN: 'Enviar',
    EMAIL_PASSWORD_RESET_SUBMIT_PW_CHANGE_PW_BTN: 'Alterar senha',
    // Footer
    BRANDING_POWERED_BY_START: '',
    BRANDING_POWERED_BY_END: ' Explorernet',
    // Others
    SOMETHING_WENT_WRONG_ERROR: 'Algo deu errado. Tente novamente',
    //Error
    ERROR_EMAIL_NON_STRING: 'O e-mail deve ser do tipo string',
    ERROR_EMAIL_INVALID: 'Email inválido',

    ERROR_PASSWORD_NON_STRING: 'Password must be of type string',
    ERROR_PASSWORD_TOO_SHORT:
        'A senha deve conter pelo menos 8 caracteres, incluindo um número',
    ERROR_PASSWORD_TOO_LONG: 'A senha deve ser menor que 100 caracteres',
    ERROR_PASSWORD_NO_ALPHA: 'A senha deve conter pelo menos uma letra',
    ERROR_PASSWORD_NO_NUM: 'A senha deve conter pelo menos um número',
    ERROR_CONFIRM_PASSWORD_NO_MATCH: 'As senhas são diferentes',

    ERROR_NON_OPTIONAL: 'O campo não é opcional',

    EMAIL_PASSWORD_SIGN_IN_WRONG_CREDENTIALS_ERROR: 'Senha ou email inválido',

    /*
     * The following are error messages from our backend SDK.
     * These are returned as full messages to preserver compatibilty, but they work just like the keys above.
     * They are shown as is by default (setting the value to undefined will display the raw translation key)
     */
    'This email already exists. Please sign in instead.':
        'Esse email já existe. Faça login em vez disso.',
    'Field is not optional': 'O campo não é opcional',
    'Password must contain at least 8 characters, including a number':
        'A senha deve conter pelo menos 8 caracteres, incluindo um número',
    "Password's length must be lesser than 100 characters":
        'O comprimento da senha deve ser menor que 100 caracteres',
    'Password must contain at least one alphabet':
        'A senha deve conter pelo menos uma letra',
    'Password must contain at least one number':
        'A senha deve conter pelo menos um número',
    'Email is invalid': 'Email inválido',
};
