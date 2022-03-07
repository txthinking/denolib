var migrate = async (db) => {
    var f =  async (id, sql) => {
        var r = await db.query(`select * from migration where ID=?`, [id]);
        if(r.length != 0){
            return
        }
        await db.execute(sql);
        await db.execute(`insert into migration values('${id}')`);
    };
    var r = await db.execute(`show tables like 'migration'`);
    if(r.rows.length != 0 ){
        return f;
    }
    await db.execute(`
        CREATE TABLE migration (
            ID varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
            UNIQUE KEY (ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    return f;
};

export default migrate;
