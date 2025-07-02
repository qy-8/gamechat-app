const OSS = require('ali-oss')
const path = require('path')

// 加载 .env 文件中的环境变量
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') })

// 确认环境变量是否加载
console.log('OSS_CLIENT: ALI_SDK_BUCKET_NAME:', process.env.ALI_SDK_BUCKET_NAME)
console.log(
  'OSS_CLIENT: ALI_SDK_ACCESS_KEY_ID loaded:',
  !!process.env.ALI_SDK_ACCESS_KEY_ID
) // 打印 true 或 false

if (
  !process.env.ALI_SDK_REGION ||
  !process.env.ALI_SDK_ACCESS_KEY_ID ||
  !process.env.ALI_SDK_ACCESS_KEY_SECRET ||
  !process.env.ALI_SDK_BUCKET_NAME
) {
  console.error(
    '错误：OSS 客户端配置所需的环境变量不完整！请检查 .env 文件以及路径是否正确。'
  )
}

const client = new OSS({
  region: process.env.ALI_SDK_REGION,
  accessKeyId: process.env.ALI_SDK_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALI_SDK_ACCESS_KEY_SECRET,
  bucket: process.env.ALI_SDK_BUCKET_NAME,
  secure: true
})

module.exports = client
