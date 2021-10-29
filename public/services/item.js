module.exports = (db) =>{
    return {
        getItems:async (categoryId,page=1,limit=5)=>{
            let [[{count}]] = await db.query(
                "select count(`id`) as `count` from `items` where `category_id` = ?",
                [categoryId]
            )

            let pages = Math.ceil(count / limit);
            page  = Math.max(1,page);
            page = Math.min(page,pages);
            let offset = (page - 1) * limit;
                console.log(categoryId,limit,offset,page,pages,count);
            let [items] = await db.query(
                "select `id`,`category_id` as `categoryId`,`name`,`price`,`cover`,`description` from `items` where `category_id` =? limit ? offset ?",
                [categoryId,limit,offset]
            )
            return {
                page,
                pages,
                limit,
                count,
                items
            }
        },
        getItem:async(id)=>{
            let [[item]] = await db.query(
                "select `id`,`name`,`price`,`cover`,`description`,`category_id` as `categoryId` from `items` where id=?",
                [id]
            )
            return item;
        }
    }
}