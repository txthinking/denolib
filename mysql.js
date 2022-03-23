import { Client } from "https://deno.land/x/mysql@v2.10.2/mod.ts";

var db = (conn, istx = false)=>{
    return {
        c: async (table, o) => {
            var l = [];
            var l1 = [];
            var l2 = [];
            var l3 = [];
            for(var k in o){
                if(k == 'id'){
                    continue;
                }
                l.push('??');
                l1.push('?');
                l2.push(k);
                l3.push(o[k]);
            }
            var r = await conn.execute(`insert into ??(${l.join(', ')}) values(${l1.join(', ')})`, [table].concat(l2).concat(l3));
            r = await conn.query(`select * from ?? where id=?`, [table, r.lastInsertId]);
            return r[0];
        },
        u: async (table, o) => {
            if(!o.id){
                throw new Error('mysql.u needs object has id');
                return;
            }
            var l = [];
            var l2 = [];
            l2.push(table);
            for(var k in o){
                if(k == 'id'){
                    continue;
                }
                l.push('??=?');
                l2.push(k);
                l2.push(o[k]);
            }
            l2.push(o.id);
            await conn.execute(`update ?? set ${l.join(', ')} where id=?`, l2);
            var r = await conn.query(`select * from ?? where id=?`, [table, o.id]);
            if(r.length == 0){
                return null;
            }
            return r[0];
        },
        r: async (table, id) => {
            var r = await conn.query(`select * from ?? where id=?`, [table, id]);
            if(r.length == 0){
                return null;
            }
            return r[0];
        },
        d: async (table, id) => {
            await conn.query(`delete from ?? where id=?`, [table, id]);
        },
        query: async (...args) => {
            return await conn.query(...args);
        },
        execute: async (...args) => {
            return await conn.execute(...args);
        },
        transaction: istx ? null : async(f)=>{
            return await conn.transaction(async (conn) => {
                return await f(db(conn, true));
            });
        },
        close: async()=>{
            await conn.close();
        },
    };
};

var mysql = async (config) => {
    var dbname = config.db;
    delete config.db;
    var conn = await new Client().connect(config);
    await conn.execute(`CREATE DATABASE IF NOT EXISTS ${dbname}`);
    await conn.close();
    config.db = dbname;
    var conn = await new Client().connect(config);
    return db(conn);
};

export default mysql;
