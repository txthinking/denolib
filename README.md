
# Denolib

*A **Deno** library to keep everything small.*

<br>

## HTTP Server

<br>

```javascript
import httpserver from 'https://raw.githubusercontent.com/txthinking/denolib/master/httpserver.js';

httpserver.path('/hello', async (r)=>{
      return new Response("hello world", {
        status: 200,
      });
});

httpserver.run({port:2020});
```

<br>

### Static

```javascript
httpserver.staticdir = "/path/to/static";
```

### Static + **[DenoBundle]**

```javascript
import readFileSync from './bundle.js';

httpserver.readfile = (path) => readFileSync("static" + path);
```

<br>

### SPA

```javascript
httpserver.spa = true;
```

<br>

### CORS

```javascript
httpserver.cors = '*';
```

<br>

### 404

```javascript
httpserver.default = (r) => {...}
```

<br>
<br>

## Crypto

```javascript
import crypto from 'https://raw.githubusercontent.com/txthinking/denolib/master/crypto.js';

var kv = crypto("abcdefghijklmnopqrstuvwxyz012345"); // pass in a 32 length key

var token = kv.encrypt("uid", 1);

var uid = kv.decrypt("uid", token);
var uid = kv.decrypt("uid", token, 30*24*60*60); // only allow token to be valid for 30 days
```

<br>

---

<br>

## MySQL

<br>

### Connect

```javascript
import mysql from 'https://raw.githubusercontent.com/txthinking/denolib/master/mysql.js';

var db = await mysql({
    hostname: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "111111",
    poolSize: 3,
    db: "dbname",
});
```

<br>

### Migrate

```javascript
import migrate from 'https://raw.githubusercontent.com/txthinking/denolib/master/migrate.js';

var mg = await migrate(db);

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

<br>

### Curd

> if you want to use this four methods, set auto increment primary key: id, set not null and default value for each field

```javascript
// table name and row object, keys must match table fields or less
var row = await db.c('user', {email: 'hi@httpserver.com'});

// object keys must match table fields or less and must contain id
var row = await db.u('user', {id: 1, email: 'hey@httpserver.com'});

// pass in id
var row = await db.r('user', 1);

// pass in id
await db.d('user', 1);
```

<br>

### SQL

```javascript
var rows = await db.query('select * from user where id=?', [1]);
await db.execute('update user set email=? where id=?', ['hi@httpserver.com', 1]);
```

<br>

### Transaction

```javascript
var r = await db.transaction(async (db)=>{
    var r = await db.c('user', {email: 'hey@httpserver.com'});
    // throw new Error('rollback');
    await db.execute('update user set email=? where id=?', ['hi@httpserver.com', 1]);
    var rows = await db.query('select * from user where id=?', [1]);
    return rows;
});
```

<br>

---

<br>

## Redis

<br>

### Connect

```javascript
import redis from 'https://raw.githubusercontent.com/txthinking/denolib/master/redis.js';

var rds = await redis({
    hostname: "127.0.0.1",
    port: 6379,
});
```

<br>

### command

```javascript
var r = await rds.exec('set', 'hi', 'httpserver');
var r = await rds.exec('get', 'hi');
```

### Pipeline

```javascript
await rds.pipeline((rds)=>{
    rds.exec('set', 'hi', 'httpserver');
    rds.exec('set', 'hey', 'httpserver');
});
```

### Transaction

> Guarantee atomicity

```javascript
await rds.transaction((rds)=>{
    rds.exec('set', 'hi', 'httpserver1');
    rds.exec('set', 'hey', 'httpserver2');
});
```

### Subscribe

```javascript
var ch = await rds.subscribe('channel');
for await (var v of ch.receive()) {
    console.log(v);
}
```



<!----------------------------------------------------------------------------->

[denobundle]: https://github.com/txthinking/denobundle
