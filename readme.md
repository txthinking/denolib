## sf

A stupid javascript web framework for deno

### How stupid

* Don't care HTTP status code, method and header
* Don't care cookie and session concepts
* If there is a body, should be json parseable
* Only handle query key with one value
* Always respond json body
* No middlewares
* No wildcard route
* No group route
* Force set auto increment primary id for mysql table
* Javascript, no class, no typescript

### Basic

```
import sf from 'https://raw.githubusercontent.com/txthinking/sf/master/sf.js';

sf.handle('/', async (r)=>{
    // Must return json parseable result
    return { hello: "world" };
});

sf.run({port: 2020});
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

### Before and after handle

```
sf.before = (r) => {
    console.log(r)
}
sf.after = (r) => {
    console.log(r, r.query, r.json, r.reply)
}
```

### Cookie? Session? No. Let's Token

Waiting for [#3403](https://github.com/denoland/deno/issues/3403)

```
import ckv from 'https://raw.githubusercontent.com/txthinking/sf/master/ckv.js';

ckv.key = "abcdefghijklmnopqrstuvwxyz012345"; // 32 length key

var token = ckv.encrypt("uid", 1);

var uid = ckv.decrypt("uid", "token"); // token will not expire
var uid = ckv.decrypt("uid", "token", 30*24*60*60); // token has an expiration time, 30 days
```

### Websocket

```
sf.wshandle('/ws', async (r, ws)=>{
    for await (var v of ws) {
        if (typeof v === "string") {
            console.log("text", v);
            throw new Error("fuck")
            await ws.send(v);
        }
        if (v instanceof Uint8Array) {
            console.log("binary", v);
        }
    }
});
```

### HTTPS

```
sf.run({
    port: 443,
    hostname: 'locahost',
    certFile: './cert.pem',
    keyFile: './cert_key.pem',
})
```

### Debug

```
sf.debug = true;
```

### Database migration(mysql)

```
import migrate from 'https://raw.githubusercontent.com/txthinking/sf/master/migrate.js';

await migrate.init({
    hostname: "127.0.0.1",
    username: "root",
    db: "sf", // Don't need to create database manually
    password: "111111",
});

// Each unique id execute at most once
await migrate.migrate("a unique id string", `
    CREATE TABLE user (
        // Must set auto increment primary key: id
        id int(10) unsigned NOT NULL AUTO_INCREMENT,
        // Recommend set default value for each field
        email varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL default '',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await migrate.migrate("another unique id string", 'another sql');
```

### Database operation(mysql)

#### Connect

```
import mysql from 'https://raw.githubusercontent.com/txthinking/sf/master/mysql.js';

await mysql.init({
    hostname: "127.0.0.1",
    username: "root",
    db: "sf",
    password: "111111",
    poolSize: 3,
});
```

#### CURD

```
// object keys must match table fields or less
var o = await mysql.c({
    email: 'hi@sf.com',
});
console.log(o); // o is the row corresponding object contain id

// object keys must match table fields or less and must contain id
var o = await mysql.u({
    id: 1,
    email: 'hey@sf.com',
});
console.log(o); // o is the updated row corresponding object

// pass in id
var o = await mysql.r(1);
console.log(o); // o is the row corresponding object

// pass in id
await mysql.d(1);
```

#### Raw SQL

```
var rows = await mysql.query('select * from user where id=?', [1]);
await mysql.execute('update user set email=? where id=?', ['hi@sf.com', 1]);
```

#### Transaction

```
var r = await mysql.transaction(async (mysql)=>{
    var r = await mysql.c('user', {email: 'hey@sf.com'});
    // throw new Error('rollback');
    await mysql.execute('update user set email=? where id=?', ['hi@sf.com', 1]);
    var rows = await mysql.query('select * from user where id=?', [1]);
    return rows;
});
```
