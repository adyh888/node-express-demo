const express = require('express');
const router = express.Router();
const {Category, Course}= require('../../models');
const {Op} =require('sequelize');
const {NotFoundError,success,fail } =require('../../utils/response');


router.get('/', async function(req, res, next) {
  try{
    const query =req.query;

    //当前页数
    const currentPage =Math.abs(parseInt(query.currentPage))  || 1;

    //每页显示多少条
    const pageSize =Math.abs(parseInt(query.pageSize))  || 10;

    //计算 从第几条开始
    const offset =(currentPage-1)*pageSize;

    const filterCriteria ={
      order: [['rank', 'ASC'], ['id', 'ASC']],
      limit: pageSize,
      offset: offset,
    }
    //模糊搜索
    if(query.name){
      filterCriteria.where = {
        name: {
          [Op.like]: `%${query.name}%`
        }
      }
    }

    const {count,rows} =await Category.findAndCountAll(filterCriteria)

    let resObj= {
      categories:rows,
      pagination:{
        currentPage: currentPage,
        pageSize: pageSize,
        totalCount: count
      }
    }
    success(res, '分类查询成功', resObj)
  }catch (e) {
    fail(res,e)
  }

});

router.get('/:id', async function(req, res, next) {
  try{
    const categoriesRes =  await getCategory(req)
    success(res, '分类查询成功', categoriesRes)
  }catch (e) {
    fail(res,e)
  }
});

router.post('/', async function(req, res, next) {
  try{
    const data = filterBody(req)
    const categoriesRes =await Category.create(data)
    success(res, '分类创建成功', categoriesRes,201)
  }catch (e) {
    fail(res,e)
  }
});

router.delete('/:id', async function(req, res, next) {
  try{
    const categoriesRes =  await getCategory(req)

    const count = await Course.count({ where: { categoryId: req.params.id } });
    if (count > 0) {
      throw new Error('当前分类有课程，无法删除。');
    }
    await categoriesRes.destroy()
    success(res, '分类删除成功', {})
  }catch (e) {
    fail(res,e)
  }

});

router.put('/:id', async function(req, res, next) {
  try{
    const categoriesRes =  await getCategory(req)
    const data = filterBody(req)
    await categoriesRes.update(data)
    success(res, '分类更新成功', categoriesRes)
  }catch (e) {
    fail(res,e)
  }
});

/**
 * 封装公共的方法：查询当前分类
 */
 getCategory = async (req)=>{
   //获取分类id
  const {id} =req.params;
  const categoriesRes =await Category.findByPk(id)
  if(!categoriesRes){
    throw new NotFoundError(`${id}分类不存在`)
  }else{
    return categoriesRes
  }
}


//白名单过滤数据
const filterBody =(req)=>{
  return {
    name: req.body.name,
    rank: req.body.rank,
  }
}

module.exports = router;
