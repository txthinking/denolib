## denolib

A deno library, keep everything small.

## httpserver.js

```
import httpserver from 'https://raw.githubusercontent.com/txthinking/denolib/master/httpserver.js';

httpserver.path('/', async (r)=>{
      return new Response("hello world", {
        status: 200,
      });
});

httpserver.run(2020);
```

cors

```
httpserver.cors = '*';
```

404

```
httpserver.notfound = (r) => {...}
```

### crypto

```
import crypto from 'https://raw.githubusercontent.com/txthinking/denolib/master/crypto.js';

var kv = crypto("abcdefghijklmnopqrstuvwxyz012345"); // pass in a 32 length key

var token = kv.encrypt("uid", 1);

var uid = kv.decrypt("uid", token);
var uid = kv.decrypt("uid", token, 30*24*60*60); // only allow token to be valid for 30 days
```

### mysql

connect

```
import mysql from 'https://raw.githubusercontent.com/txthinking/denolib/master/mysql.js';

var db = await mysql({
    hostname: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "111111",
    poolSize: 3,
});
```

migrate

```
import migrate from 'https://raw.githubusercontent.com/txthinking/denolib/master/migrate.js';

var mg = await migrate(db, 'dbname'); // don't need to create database manually

// each unique id execute at most once
await mg("a unique id string", `
    CREATE TABLE user (
        id int(10) unsigned NOT NULL AUTO_INCREMENT,
        email varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL default '',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await mg("another unique id string", 'another sql');
```

curd

> if you want to use this four methods, set auto increment primary key: id, set not null and default value for each field

```
// table name and row object, keys must match table fields or less
var row = await db.c('user', {email: 'hi@httpserver.com'});

// object keys must match table fields or less and must contain id
var row = await db.u('user', {id: 1, email: 'hey@httpserver.com'});

// pass in id
var row = await db.r('user', 1);

// pass in id
await db.d('user', 1);
```

sql

```
var rows = await db.query('select * from user where id=?', [1]);
await db.execute('update user set email=? where id=?', ['hi@httpserver.com', 1]);
```

transaction

```
var r = await db.transaction(async (db)=>{
    var r = await db.c('user', {email: 'hey@httpserver.com'});
    // throw new Error('rollback');
    await db.execute('update user set email=? where id=?', ['hi@httpserver.com', 1]);
    var rows = await db.query('select * from user where id=?', [1]);
    return rows;
});
```

### redis.js

connect

```
import redis from 'https://raw.githubusercontent.com/txthinking/denolib/master/redis.js';

var rds = await redis({
    hostname: "127.0.0.1",
    port: 6379,
});
```

command

```
var r = await rds.exec('set', 'hi', 'httpserver');
var r = await rds.exec('get', 'hi');
```

pipeline

```
await rds.pipeline((rds)=>{
    rds.exec('set', 'hi', 'httpserver');
    rds.exec('set', 'hey', 'httpserver');
});
```

transaction

> Guarantee atomicity

```
await rds.transaction((rds)=>{
    rds.exec('set', 'hi', 'httpserver1');
    rds.exec('set', 'hey', 'httpserver2');
});
```

subscribe

```
var ch = await rds.subscribe('channel');
for await (var v of ch.receive()) {
    console.log(v);
}
```
