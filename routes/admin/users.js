const express = require('express')
const router = express.Router()
const { User } = require('../../models')
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
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset
    }
    //模糊搜索
    if (query.email) {
      filterCriteria.where = {
        email: {
          [Op.eq]: query.email
        }
      }
    }

    if (query.username) {
      filterCriteria.where = {
        username: {
          [Op.eq]: query.username
        }
      }
    }

    if (query.nickname) {
      filterCriteria.where = {
        nickname: {
          [Op.like]: `%${query.nickname}%`
        }
      }
    }

    if (query.role) {
      filterCriteria.where = {
        role: {
          [Op.eq]: query.role
        }
      }
    }

    const { count, rows } = await User.findAndCountAll(filterCriteria)

    let resObj = {
      users: rows,
      pagination: {
        currentPage: currentPage,
        pageSize: pageSize,
        totalCount: count
      }
    }
    success(res, '用户查询成功', resObj)
  } catch (e) {
    fail(res, e)
  }
})

router.get('/:id', async function (req, res, next) {
  try {
    const usersRes = await getUser(req)
    success(res, '用户查询成功', usersRes)
  } catch (e) {
    fail(res, e)
  }
})

router.post('/', async function (req, res, next) {
  try {
    const data = filterBody(req)
    const usersRes = await User.create(data)
    success(res, '用户创建成功', usersRes, 201)
  } catch (e) {
    fail(res, e)
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    const usersRes = await getUser(req)
    const data = filterBody(req)
    await usersRes.update(data)
    success(res, '用户更新成功', usersRes)
  } catch (e) {
    fail(res, e)
  }
})

/**
 * 封装公共的方法：查询当前用户
 */
getUser = async req => {
  //获取用户id
  const { id } = req.params
  const usersRes = await User.findByPk(id)
  if (!usersRes) {
    throw new NotFoundError(`${id}用户不存在`)
  } else {
    return usersRes
  }
}

//白名单过滤数据
const filterBody = req => {
  return {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    nickname: req.body.nickname,
    sex: req.body.sex,
    company: req.body.company,
    introduce: req.body.introduce,
    role: req.body.role,
    avatar: req.body.avatar
  }
}

module.exports = router
