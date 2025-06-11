const express = require('express')
const router = express.Router()
const { resetPassword } = require('../controller/passwordController')
const expressJoi = require('@escook/express-joi')
const { resetPasswordSchema } = require('../validators/userValidator')
const authMiddleware = require('../middlewares/authMiddleware')

/**
 * @swagger
 * /api/auth/users/me/password:
 *   put:
 *     summary: "重设密码"
 *     description: "重设密码。需要在请求头 `Authorization` 中携带 Token。"
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPwd
 *               - phoneNumber
 *               - code
 *             properties:
 *               newPwd:
 *                 type: string
 *                 format: password
 *                 description: "新密码"
 *                 example: "strongpassword123"
 *               phoneNumber:
 *                 type: string
 *                 description: "手机号码"
 *                 example: "13849508394"
 *               code:
 *                 type: string
 *                 description: "手机验证码"
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: "密码重置成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "密码重置成功"
 *       400:
 *         description: "请求错误，包括用户不存在"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "用户不存在"
 */

router.put(
  '/users/me/password',
  authMiddleware,
  expressJoi(resetPasswordSchema),
  resetPassword
)

// 上面改成了put，待测试
module.exports = router
