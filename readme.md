## sf

A stupid javascript web framework for deno

### How stupid

sf tries to ignore concepts: HTTP method, cookie, session and prefers JSON format data.
sf recommends to separate api server, upload server and static server.
If you are very familiar with the HTTP protocol and like simple, you may like sf, otherwise you may not like sf.

## Basic

```
import {sf} from 'https://git.io/mod.js';

sf.path('/', async (r)=>{
    return { query: r.query, body: r.json };
});

sf.run(2020);
```

```
$ curl -v -d '{"hey":"girl"}' http://127.0.0.1:2020/?hey=boy
```

#### Websocket

```
sf.wspath('/ws', async (r, ws)=>{
    for await (var v of ws) {
        if (typeof v === "string") {
            await ws.send(v);
        }
        if (v instanceof Uint8Array) {
            await ws.send(v);
        }
    }
});
```

#### Not Found

```
sf.notfound = (r) => {error: 404}
```

## Advanced

```
sf.path('/hello', async (r)=>{
    // r.url           // http request url
    // r.method        // http request method
    // r.headers       // http request headers
    // r.query         // http request query object, (url parameters)
    // r.json          // http request json body object
    // r.uint8Array    // http request body binary, Uint8Array

    return sf.response({
        status: 200,                                            // any http status code
        headers: {'Content-Type': 'text/plain; charset=utf-8'}, // any headers you want to respond
        body: 'hello sf!',                                      // body can be string, Uint8Array or Reader
    });

    return sf.response({
        status: 200,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({hey: 'sf'}),
    });

    return sf.response({
        status: 200,
        headers: {'Content-Type': 'application/octet-stream'},
        body: Uint8Array.from([1,2,3,4]),
    });
});
```

#### Hooks

```
sf.before = (r) => {
    console.log('if you want to do something before handle, do it here')
}
sf.after = (r) => {
    console.log('if you want to do something after handle, do it here')
    console.log(r, r.query, r.json, r.response)
}
```

#### CORS

```
sf.cors = '*';
```

#### HTTPS

```
sf.run({
    port: 443,
    hostname: 'localhost',
    certFile: './cert.pem',
    keyFile: './cert_key.pem',
})
```

#### Debug

```
sf.debug = true;
```

#### Cookie? Session? No. Let's Token

Waiting for [#3403](https://github.com/denoland/deno/issues/3403)

```
import {ckv} from 'https://git.io/mod.js';

var kv = ckv("abcdefghijklmnopqrstuvwxyz012345"); // pass in a 32 length key

var token = kv.encrypt("uid", 1);
var uid = kv.decrypt("uid", token);
var uid = kv.decrypt("uid", token, 30*24*60*60); // only allow token to be valid for 30 days
```

> Just pass the token in query or json body, no magic.

## Database

#### Database Migration(mysql)

TODO: Support caching_sha2_password auth plugin (mysql8 default)

```
import {migrate} from 'https://git.io/mod.js';

var mg = await migrate({
    hostname: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "111111",
    db: "sf", // don't need to create database manually
});

// Each unique id execute at most once
await mg("a unique id string", `
    CREATE TABLE user (
        id int(10) unsigned NOT NULL AUTO_INCREMENT,
        email varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL default '',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await mg("another unique id string", 'another sql');
```

#### Database Operation(mysql)

**Connect**

TODO: Support caching_sha2_password auth plugin (mysql8 default)

```
import {mysql} from 'https://git.io/mod.js';

var db = await mysql({
    hostname: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "111111",
    db: "sf",
    poolSize: 3,
});
```

**CURD**

If you want to use this four methods:

* Must set auto increment primary key: id
* Recommend set not null and default value for each field

```
// table name and row object, keys must match table fields or less
var row = await db.c('user', {email: 'hi@sf.com'});

// object keys must match table fields or less and must contain id
var row = await db.u('user', {id: 1, email: 'hey@sf.com'});

// pass in id
var row = await db.r('user', 1);

// pass in id
await db.d('user', 1);
```

**Raw SQL**

```
var rows = await db.query('select * from user where id=?', [1]);
await db.execute('update user set email=? where id=?', ['hi@sf.com', 1]);
```

**Transaction**

```
var r = await db.transaction(async (db)=>{
    var r = await db.c('user', {email: 'hey@sf.com'});
    // throw new Error('rollback');
    await db.execute('update user set email=? where id=?', ['hi@sf.com', 1]);
    var rows = await db.query('select * from user where id=?', [1]);
    return rows;
});
```

#### Redis

**Connect**

```
import {redis} from 'https://git.io/mod.js';

var rds = await redis({
    hostname: "127.0.0.1",
    port: 6379,
});
```

**Raw commands**

```
var r = await rds.exec('set', 'hi', 'sf');
var r = await rds.exec('get', 'hi');
```

**Pipeline**

```
await rds.pipeline((rds)=>{
    rds.exec('set', 'hi', 'sf');
    rds.exec('set', 'hey', 'sf');
});
```

> [https://redis.io/topics/pipelining](https://redis.io/topics/pipelining)

**Transaction**

```
await rds.transaction((rds)=>{
    rds.exec('set', 'hi', 'sf1');
    rds.exec('set', 'hey', 'sf2');
});
```

> Guarantee atomicity

**Subscribe**

```
var ch = await rds.subscribe('channel');
for await (var v of ch.receive()) {
    console.log(v);
}
```
