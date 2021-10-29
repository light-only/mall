module.exports = (db) =>{
    return {
        getComments:async (itemId,page=1,limit=5)=>{
            let [[{count}]] = await db.query(
                "select count(`id`) as `count` from `comments` where `item_id` = ?",
                [itemId]
            )

            let pages = Math.ceil(count / limit);
            page  = Math.max(1,page);
            page = Math.min(page,pages);
            let offset = (page - 1) * limit;
                // console.log(categoryId,limit,offset,page,pages,count);
            let [comments] = await db.query(
                "select `comments`.`id`,`comments`.`item_id` as `itemId`,`comments`.`user_id` as userId,`comments`.`comment`,`comments`.`create_at` as `createAt`,`users`.`username`,`users`.`avatar` from `comments` left join `users` on `comments`.`user_id` = `users`.`id` where `item_id` =? limit ? offset ?",
                [itemId,limit,offset]
            )
            return {
                page,
                pages,
                limit,
                count,
                comments
            }
        },
        postComments:async (itemId,userId,content)=>{
            let [{insertId}] = await db.query(
                "insert into `comments` (`item_id`,`user_id`,`comment`,`create_at`) values (?,?,?,?)",
                [itemId,userId,content,Date.now()]
            )
          return insertId;  
        }
    }
}