module.exports = {
    server:{
        port :8888
    },
    static :{
        prefix:'/public',
        dir:'./public',
        gzip:true,
        dynamic:true
    },
    database:{
        host:'localhost',
        part:3306,
        user:'root',
        password:'',
        database:'light-db'
    },
    template:{
        dir:'./template'
    },
    user:{
        cookieSignKey:['kkb-mall']
    }
}