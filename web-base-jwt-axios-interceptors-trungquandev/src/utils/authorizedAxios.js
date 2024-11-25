// Author: TrungQuanDev: https://youtube.com/@trungquandev
import axios from 'axios'
import { toast } from 'react-toastify';
import { handleLogoutApi, refreshTokenApi } from '~/apis';

let authorizedAxios = axios.create({});

//time out 10 minutes
authorizedAxios.defaults.timeout = 10 * 60 * 1000;

//serve automatically cookies with axios whenever make a request
authorizedAxios.defaults.withCredentials = true;

//config interceptor
// Add a request interceptor: before request is sent
authorizedAxios.interceptors.request.use(function (config) {
    // Do something before request is sent
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

let refreshTokenPromise = null;
// Add a response interceptor: before response is returned
authorizedAxios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    //handle auto call refreshToken

    //handle unauthorized then redirect to login page
    if (error.response.status === 401) {
        handleLogoutApi().then(
            () => {
                location.href = '/login';
            }
        )
    }
    const originalRequest = error.config;
    if (error.response.status === 410 && originalRequest) {
        console.log('error 1', originalRequest)
        originalRequest._retry = true;
        if (!refreshTokenPromise) {
            const refreshToken = localStorage.getItem('refreshToken');
            refreshTokenPromise = refreshTokenApi(refreshToken).then(
                res => {

                    //get new accessToken
                    const accessToken = res.data.accessToken;
                    localStorage.setItem('accessToken', accessToken);
                    //assign new accessToken to header

                    //retry original request
                    // return authorizedAxios(originalRequest);
                }).catch(
                    err => {
                        console.log('error from refreshToken: ', err);
                        //handle logout if refreshToken is invalid or expired
                        handleLogoutApi().then(
                            () => {
                                location.href = '/login';
                            })
                        return Promise.reject(err);
                    }
                ).finally(() => { refreshTokenPromise = null });
        }

        return refreshTokenPromise.then(() => {
            return authorizedAxios(originalRequest);
        })

    }
    // exclude 410 status code (gone) because it's not an error (call api refreshToken)
    if (error.response.status !== 410) {
        toast.error(error.response.data.message || error.message);
    }
    return Promise.reject(error);
});
export default authorizedAxios;