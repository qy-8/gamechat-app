const fs = require('fs')
const path = require('path')
const swaggerJsdoc = require('swagger-jsdoc')

const swaggerDocs = require('./src/swagger')

// 将对象转换为格式化的 JSON 字符串
const jsonContent = JSON.stringify(swaggerDocs, null, 2)

// 定义输出路径。
const outputPath = path.join(__dirname, 'swagger.json')

// 将JSON内容写入文件
fs.writeFileSync(outputPath, jsonContent, 'utf8')

console.log(`生成成功,路径: ${outputPath}`)
