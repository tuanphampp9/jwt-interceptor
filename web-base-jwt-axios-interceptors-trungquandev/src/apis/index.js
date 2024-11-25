import authorizedAxios from "~/utils/authorizedAxios";
import { API_ROOT } from "~/utils/constants";

export const handleLogoutApi = async () => {
    //with localStorage (req header Authorization)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");

    //with cookie (req header Authorization)
    return await authorizedAxios.delete(`${API_ROOT}/v1/users/logout`);
}

export const refreshTokenApi = async (refreshToken) => {
    return await authorizedAxios.put(`${API_ROOT}/v1/users/refresh_token`, {
        refreshToken
    });
}