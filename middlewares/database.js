const mysql = require('mysql2/promise');
const getCategoryService = require('../public/services/category');
const getItemService = require('../public/services/item');
const getUserService = require('../public/services/user');

const getCommentService = require('../public/services/comment')

let db;
let services;

module.exports = (config) =>{
    return async(ctx,next)=>{
        //避免每次执行这个中间件的时候，都链接一下数据库
        if(!db){
            db = await mysql.createConnection(config);
            services = {
                category:getCategoryService(db),
                item:getItemService(db),
                user:getUserService(db),
                comment:getCommentService(db)
            }
        }
        ctx.state.db = db;
        ctx.state.services = services;
        await next();
    }
}