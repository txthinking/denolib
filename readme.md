## sf

A stupid javascript web framework for deno

### How stupid

* Don't care HTTP status code, method and header
* Don't care cookie and session concepts
* Only handle query key with one value
* If there is a body, should be json parseable
* Always respond json body
* No middlewares, no wildcard route, no group route
* Recommand auto increment primary id for mysql table
* Less design, prefer raw SQL, raw redis commands
* Javascript, no class, no typescript

### Basic

```
import {sf} from 'https://raw.githubusercontent.com/txthinking/sf/master/mod.js';

sf.handle('/', async (r)=>{
    // Must return json parseable result
    return { hello: "world" };
});

sf.run(2020);
```

```
$ curl -v http://127.0.0.1:2020
```

### Request data

```
sf.handle('/hello', async (r)=>{
    console.log(r.query); // query object
    console.log(r.json); // json body object
    return { hello: "world" };
});
```

```
$ curl -v -d '{"hey":"girl"}' http://127.0.0.1:2020/hello?hey=boy
```

### Response helper(if you like this fomart)

```
{error: null/string, data: null/object}
```

```
sf.handle('/hello', async (r)=>{
    return sf.err('a error string');
    return sf.ok({ hello: "world" });
});
```

### Websocket

```
sf.wshandle('/ws', async (r, ws)=>{
    for await (var v of ws) {
        if (typeof v === "string") {
            console.log("text", v);
            await ws.send(v);
        }
        if (v instanceof Uint8Array) {
            console.log("binary", v);
        }
    }
});
```

### Before and after hooks

```
sf.before = (r) => {
    console.log('if you want to do something before handle, do it here')
}
sf.after = (r) => {
    console.log('if you want to do something after handle, do it here')
    console.log(r, r.query, r.json, r.reply)
}
```

### HTTPS

```
sf.run({
    port: 443,
    hostname: 'localhost',
    certFile: './cert.pem',
    keyFile: './cert_key.pem',
})
```

### CORS

```
sf.cors = '*'; // default '*'
```

### Debug

```
sf.debug = true; // default false
```

### Cookie? Session? No. Let's Token

Waiting for [#3403](https://github.com/denoland/deno/issues/3403)

```
import {ckv} from 'https://raw.githubusercontent.com/txthinking/sf/master/mod.js';

var kv = ckv("abcdefghijklmnopqrstuvwxyz012345"); // pass in a 32 length key

var token = kv.encrypt("uid", 1);
var uid = kv.decrypt("uid", token);
var uid = kv.decrypt("uid", token, 30*24*60*60); // only allow tokens to be valid for 30 days
```

> Just pass the token in query or json body, no magic.

### Database migration(mysql)

```
import {migrate} from 'https://raw.githubusercontent.com/txthinking/sf/master/mod.js';

var mg = await migrate({
    hostname: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "111111",
    db: "sf", // Don't need to create database manually
});

// Each unique id execute at most once
await mg("a unique id string", `
    CREATE TABLE user (
        -- Must set auto increment primary key: id, if you want to use CURD methods below
        id int(10) unsigned NOT NULL AUTO_INCREMENT,
        -- Recommend set not null and default value for each field
        email varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL default '',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await mg("another unique id string", 'another sql');
```

### Database operation(mysql)

#### Connect

```
import {mysql} from 'https://raw.githubusercontent.com/txthinking/sf/master/mod.js';

var db = await mysql({
    hostname: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "111111",
    db: "sf",
    poolSize: 3,
});
```

#### CURD

```
// table name and row object, keys must match table fields or less
var row = await db.c('user', {
    email: 'hi@sf.com',
});

// object keys must match table fields or less and must contain id
var row = await db.u('user', {
    id: 1,
    email: 'hey@sf.com',
});

// pass in id
var row = await db.r('user', 1);

// pass in id
await db.d('user', 1);
```

#### Raw SQL

```
var rows = await db.query('select * from user where id=?', [1]);
await db.execute('update user set email=? where id=?', ['hi@sf.com', 1]);
```

#### Transaction

```
var r = await db.transaction(async (db)=>{
    var r = await db.c('user', {email: 'hey@sf.com'});
    // throw new Error('rollback');
    await db.execute('update user set email=? where id=?', ['hi@sf.com', 1]);
    var rows = await db.query('select * from user where id=?', [1]);
    return rows;
});
```

### Redis

#### Connect

```
import {redis} from 'https://raw.githubusercontent.com/txthinking/sf/master/mod.js';

var rds = await redis({
    hostname: "127.0.0.1",
    port: 6379,
});
```

#### Raw commands

```
var r = await rds.exec('set', 'hi', 'sf');
var r = await rds.exec('get', 'hi');
```

#### Pipeline

```
await rds.pipeline((rds)=>{
    rds.exec('set', 'hi', 'sf');
    rds.exec('set', 'hey', 'sf');
});
```

#### Transaction

```
await rds.transaction((rds)=>{
    rds.exec('set', 'hi', 'sf1');
    rds.exec('set', 'hey', 'sf2');
});
```

#### Subscribe

```
var ch = await rds.subscribe('channel');
for await (var v of ch.receive()) {
    console.log(v);
}
```

### Crontab

```
import {cron} from 'https://raw.githubusercontent.com/txthinking/sf/master/mod.js';

cron('* * * * *', ()=>{
    console.log(1)
});

cron('* * * * *', ()=>{
    console.log(2)
});
```
