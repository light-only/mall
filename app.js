const Koa = require('koa');
const KoaStaticCache = require('koa-static-cache');
const KoaRouter = require('koa-router');

const config = require('./config')
const databaseMiddlewares = require('./middlewares/database');

const tplMiddlewares = require('./middlewares/tpl');

const userMiddlewares = require('./middlewares/user');

const authMiddlewares = require('./middlewares/auth');

const koaBody = require('koa-body');

const  server = new Koa();
const router = new KoaRouter();

//cookie sign key
server.keys = config.user.cookieSignKey;

//静态资源
server.use(KoaStaticCache(config.static));

//数据库中间件
server.use(databaseMiddlewares(config.database));

//模板引擎中间件
server.use(tplMiddlewares(config.template));

//用户
server.use(userMiddlewares());

//路由
//首页
router.get('/',async(ctx,next)=>{
    
    let categoryService =  ctx.state.services.category;
    let itemService = ctx.state.services.item;

    let categories = await categoryService.getCategories();
    let categoryItems = [];

    for(let i=0; i<categories.length;i++){
        let category = categories[i];
        let {items} = await itemService.getItems(category.id);
        categoryItems.push({
            categoryId:category.id,
            categoryName:category.name,
            items
        })
    }
    
    console.log(categories);
    console.log('categoryItems',categoryItems.items);

     ctx.render('index.html',{
         user:ctx.state.user,
         categories,
         categoryItems
     });
});

//列表
router.get('/list/:categoryId',async(ctx,next)=>{
    //获取当前id
    let {categoryId} = ctx.params;
    console.log(ctx.params);
    //获取页数和limit
    let {page,limit} = ctx.query;
    categoryId = Number(categoryId);
    //后面是默认值的写法
    page = Number(page) || 1;
    limit = Number(limit) || 4;
    //返回的是一个对象
    let categoryService = ctx.state.services.category;
    // console.log(categoryService);
    let categories = await categoryService.getCategories();
    // console.log(categories);

    let itemService = ctx.state.services.item;
    // console.log(itemService);

    let category = categories.find(c=>c.id == categoryId);
    let items = await itemService.getItems(categoryId,page,limit);
    // console.log(items);

    ctx.render('list.html',{
        user:ctx.state.user,
        categories,
        category,
        items
    })
})

//详情页
router.get('/detail/:itemId',async(ctx,next)=>{
    let {itemId} = ctx.params;
    let {page,limit} = ctx.query;
    itemId = Number(itemId);
    page = Number(page) || 1;
    limit = Number(limit) || 4;

    let categoryService = ctx.state.services.category;
    let categories = await categoryService.getCategories();

    let itemService = ctx.state.services.item;

    let item = await itemService.getItem(itemId);
    let category = categories.find(c=>c.id == item.categoryId);

    let commentService = ctx.state.services.comment;
    let comments = await commentService.getComments(item.id,page,limit); 
    // let commentsA = '../' + comments.comments[0].avatar;
    // comments = {...comments.comments[0],avatar:commentsA};
    // comments = [comments]
    // console.log(comments);
    // comments = [{...comments.comments[0],avatar=commentsA}];
    
    console.log('comments',comments);

    ctx.render('detail.html',{
        user:ctx.state.user,
        categories,
        category,
        item,
        comments
    })
})

//注册页面

router.get('/signup',async(ctx,next)=>{
    let categoryService = ctx.state.services.category;
    let categories = await categoryService.getCategories();

    ctx.render('signup.html',{
        user:ctx.state.user,
        categories
    })
});

//注册提交处理

router.post('/signup',koaBody(), async(ctx,next)=>{
    let categoryService = ctx.state.services.category;
    let categories = await categoryService.getCategories();
    
    let {username,password,repassword} = ctx.request.body;
    console.log(ctx.request.body);
    if(!username || !password || !repassword){
        return ctx.render('message.html',{
            user:ctx.state.user,
            categories,
            message:'注册失败',
            reasons:['注册信息不完整'],
            url:'javascript:window.history.back()'
        })
    }
    if(password != repassword){
        return ctx.render('message.html',{
            user:ctx.state.user,
            categories,
            message:'注册失败',
            reasons:['两次密码输入不一致'],
            url:'javascript:window.history.back()'
        })
    }
    let userService = ctx.state.services.user;
    let user = await userService.getUserByUsername(username);

    if(user){
        return ctx.render('message.html',{
            user:ctx.state.user,
            categories,
            message:'注册失败',
            reasons:['用户名已经存在'],
            url:'javascript:window.history.back()'
        })
    }

    let loginUser = await userService.signup(username,password);

    if(!loginUser){
        return ctx.render('message.html',{
            user:ctx.state.user,
            categories,
            message:'注册失败',
            reasons:'',
            url:'javascript:window.history.back()'
        })
    }
    ctx.render('message.html',{
        user:ctx.state.user,
        categories,
        message:'注册成功',
        url:'/signin'
    })
});

//登录
router.get('/signin',async(ctx,next)=>{
    let categoryService = ctx.state.services.category;
    let categories = await categoryService.getCategories();

    ctx.render('signin.html',{
        user:ctx.state.user,
        categories
    })
});

//登录提交处理
router.post('/signin',koaBody(), async(ctx,next)=>{
    let categoryService = ctx.state.services.category;
    let categories = await categoryService.getCategories();

    let {username,password} = ctx.request.body;
    if(!username || !password){
        return ctx.render('message.html',{
            user:ctx.state.user,
            categories,
            message:'登录失败',
            reasons:['登陆信息不完整'],
            url:'javascript:window.history.back()'
        })
    }
    let userService = ctx.state.services.user;
    let user = await userService.getUserByUsername(username);

    //验证密码是否一致
    if(!user || user.password != password){
        return ctx.render('message.html',{
            user:ctx.state.user,
            categories,
            message:'登录失败',
            reasons:['用户不存','密码不正确'],
            url:'javascript:window.history.back()'
        })
    }
    ctx.cookies.set('user',JSON.stringify({
        id:user.id,
        username:user.username
    }),{
        signed:true
    });

    //登陆成功
    ctx.render('message.html',{
        user:ctx.state.user,
        categories,
        message:'登陆成功',
        url:'/'
    })

});

//个人中心
router.get('/user',authMiddlewares(),async(ctx,next)=>{
    let categoryService = ctx.state.services.category;
    let categories = await categoryService.getCategories();

    let userService = ctx.state.services.user;
    let user = await userService.getUserByUsername(ctx.state.user.username);
    console.log(user,111);
    ctx.render('user.html',{
        user:{...ctx.state.user,avatar:user.avatar},
        categories
    })
});

//头像上传
router.post('/avatar',koaBody({
    multipart:true,
    formidable:{
        uploadDir:'./public/avatar',
        keepExtensions:true
    }
}) ,async(ctx,next)=>{

    let avatar = ctx.request.files.avatar;
    console.log(avatar);
    let userService = ctx.state.services.user;
    let reg = /\\+/g;
    let aPath = avatar.path.replace(reg,'/')
    let rs = await userService.postAvatar(ctx.state.user.id,aPath);
    ctx.redirect('/user');
});

//评论
router.post('/comment',authMiddlewares(),koaBody(), async(ctx,next)=>{
    let categoryService = ctx.state.services.category;
    let categories = await categoryService.getCategories();

    let {itemId,content} = ctx.request.body;

    console.log(content);


    if(!content){
        return ctx.render('message.html',{
            user:ctx.state.user,
            categories,
            message:'评论失败',
            reasons:['评论内容不能为空'],
            url:'javascript:window.history.back()'
        })
    }
    let commentService = ctx.state.services.comment;
    let commentId = await commentService.postComments(itemId,ctx.state.user.id,content);


        ctx.render('message.html',{
            user:ctx.state.user,
            categories,
            message:'评论成功',
            reasons:[''],
            url:`/detail/${itemId}`
        })

});

server.use(router.routes());


router.get('/',async(ctx,next)=>{

})

server.listen(config.server.port,()=>{
    console.log('服务启动成功：http://localhost:8888/');
});
