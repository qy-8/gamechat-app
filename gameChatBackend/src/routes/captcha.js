const express = require('express')

// const { swaggerDocs } = require('../swagger')
const router = express.Router()
const { getCaptcha } = require('../handler/captchaHandler')

/**
 * @swagger
 * /api/captcha:
 *   get:
 *     summary: "发送图形验证码"
 *     description: "发送图形验证码。返回 SVG 格式的验证码图片。验证码文本会存储在服务器端 session 中以供后续验证。"
 *     tags:
 *       - Captcha
 *     responses:
 *       200:
 *         description: "返回图形验证码（SVG 格式）"
 *         content:
 *           text/plain:
 *             example: |
 *               <svg xmlns="http://www.w3.org/2000/svg"
 *                    width="100" height="40">
 *                 <rect width="100%" height="100%" fill="#f4f4f4"/>
 *                 <text x="10" y="25" font-size="24" fill="#000">A1B2C</text>
 *               </svg>
 */

router.get('/captcha', getCaptcha)

module.exports = router
