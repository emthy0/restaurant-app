import axios from 'axios';

let token = '';

if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
}

export const apiClient = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_ENDPOINT ||
        'https://6701-project05-restaurant.vercel.app/api/v1',
    timeout: 80000,
    headers: {
        Authorization: 'Bearer ' + token,
    },
});
