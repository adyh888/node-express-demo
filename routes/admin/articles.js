const express = require('express')
const router = express.Router()
const { Article } = require('../../models')
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
    if (query.title) {
      filterCriteria.where = {
        title: {
          [Op.like]: `%${query.title}%`
        }
      }
    }

    const { count, rows } = await Article.findAndCountAll(filterCriteria)

    let resObj = {
      articles: rows,
      pagination: {
        currentPage: currentPage,
        pageSize: pageSize,
        totalCount: count
      }
    }
    success(res, '文章查询成功', resObj)
  } catch (e) {
    fail(res, e)
  }
})

router.get('/:id', async function (req, res, next) {
  try {
    const articlesRes = await getArticle(req)
    success(res, '文章查询成功', articlesRes)
  } catch (e) {
    fail(res, e)
  }
})

router.post('/', async function (req, res, next) {
  try {
    const data = filterBody(req)
    const articlesRes = await Article.create(data)
    success(res, '文章创建成功', articlesRes, 201)
  } catch (e) {
    fail(res, e)
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    const articlesRes = await getArticle(req)
    await articlesRes.destroy()
    success(res, '文章删除成功', {})
  } catch (e) {
    fail(res, e)
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    const articlesRes = await getArticle(req)
    const data = filterBody(req)
    await articlesRes.update(data)
    success(res, '文章更新成功', articlesRes)
  } catch (e) {
    fail(res, e)
  }
})

/**
 * 封装公共的方法：查询当前文章
 */
getArticle = async req => {
  //获取文章id
  const { id } = req.params
  const articlesRes = await Article.findByPk(id)
  if (!articlesRes) {
    throw new NotFoundError(`${id}文章不存在`)
  } else {
    return articlesRes
  }
}

//白名单过滤数据
const filterBody = req => {
  return {
    title: req.body.title,
    content: req.body.content
  }
}

module.exports = router
