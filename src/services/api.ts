import axios from 'axios';

const api = axios.create(
    {
        baseURL: 'https://ecoleta-marketplace.herokuapp.com'
    }
);

export default api;