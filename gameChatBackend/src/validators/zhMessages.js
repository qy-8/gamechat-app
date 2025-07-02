module.exports = {
  username: {
    'string.base': '用户名格式不正确',
    'string.alphanum': '用户名只能包含字母和数字',
    'string.min': '用户名至少要有 3 个字符',
    'string.max': '用户名最多只能有 15 个字符',
    'any.required': '请输入用户名',
    'string.empty': '用户名不能为空'
  },
  password: {
    'string.base': '密码格式不正确',
    'string.pattern.base': '密码长度需为 6-12 位，不能包含空格',
    'any.required': '请输入密码',
    'string.empty': '密码不能为空'
  },
  nickname: {
    'string.base': '昵称格式不正确',
    'string.min': '昵称不能为空',
    'string.max': '昵称不能超过 20 个字符',
    'any.required': '请输入昵称',
    'string.empty': '昵称不能为空'
  },
  avatar: {
    'string.base': '头像格式不正确',
    'string.dataUri': '头像数据格式不正确，请上传正确的图片',
    'any.required': '请上传头像',
    'string.empty': '头像不能为空'
  },
  phoneNumber: {
    'string.base': '手机号格式不正确',
    'string.pattern.base': '请输入正确的 11 位手机号',
    'any.required': '请输入手机号',
    'string.empty': '手机号不能为空'
  },
  captcha: {
    'string.base': '验证码格式不正确',
    'string.pattern.base': '验证码应为 5 位字母或数字',
    'any.required': '请输入验证码',
    'string.empty': '验证码不能为空'
  },
  code: {
    'string.base': '验证码格式不正确',
    'string.length': '验证码必须是 6 位数字',
    'string.pattern.base': '验证码格式错误，请输入 6 位数字',
    'any.required': '请输入验证码',
    'string.empty': '短信验证码不能为空'
  }
}
