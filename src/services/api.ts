import axios from 'axios';

const api = axios.create(
    {
        baseURL: 'https://ecoleta-marketplace.herokuapp.com'
       // baseURL: 'https://localhost:3232'
    }
);

export default api;