import { Client } from "https://deno.land/x/mysql/mod.ts";

var mysql = {};

mysql.init = async (config) => {
    mysql.client = await new Client().connect(config);
};

mysql.c = async (table, o) => {
    var l = [];
    var l1 = [];
    var l2 = [];
    l2.push(table);
    for(var k in o){
        if(k == 'id'){
            continue;
        }
        l.push('??');
        l1.push('?');
        l2.push(k);
        l2.push(o[k]);
    }
    var r = await mysql.client.execute(`insert into ??(${l.join(', ')}) values(${l1.join('?, ')})`, l2);
    r = await mysql.client.query(`select * from ?? where id=?`, [table, r.lastInsertId]);
    return r[0];
};

mysql.u = async (table, o) => {
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
    await mysql.client.execute(`update ?? set ${l.join(', ')} where id=?`, l2);
    var r = await mysql.client.query(`select * from ?? where id=?`, [table, o.id]);
    if(r.length == 0){
        return null;
    }
    return r[0];

};

mysql.r = async (table, id) => {
    var r = await mysql.client.query(`select * from ?? where id=?`, [table, id]);
    if(r.length == 0){
        return null;
    }
    return r[0];
};

mysql.d = async (table, id) => {
    await mysql.client.query(`delete from ?? where id=?`, [table, id]);
};

mysql.query = async (...args) => {
    return await mysql.client.query(...args);
};
mysql.execute = async (...args) => {
    return await mysql.client.execute(...args);
};

var tx = (conn)=>{
    return {
        c: async (table, o) => {
            var l = [];
            var l1 = [];
            var l2 = [];
            l2.push(table);
            for(var k in o){
                if(k == 'id'){
                    continue;
                }
                l.push('??');
                l1.push('?');
                l2.push(k);
                l2.push(o[k]);
            }
            var r = await conn.execute(`insert into ??(${l.join(', ')}) values(${l1.join('?, ')})`, l2);
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
    };
};

mysql.transaction = async(fn)=>{
    return await mysql.client.transaction(async (conn) => {
        return await fn(tx(conn));
    });
};

export default mysql;
