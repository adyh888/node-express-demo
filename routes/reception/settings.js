const express = require('express')
const router = express.Router()
const { Setting } = require('../../models')
const { NotFoundError } = require('../../utils/errors')
const { success, fail } = require('../../utils/responses')

/**
 * 查询系统信息
 * GET /admin/settings
 */
router.get('/', async function (req, res) {
  try {
    const setting = await Setting.findOne()
    if (!setting) {
      throw new NotFoundError('未找到系统设置，请联系管理员。')
    }

    success(res, '查询系统信息成功。', { setting })
  } catch (error) {
    fail(res, error)
  }
})

module.exports = router
