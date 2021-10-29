module.exports = (db)=>{
    return {
        getUserByUsername:async username=>{
            let [[user]] = await db.query(
                "select `id`,`username`,`password`,`avatar` from `users` where `username` = ?",
                [username]
            )
            return user;
        },
        signup:async (username,password)=>{
            let [{insertId}] = await db.query(
                "insert into `users` (`username`,`password`) values (?,?)",
                [username,password]
            )
            if(!insertId){
                return null;
            }
            return {
                id:insertId,
                username
            }
        },
        postAvatar:async (id,avatar)=>{
            await db.query(
                "update `users` set `avatar`=? where `id` = ?",
                [avatar,id]
            )
            return true;
        }
    }
}