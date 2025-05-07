const multer = require('multer')
const path = require('path')

// 配置上传存储位置和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // 上传到项目根目录的 uploads 文件夹
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    cb(null, timestamp + path.extname(file.originalname))
  }
})

// 创建 multer 实例
const upload = multer({ storage })

module.exports = upload
