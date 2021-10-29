module.exports = (db)=>{
    return {
        //获取所有的分类信息
        getCategories:async ()=>{
            let [categories] = await db.query(
                "select `id`,`name` from `categories`"
            )
            return categories;
        }
    }
}