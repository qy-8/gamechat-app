const response = require('../utils/response')
const svgCaptcha = require('svg-captcha') // 引入 svg-captcha 库，用于生成图形验证码

// 发送图形验证码到客户端
const getCaptcha = (req, res) => {
  // 设置图形验证码长度，干扰线数量，文字是否使用颜色，图片背景颜色
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 5,
    color: false,
    background: '#f4f4f4'
  })
  req.session = req.session || {}
  console.log('图形验证码为', captcha.text)
  req.session.captcha = captcha.text // 验证码文本存储到 session 中以验证
  const base64Captcha = Buffer.from(captcha.data).toString('base64')
  // res.type('svg') // 返回 SVG 格式
  // response.success(res, captcha.data, '成功获取图形验证码')
  // res.status(200).send(captcha.data) // 返回验证码的 SVG 图片
  res.json({
    status: 'success',
    data: `data:image/svg+xml;base64,${base64Captcha}`
  })
}

// 验证图形验证码
const verifyCaptcha = (req, captcha) => {
  if (req.session.captcha) {
    // 忽略大小写比较
    return req.session.captcha.toLowerCase() === captcha.toLowerCase()
  }
}

module.exports = {
  getCaptcha,
  verifyCaptcha
}
