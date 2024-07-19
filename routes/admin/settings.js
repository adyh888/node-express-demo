const express = require('express');
const router = express.Router();
const {Setting}= require('../../models');
const {NotFoundError,success,fail } =require('../../utils/response');



router.get('/', async function(req, res, next) {
  try{
    const settingsRes =  await getSetting()
    success(res, '系统设置查询成功', settingsRes)
  }catch (e) {
    fail(res,e)
  }
});



router.put('/', async function(req, res, next) {
  try{
    const settingsRes =  await getSetting()
    const data = filterBody(req)
    await settingsRes.update(data)
    success(res, '系统设置更新成功', settingsRes)
  }catch (e) {
    fail(res,e)
  }
});

/**
 * 封装公共的方法：查询当前系统设置
 */
 getSetting = async ()=>{
   //获取系统设置id
  const settingsRes =await Setting.findByPk(1)
  if(!settingsRes){
    throw new NotFoundError(`${id}系统设置不存在`)
  }else{
    return settingsRes
  }
}


//白名单过滤数据
const filterBody =(req)=>{
  return {
    name: req.body.name,
    icp: req.body.icp,
    copyright: req.body.copyright
  }
}

module.exports = router;
