const express = require('express')
const router = express.Router()
const { Course, Category, User, Chapter } = require('../../models')
const { Op } = require('sequelize')
const { NotFoundError } = require('../../utils/errors')
const { success, fail } = require('../../utils/responses')

router.get('/', async function (req, res, next) {
  try {
    const query = req.query

    //当前页数
    const currentPage = Math.abs(parseInt(query.currentPage)) || 1

    //每页显示多少条
    const pageSize = Math.abs(parseInt(query.pageSize)) || 10

    //计算 从第几条开始
    const offset = (currentPage - 1) * pageSize

    const filterCriteria = {
      ...getCondition(),
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset
    }
    //模糊搜索
    if (query.categoryId) {
      filterCriteria.where = {
        categoryId: {
          [Op.eq]: query.categoryId
        }
      }
    }

    if (query.userId) {
      filterCriteria.where = {
        userId: {
          [Op.eq]: query.userId
        }
      }
    }

    if (query.name) {
      filterCriteria.where = {
        name: {
          [Op.like]: `%${query.name}%`
        }
      }
    }

    if (query.recommended) {
      filterCriteria.where = {
        recommended: {
          // 需要转布尔值
          [Op.eq]: query.recommended === 'true'
        }
      }
    }

    if (query.introductory) {
      filterCriteria.where = {
        introductory: {
          [Op.eq]: query.introductory === 'true'
        }
      }
    }

    const { count, rows } = await Course.findAndCountAll(filterCriteria)

    let resObj = {
      courses: rows,
      pagination: {
        currentPage: currentPage,
        pageSize: pageSize,
        totalCount: count
      }
    }
    success(res, '课程查询成功', resObj)
  } catch (e) {
    fail(res, e)
  }
})

router.get('/:id', async function (req, res, next) {
  try {
    const coursesRes = await getCourse(req)
    success(res, '课程查询成功', coursesRes)
  } catch (e) {
    fail(res, e)
  }
})

router.post('/', async function (req, res, next) {
  try {
    const data = filterBody(req)

    // 获取当前登录的用户 ID
    data.userId = req.user.id
    const coursesRes = await Course.create(data)
    success(res, '课程创建成功', coursesRes, 201)
  } catch (e) {
    fail(res, e)
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    const coursesRes = await getCourse(req)
    const count = await Chapter.count({ where: { courseId: req.params.id } })
    if (count > 0) {
      throw new Error('当前课程有章节，无法删除。')
    }
    await coursesRes.destroy()
    success(res, '课程删除成功', {})
  } catch (e) {
    fail(res, e)
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    const coursesRes = await getCourse(req)
    const data = filterBody(req)
    await coursesRes.update(data)
    success(res, '课程更新成功', coursesRes)
  } catch (e) {
    fail(res, e)
  }
})

/**
 * 公共方法：关联分类、用户数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
  return {
    attributes: { exclude: ['CategoryId', 'UserId'] },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar']
      }
    ]
  }
}

/**
 * 封装公共的方法：查询当前课程
 */
getCourse = async req => {
  //获取课程id
  const { id } = req.params
  const condition = getCondition()
  const coursesRes = await Course.findByPk(id, condition)
  if (!coursesRes) {
    throw new NotFoundError(`${id}课程不存在`)
  } else {
    return coursesRes
  }
}

//白名单过滤数据
const filterBody = req => {
  return {
    categoryId: req.body.categoryId,
    // userId: req.body.userId,
    name: req.body.name,
    image: req.body.image,
    recommended: req.body.recommended,
    introductory: req.body.introductory,
    content: req.body.content
  }
}

module.exports = router
