
# Denolib

*A **Deno** library to keep everything small.*

<br>

## HTTP Server

<br>

```javascript
import server from 'https://raw.githubusercontent.com/txthinking/denolib/master/httpserver.js';

server.path('/hello',async (request) =>
    new Response('Hello World',{ status : 200 }));

server.run({ port : 2020 });
```

<br>

### Static

```javascript
httpserver.staticdir = '/path/to/static';
```

### Static + **[DenoBundle]**

```javascript
import readFileSync from './bundle.js';

httpserver.readfile = (path) => 
    readFileSync('static' + path);
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
httpserver.default = (request) => {...}
```

<br>
<br>

## Crypto

```javascript
import crypto from 'https://raw.githubusercontent.com/txthinking/denolib/master/crypto.js';

// Pass in a 32 length key

const kv = crypto('abcdefghijklmnopqrstuvwxyz012345');

const token = await kv.encrypt('uid',1);

const uid = await kv.decrypt('uid',token);
```

```javascript
// Only allow token to be valid for 30 days

const uid = await kv.decrypt('uid',token,30 * 24 * 60 * 60);
```

<br>

---

<br>

## MySQL

<br>

### Connect

```javascript
import mysql from 'https://raw.githubusercontent.com/txthinking/denolib/master/mysql.js';

const database = await mysql({
    hostname : '127.0.0.1' ,
    password : '111111' ,
    username : 'root' ,
    poolSize : 3 ,
    port : 3306 ,
    db : 'dbname'
});
```

<br>

### Migrate

```javascript
import migrate from 'https://raw.githubusercontent.com/txthinking/denolib/master/migrate.js';

const mg = await migrate(database);

// Each unique id execute at most once

await mg('A unique id string', `
    CREATE TABLE user (
        id int(10) unsigned NOT NULL AUTO_INCREMENT,
        email varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL default '',
        PRIMARY KEY (id)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await mg('Another unique id string','another sql');
```

<br>

### Curd

> if you want to use this four methods, set auto increment primary key: id, set not null and default value for each field

```javascript
// table name and row object, keys must match table fields or less

const row = await database.c('user',{ 
    email : 'hi@httpserver.com'
});
```

```javascript
// object keys must match table fields or less and must contain id

const row = await database.u('user',{ 
    email : 'hey@httpserver.com' ,
    id : 1 
});
```

```javascript
// pass in id

const row = await database.r('user',1);
```

```javascript
// pass in id

await database.d('user',1);
```

<br>

### SQL

```javascript
const rows = await database.query(
    'select * from user where id=?',[1]);

await database.execute(
    'update user set email=? where id=?',
    [ 'hi@httpserver.com' , 1 ]);
```

<br>

### Transaction

```javascript
const request = await database.transaction(async (database) => {
    
    const request = await database.c('user',{
        email : 'hey@httpserver.com'
    });
    
    // throw new Error('rollback');
    
    await database.execute('update user set email=? where id=?',
        [ 'hi@httpserver.com' , 1 ]);
    
    const rows = await database.query(
        'select * from user where id=?',[1]);
    
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

const rds = await redis({
    hostname : '127.0.0.1' , 
    port : 6379
});
```

<br>

### command

```javascript
const request = await rds.exec( 'set' , 'hi' , 'httpserver' );
```

```javascript
const request = await rds.exec( 'get' , 'hi' );
```

### Pipeline

```javascript
await rds.pipeline((rds) => {
    rds.exec( 'set' , 'hi' , 'httpserver' );
    rds.exec( 'set' , 'hey' , 'httpserver' );
});
```

### Transaction

> Guarantee atomicity

```javascript
await rds.transaction((rds) => {
    rds.exec( 'set' , 'hi' , 'httpserver1' );
    rds.exec( 'set' , 'hey' , 'httpserver2' );
});
```

### Subscribe

```javascript
const channel = await rds.subscribe('channel');

for await (const event of channel.receive())
    console.log(event);
```

<br>


<!----------------------------------------------------------------------------->

[denobundle]: https://github.com/txthinking/denobundle
