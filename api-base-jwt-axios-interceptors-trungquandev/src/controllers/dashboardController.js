// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { StatusCodes } from 'http-status-codes'

const access = async (req, res) => {
  try {
    const userInfo = {
      email: req.jwtDecoded.email,
      id: req.jwtDecoded.id
    }
    res.status(StatusCodes.OK).json(userInfo)
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

export const dashboardController = {
  access
}
