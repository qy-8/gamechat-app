const swaggerJsDoc = require('swagger-jsdoc')
const response = require('./utils/response')

// Swagger 配置对象

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // 使用 OpenAPI 3.0 版本
    info: {
      title: 'Game Chat API', // API 的标题
      version: '1.0.0', // API 版本
      description: 'API documentation for the Game Chat project' // 描述
    },
    servers: [
      {
        url: 'http://localhost:3000', // API 服务器地址
        description: 'Development server' // 描述（可选）
      }
    ],
    // 定义通用结构
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              example: '操作成功'
            },
            data: {
              type: 'object',
              additionalProperties: true,
              example: {}
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: '操作失败'
            },
            data: {
              type: 'null',
              example: null
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // 从app.js出发到有swagger注释的文件路径
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)

module.exports = swaggerDocs
