const express = require('express');
const router = express.Router();
const {Chapter,Course}= require('../../models');
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

    if (!query.courseId) {
      throw new Error('获取章节列表失败，课程ID不能为空。');
    }

    const condition = {
      ...getCondition(),
      order: [['rank', 'ASC'], ['id', 'ASC']],
      limit: pageSize,
      offset: offset
    };

    condition.where = {
      courseId: {
        [Op.eq]: query.courseId
      }
    };

    if (query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${ query.title }%`
        }
      };
    }


    const {count,rows} =await Chapter.findAndCountAll(filterCriteria)

    let resObj= {
      chapters:rows,
      pagination:{
        currentPage: currentPage,
        pageSize: pageSize,
        totalCount: count
      }
    }
    success(res, '章节查询成功', resObj)
  }catch (e) {
    fail(res,e)
  }

});

router.get('/:id', async function(req, res, next) {
  try{
    const chaptersRes =  await getChapter(req)
    success(res, '章节查询成功', chaptersRes)
  }catch (e) {
    fail(res,e)
  }
});

router.post('/', async function(req, res, next) {
  try{
    const data = filterBody(req)
    const chaptersRes =await Chapter.create(data)
    success(res, '章节创建成功', chaptersRes,201)
  }catch (e) {
    fail(res,e)
  }
});

router.delete('/:id', async function(req, res, next) {
  try{
    const chaptersRes =  await getChapter(req)
    await chaptersRes.destroy()
    success(res, '章节删除成功', {})
  }catch (e) {
    fail(res,e)
  }

});

router.put('/:id', async function(req, res, next) {
  try{
    const chaptersRes =  await getChapter(req)
    const data = filterBody(req)
    await chaptersRes.update(data)
    success(res, '章节更新成功', chaptersRes)
  }catch (e) {
    fail(res,e)
  }
});

/**
 * 公共方法：关联课程数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
  return {
    attributes: { exclude: ['CourseId'] },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name']
      }
    ]
  }
}


/**
 * 封装公共的方法：查询当前章节
 */
 getChapter = async (req)=>{
   //获取章节id
  const {id} =req.params;
   const condition = getCondition();
  const chaptersRes =await Chapter.findByPk(id,condition)
  if(!chaptersRes){
    throw new NotFoundError(`${id}章节不存在`)
  }else{
    return chaptersRes
  }
}


//白名单过滤数据
const filterBody =(req)=>{
  return {
    courseId: req.body.courseId,
    title: req.body.title,
    content: req.body.content,
    video: req.body.video,
    rank: req.body.rank
  };
}

module.exports = router;
