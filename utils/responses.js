/**
 * 请求成功
 */
function success(res, message, data = {}, code = 200) {
  res.status(code).json({
    status: true,
    message,
    data
  })
}

/**
 * 请求失败
 */
function fail(res, error) {
  // console.log(31, error.name)
  if (error.name === 'SequelizeValidationError') {
    let errors = error.errors.map(err => err.message)
    res.status(400).json({
      status: false,
      msg: '参数错误',
      err: errors
    })
  } else if (error.name === 'NotFoundError') {
    res.status(404).json({
      status: false,
      msg: '资源不存在',
      err: [error.message]
    })
  } else if (error.name === 'BadRequestError') {
    return res.status(400).json({
      status: false,
      message: '请求参数错误',
      errors: [error.message]
    })
  } else if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: false,
      message: '认证失败',
      errors: [error.message]
    })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: false,
      message: '认证失败',
      errors: ['您提交的 token 错误。']
    })
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: false,
      message: '认证失败',
      errors: ['您的 token 已过期。']
    })
  } else {
    res.status(500).json({
      status: false,
      msg: '服务器错误',
      err: [error.message]
    })
  }
}

module.exports = {
  success,
  fail
}
