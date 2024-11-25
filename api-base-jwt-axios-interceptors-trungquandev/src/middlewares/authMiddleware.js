// Author: TrungQuanDev: https://youtube.com/@trungquandev

import { StatusCodes } from "http-status-codes"
import { ACCESS_TOKEN_SECRET_SIGNATURE, JwtProvider } from "~/providers/JwtProvider"

//verify token
const isAuthorized = async (req, res, next) => {

    //way 1: get token from cookie
    const accessTokenCookie = req.cookies?.accessToken
    console.log('accessTokenCookie: ', accessTokenCookie)
    if (!accessTokenCookie) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Unauthorized (token not found)'
        })
    }
    //way 2: get token from header
    const accessTokenHeader = req.headers.authorization
    console.log('accessTokenHeader: ', accessTokenHeader)
    if (!accessTokenHeader) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Unauthorized (token not found)'
        })
    }

    try {
        //step 1: decode token (check valid token)
        const accessTokenDecoded = await JwtProvider.verifyToken(
            // accessTokenCookie, 
            accessTokenHeader.replace('Bearer ', ''),
            ACCESS_TOKEN_SECRET_SIGNATURE)
        console.log('accessTokenDecoded: ', accessTokenDecoded)
        //step 2: save token into req.jwtDecoded to use in next middleware
        req.jwtDecoded = accessTokenDecoded
        //step 3: next middleware
        next()
    } catch (error) {
        console.log('error from auth middleware', error)
        //if token expired then return 410 (GONE) for client to call refreshToken API
        if (error.message?.includes('jwt expired')) {
            return res.status(StatusCodes.GONE).json({
                message: 'Token expired (please refresh token)'
            })
        }
        //if token invalid then return 401 (UNAUTHORIZED) for client to login again
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Unauthorized (token invalid)'
        })
    }
}


export const authMiddleware = {
    isAuthorized
}