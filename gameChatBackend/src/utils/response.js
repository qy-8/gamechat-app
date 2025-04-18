/* 
  成功响应格式（HTTP状态码 200）：
  {
    "status": "success",
    "message": "操作成功",
    "data": { ... }
  }
  错误响应格式（HTTP状态码默认 500）：
  {
    "status": "error",
    "message": "错误信息",
    "data": null
  }
*/
module.exports = {
  success: (res, data, message = '操作成功') => {
    res.status(200).json({
      status: 'success',
      message,
      data
    })
  },
  error: (res, message = '操作失败', statusCode = 500) => {
    res.status(statusCode).json({
      status: 'error',
      message,
      data: null
    })
  }
}
