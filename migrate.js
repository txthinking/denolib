import { Client } from "https://deno.land/x/mysql/mod.ts";

var migrate = {};

migrate.init = async (config) => {
    var db = config.db;
    delete config.db;
    migrate.client = await new Client().connect(config);
    await migrate.client.execute(`CREATE DATABASE IF NOT EXISTS ${db}`);
    await migrate.client.execute(`USE ${db}`);
    var r = await migrate.client.execute(`show tables like 'migration'`);
    if(r.rows.length != 0 ){
        return
    }
    await migrate.client.execute(`
        CREATE TABLE migration (
            ID varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
            UNIQUE KEY (ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
};

migrate.migrate = async (id, sql) => {
    var r = await migrate.client.query(`select * from migration where ID=?`, [id]);
    if(r.length != 0){
        return
    }
    await migrate.client.execute(sql);
    await migrate.client.execute(`insert into migration values('${id}')`);
};

export default migrate;
