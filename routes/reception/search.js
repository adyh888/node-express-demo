const express = require('express')
const router = express.Router()
const { Course, Category, Chapter, User } = require('../../models')
const { success, fail } = require('../../utils/responses')
const { NotFoundError } = require('../../utils/errors')
const { Op } = require('sequelize')

/**
 * 搜索课程
 * GET /courses
 */
router.get('/', async function (req, res) {
  try {
    const query = req.query
    const currentPage = Math.abs(Number(query.currentPage)) || 1
    const pageSize = Math.abs(Number(query.pageSize)) || 10
    const offset = (currentPage - 1) * pageSize

    const condition = {
      attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset
    }

    if (query.name) {
      condition.where = {
        name: {
          [Op.like]: `%${query.name}%`
        }
      }
    }

    const { count, rows } = await Course.findAndCountAll(condition)
    success(res, '搜索课程成功。', {
      courses: rows,
      pagination: {
        total: count,
        currentPage,
        pageSize
      }
    })
  } catch (error) {
    fail(res, error)
  }
})

module.exports = router
