const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 配置上传存储位置和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/'

    // 如果 uploads 不存在则创建它
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath) // 上传到项目根目录的 uploads 文件夹
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const randomNumber = Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    // 组合文件名
    const generatedFilename = `${timestamp}-${randomNumber}${extension}`

    cb(null, generatedFilename)
  }
})

// 文件过滤器，只允许图片类型文件
const fileFilter = (req, file, cb) => {
  // 检查文件的 MIME 类型是否以 'image/' 开头
  if (file.mimetype.startsWith('image/')) {
    cb(null, true) // 接受这个文件
  } else {
    // 传递一个错误对象来拒绝文件
    cb(new Error('只允许上传图片文件'), false)
  }
}

// 定义文件大小限制 (2MB)
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

// 创建 multer 实例
const upload = multer({
  storage: storage, // 存储配置
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES // 限制文件大小
  },
  fileFilter: fileFilter // 使用文件类型过滤器
})

module.exports = upload
