import axios from 'axios';
import Session from 'supertokens-auth-react/recipe/session';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-type': 'application/json',
    },
});

Session.addAxiosInterceptors(api);

export default api;
