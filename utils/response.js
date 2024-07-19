/**
 * 自定义 错误类
 */
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        // this.message = message || 'Not Found!';
    }
}


/**
 * 请求成功
 */
function success(res,message, data= {},code =200 ) {
    res.status(code).json({
        status:true,
        message,
        data
    });
}




/**
 * 请求失败
 */
function fail(res, error) {
    console.log(31,error.name)
    if(error.name === 'SequelizeValidationError'){
        let errors = error.errors.map(err => err.message)
        res.status(400).json({
            status:false,
            msg:'参数错误',
            err:errors
        })
    }else if(error.name === 'NotFoundError'){
        res.status(404).json({
            status:false,
            msg:'资源不存在',
            err:[error.message]
        })
    }else{
        res.status(500).json({
            status:false,
            msg:'服务器错误',
            err:[error.message]
        })
    }





}



module.exports = {
    NotFoundError,
    success,
    fail
};
