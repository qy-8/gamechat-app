const redis = require('redis')
const { generateSmsCode } = require('../utils/generateSmsCode')
const captchaHandler = require('../handler/captchaHandler')

// 创建 Redis 客户端实例，默认连接到 localhost:6379 端口
const client = redis.createClient()
// 连接 Redis
client
  .connect()
  .then(() => console.log('Redis 连接成功'))
  .catch((err) => console.log('连接失败，错误原因：', err))

// 错误事件监听并输出
client.on('error', (err) => console.error('Redis Error: ', err))

// 发送短信验证码，在发送验证码之前先检测图形验证码是否正确
const sendSmsCode = (req) => {
  // console.log(req)
  const { phoneNumber, captcha } = req.body
  if (!captchaHandler.verifyCaptcha(req, captcha)) {
    throw new Error('图形验证码错误')
  }
  const smsCode = generateSmsCode()
  // 存储验证码到 Redis
  storeSmsCode(phoneNumber, smsCode)
  // 模拟发送验证码到手机上
  console.log(`模拟发送验证码：手机号为${phoneNumber}的验证码是${smsCode}`)
}

// 存储验证码到 Redis 中并设置过期时间（ 5 分钟）
const storeSmsCode = (phoneNumber, code) => {
  const key = `sms:${phoneNumber}` // 生成唯一 Redis key
  client.setEx(key, 300, code, (err, result) => {
    if (err) {
      console.error('Redis 存储失败', error)
    } else {
      console.log(code)
      console.log('验证码存储成功:', result)
    }
  }) // 设置过期时间为 5 分钟
}

// 从 Redis 拿到 code 和客户端的输入进行对比
const verifySmsCode = async (req, res) => {
  console.log(req.body)
  const { phoneNumber, code } = req.body

  try {
    const key = `sms:${phoneNumber}`
    const storedCode = await client.get(key)
    if (storedCode === code) {
      // 验证码验证成功
      return true
    } else {
      // 验证码错误或者已过期
      return false
    }
  } catch (err) {
    return res.error(res, '服务器错误')
  }
}

module.exports = {
  sendSmsCode,
  storeSmsCode,
  verifySmsCode
}
