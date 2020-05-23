## sf

A stupid javascript web framework for deno

### How stupid

* Don't care http status code, method and header
* Don't care cookie and session concepts
* Forget RESTful, just one path do one thing
* Default to handle query one key with one value, `?a=1&a=2` to `{a:2}`
* Default to handle json body of http request
* Default to respond json body
* No middlewares, no wildcard route, no group route
* Less design, prefer raw SQL, raw redis commands
* A http client with concepts of http protocol
* Javascript, no class, no typescript

### Table of Contents

- [Basic](#basic)
- [Request](#request-data)
- [Response](#response-helper)
- [Websocket](#websocket)
- [Not Found](#not-found)
- [Request and Custom Response](#request-and-custom-response)
- [Hooks](#hooks)
- [CORS](#cors)
- [HTTPS](#https)
- [Debug](#debug)
- [Cookie, Session, Token](#cookie-session-no-lets-token)
- [Database Migration](#database-migrationmysql)
- [Database Operation](#database-operationmysql)
- [Redis](#redis)
- [Cron](#cron)
- [HTTP Client](#http-client)

### Basic

```
import {sf} from 'https://deno.land/x/sf/mod.js';

sf.handle('/', async (r)=>{
    return { hello: "world" }; // must return json parseable result
});

sf.run(2020);
```

```
$ curl -v http://127.0.0.1:2020
```

### Request Data

```
sf.handle('/hello', async (r)=>{
    console.log(r.query);       // query object
    console.log(r.json);        // json body object
    return { query: r.query, body: r.json };
});
```

```
$ curl -v -d '{"hey":"girl"}' http://127.0.0.1:2020/hello?hey=boy
```

### Response Helper

> if you like this fomart

```
{error: null/string, data: null/any}
```

```
sf.handle('/hello', async (r)=>{
    return sf.err('a error string');
    return sf.ok(['hello', 'world']);
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

### Not Found

```
sf.notfound = (r) => sf.err('404');
```

### Request and Custom Response

```
sf.handle('/hello', async (r)=>{
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
});
```

### Hooks

```
sf.before = (r) => {
    console.log('if you want to do something before handle, do it here')
}
sf.after = (r) => {
    console.log('if you want to do something after handle, do it here')
    console.log(r, r.query, r.json, r.response)
}
```

### CORS

```
sf.cors = '*';
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

### Debug

```
sf.debug = true;
```

### Cookie? Session? No. Let's Token

Waiting for [#3403](https://github.com/denoland/deno/issues/3403)

```
import {ckv} from 'https://deno.land/x/sf/mod.js';

var kv = ckv("abcdefghijklmnopqrstuvwxyz012345"); // pass in a 32 length key

var token = kv.encrypt("uid", 1);
var uid = kv.decrypt("uid", token);
var uid = kv.decrypt("uid", token, 30*24*60*60); // only allow token to be valid for 30 days
```

> Just pass the token in query or json body, no magic.

### Database Migration(mysql)

TODO: Support caching_sha2_password auth plugin (mysql8 default)

```
import {migrate} from 'https://deno.land/x/sf/mod.js';

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

### Database Operation(mysql)

#### Connect

TODO: Support caching_sha2_password auth plugin (mysql8 default)

```
import {mysql} from 'https://deno.land/x/sf/mod.js';

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
import {redis} from 'https://deno.land/x/sf/mod.js';

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

> [https://redis.io/topics/pipelining](https://redis.io/topics/pipelining)

#### Transaction

```
await rds.transaction((rds)=>{
    rds.exec('set', 'hi', 'sf1');
    rds.exec('set', 'hey', 'sf2');
});
```

> Guarantee atomicity

#### Subscribe

```
var ch = await rds.subscribe('channel');
for await (var v of ch.receive()) {
    console.log(v);
}
```

### Cron

```
import {cron} from 'https://deno.land/x/sf/mod.js';

cron('* * * * *', ()=>{
    console.log(1)
});

cron('* * * * *', ()=>{
    console.log(2)
});
```

> [https://en.wikipedia.org/wiki/Cron](https://en.wikipedia.org/wiki/Cron)

### HTTP Client

```
import {http} from 'https://deno.land/x/sf/mod.js';

var r = await http('https://httpbin.org/get');

var r = await http('https://httpbin.org/post?a=1', {
    method: 'POST',                                // http request method
    query: {b: 2},                                 // http request query, will append to the url
    headers: {'Content-Type': 'application/json'}, // http requset headers
    body: {c: 3},                                  // http request body, can be {}, string, FormData, ArrayBuffer
}));

// r.status        // http response status code, int
// r.headers       // http response headers, {}

// r.text          // http reponse body text plain
// r.json          // http reponse body if it can be parsed to json
// r.arrayBuffer   // http reponse body if it can be parsed to array buffer
// r.formData      // http reponse body if it can be parsed to FromData
```

* No default `Content-Type`, make more transparent
* If `Content-Type` is `application/x-www-form-urlencoded`, will assume body is {}, try parse to form urlencoded
* If `Content-Type` is `application/json`, will assume body is {}, try parse to json
* If `body` is `FormData`, `Content-Type: multipart/form-data; boundary=...` will be appended to headers automatically
