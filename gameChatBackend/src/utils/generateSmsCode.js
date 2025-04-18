// 生成 6 位随机数字字符串
const generateSmsCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

module.exports = {
  generateSmsCode
}
