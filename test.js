import {sf, migrate, mysql, cron, redis, http} from './mod.js';

var r = await fetch("https://httpbin.org/post", {
    method: "POST",
    body: new ArrayBuffer(),
});
console.log(r);
