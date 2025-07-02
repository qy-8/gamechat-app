const response = require('../utils/response')
const { sendSmsCode, verifySmsCode } = require('../services/smsService')
const User = require('../models/User')
const { hashPassword } = require('../utils/crypto')
const bcrypt = require('bcrypt')
const { generateToken } = require('../services/authService')

// 发送短信验证码
const sendSmsCodeToPhone = (req, res) => {
  sendSmsCode(req)
  response.success(res, {}, '短信验证码已发送')
}

// 注册接口
const register = async (req, res) => {
  const { phoneNumber, username, password } = req.body
  // 验证短信验证码是否正确，然后再查找数据库是否有相同手机号和用户名以减少服务器压力，提高性能
  try {
    const isCodeValid = await verifySmsCode(req, res)
    if (!isCodeValid) {
      return response.error(res, '验证码错误或者已过期', 400)
    }
    // 检查手机号和用户名是否已存在
    const existingPhoneNumber = await User.findOne({ phoneNumber, status: 1 })
    if (existingPhoneNumber) {
      return response.error(res, '该手机号已被注册')
    }
    // console.log(username)
    const existingUsername = await User.findOne({ username, status: 1 })
    // console.log(existingUsername)
    if (existingUsername) {
      return response.error(res, '用户名已被占用')
    }
    const hashedPassword = await hashPassword(password)
    // 将username，phoneNumber, 加密后的 password存入数据库
    const newUser = new User({
      username,
      phoneNumber,
      password: hashedPassword
    })
    // 保存用户数据到数据库
    await newUser.save()
    return response.success(res, {}, '注册成功')
  } catch (error) {
    console.error(error)
    response.error(res, '服务器错误', 500)
  }
}

// 使用手机+密码/手机+验证码的方式登陆
const loginWithPhoneNumber = async (req, res) => {
  const { phoneNumber, password, code } = req.body
  const user = await User.findOne({ phoneNumber, status: 1 })
  if (!user) {
    return response.error(res, '用户不存在', 400)
  }
  if (code) {
    const storedSmsCode = await verifySmsCode(req, res)
    if (!storedSmsCode) {
      return response.error(res, '验证码不正确', 400)
    }
  } else if (password) {
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return response.error(res, '密码错误', 400)
    }
  } else {
    console.log(req.body)
    return response.error(res, '请提供密码/验证码', 400)
  }
  const token = generateToken(user)
  return response.success(res, token, '登陆成功')
}

// 使用用户名+密码的方式登陆
const loginWithUsername = async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username, status: 1 })
  console.log(user)
  if (!user) {
    return response.error(res, '用户名不存在', 400)
  }
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return response.error(res, '密码错误', 400)
  }
  const token = generateToken(user)
  return response.success(res, token, '登陆成功')
}
module.exports = {
  sendSmsCodeToPhone,
  register,
  loginWithPhoneNumber,
  loginWithUsername
}
