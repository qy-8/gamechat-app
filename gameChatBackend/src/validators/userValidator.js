const zhMessages = require('./zhMessages')

const joi = require('joi')

// 用户名，字母/数字，3-15 位字符
const username = joi
  .string()
  .pattern(/^[\u4e00-\u9fa5a-zA-Z0-9]{3,15}$/)
  .min(3)
  .max(15)
  .required()
  .messages(zhMessages.username)
// 密码，不包含空格，6-12 位字符
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required()
  .messages(zhMessages.password)
// 昵称，1-20 位字符
const nickname = joi
  .string()
  .min(1)
  .max(20)
  .required()
  .messages(zhMessages.nickname)
// 用户 ID，正整数
const id = joi.number().integer().min(1).required()
// 头像，dataUri格式
const avatar = joi.string().dataUri().required().messages(zhMessages.avatar)
// 中国手机号，11 位，第一位是 1，第二位是 3-9 之间的数字
const phoneNumber = joi
  .string()
  .pattern(/^1[3-9]\d{9}$/)
  .required()
  .messages(zhMessages.phoneNumber)
// 由 svg-captcha 生成的图形验证码，长度 5 位，只能是字母
const captcha = joi
  .string()
  .pattern(/^[a-zA-Z0-9]{5}$/)
  .required()
  .messages(zhMessages.captcha)
// 短信验证码
const code = joi
  .string()
  .length(6)
  .pattern(/^\d{6}$/)
  .required()
  .messages(zhMessages.code)

exports.validatePhoneSchema = {
  body: {
    phoneNumber,
    captcha
  }
}

exports.regSchema = {
  body: {
    username,
    password,
    phoneNumber,
    code
  }
}

exports.resetPasswordSchema = {
  body: {
    newPwd: joi.not(joi.ref('oldPwd')).concat(password),
    phoneNumber,
    code
  }
}

exports.updateUserSchema = {
  body: {
    username,
    phoneNumber
  }
}
