import { Client } from "https://deno.land/x/mysql/mod.ts";

var migrate = async (config) => {
    var db = config.db;
    delete config.db;
    var client = await new Client().connect(config);

    var f =  async (id, sql) => {
        var r = await client.query(`select * from migration where ID=?`, [id]);
        if(r.length != 0){
            return
        }
        await client.execute(sql);
        await client.execute(`insert into migration values('${id}')`);
    };

    await client.execute(`CREATE DATABASE IF NOT EXISTS ${db}`);
    await client.execute(`USE ${db}`);
    var r = await client.execute(`show tables like 'migration'`);
    if(r.rows.length != 0 ){
        return f;
    }
    await client.execute(`
        CREATE TABLE migration (
            ID varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
            UNIQUE KEY (ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    return f;
};

export default migrate;
