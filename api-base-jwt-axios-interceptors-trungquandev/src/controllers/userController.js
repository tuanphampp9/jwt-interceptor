// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { ACCESS_TOKEN_SECRET_SIGNATURE, JwtProvider, REFRESH_TOKEN_SECRET_SIGNATURE } from '../providers/JwtProvider.js'
/**
 * Mock nhanh thông tin user thay vì phải tạo Database rồi query.
 * Nếu muốn học kỹ và chuẩn chỉnh đầy đủ hơn thì xem Playlist này nhé:
 * https://www.youtube.com/playlist?list=PLP6tw4Zpj-RIMgUPYxhLBVCpaBs94D73V
 */
const MOCK_DATABASE = {
  USER: {
    ID: 'tuanphamdev-sample-id-12345678',
    EMAIL: 'tuanphampp9@gmail.com',
    PASSWORD: 'tuanpham@1218'
  }
}

/**
 * 2 cái chữ ký bí mật quan trọng trong dự án. Dành cho JWT - Jsonwebtokens
 * Lưu ý phải lưu vào biến môi trường ENV trong thực tế cho bảo mật.
 * Ở đây mình làm Demo thôi nên mới đặt biến const và giá trị random ngẫu nhiên trong code nhé.
 * Xem thêm về biến môi trường: https://youtu.be/Vgr3MWb7aOw
 */


const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }

    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }

    //create accessToken and refreshToken
    const accessToken = await JwtProvider.generateToken(userInfo, ACCESS_TOKEN_SECRET_SIGNATURE, 5)

    const refreshToken = await JwtProvider.generateToken(userInfo, REFRESH_TOKEN_SECRET_SIGNATURE, 15)

    //create cookies
    res.cookie('accessToken', accessToken, {
      maxAge: ms('7d'),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })

    res.cookie('refreshToken', refreshToken, {
      maxAge: ms('7d'),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })


    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client

    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    //delete cookies
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    //way 1: get refreshToken from cookies
    const refreshTokenCookie = req.cookies?.refreshToken
    //way 2: get refreshToken from localStorage (body)
    const refreshTokenBody = req.body?.refreshToken
    console.log('refreshTokenBody: ', refreshTokenBody);

    //verify refreshToken
    const refreshTokenDecoded = await JwtProvider.verifyToken(refreshTokenBody, REFRESH_TOKEN_SECRET_SIGNATURE)

    //get userinfo from refreshToken
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email
    }
    //create new accessToken
    const accessToken = await JwtProvider.generateToken(userInfo, ACCESS_TOKEN_SECRET_SIGNATURE, 5)

    res.cookie('accessToken', accessToken, {
      maxAge: ms('7d'),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    res.status(StatusCodes.OK).json({ accessToken })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Refresh token is invalid or expired!',
      error: error.message
    })
  }
}

const getMe = async (req, res) => {
  try {
    const userInfo = {
      id: "tuanphamdev-sample-id-12345678",
      email: "tuanphampp9@gmail.com"
    }
    res.status(StatusCodes.OK).json(userInfo)
  } catch (error) {
    console.log('error from getMe', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

export const userController = {
  login,
  logout,
  refreshToken,
  getMe
}
