## sf

A stupid javascript web framework for deno

### How stupid

* Don't care HTTP status code, method and header
* Don't care cookie and session concepts
* Always reads request query parameters and json body
* Only handles query key with one value
* Always responds json body
* No middlewares
* No wildcard route
* No group route
* Force set auto increment primary id for mysql table
* Javascript, no class, no typescript

### Basic

```
import sf from 'https://raw.githubusercontent.com/txthinking/sf/master/sf.js';

sf.listen = "0.0.0.0:2020"

sf.handle('/', async (r)=>{
    // Must return json parseable result
    return { hello: "world" };
});

sf.run();
```

```
$ curl -v http://127.0.0.1:2020
```

### Request data

```
...

sf.handle('/hello', async (r)=>{
    console.log(r.query); // query object
    console.log(r.json); // json body object
    return { hello: "world" };
});

...

```

```
$ curl -v -d '{"hey":"girl"}' http://127.0.0.1:2020/hello?hey=boy
```

### Response helper(if you like this fomart)

```
{error: null/string, data: null/object}
```

```
...

sf.handle('/hello', async (r)=>{
    return sf.err('a error string');
    return sf.ok({ hello: "world" });
});

...

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

### Database operations(mysql)

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
await mysql.r(1);
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
    var rows = await mysql.query('select * from user where id=?', [1]);
    return rows;
});
```
