import {sf, migrate, mysql, cron, redis, http} from './mod.js';

var r = await http('https://httpbin.org/post?a=1', {
    method: 'POST',
    query: {
        hello: 'world',
    },
    headers: {
        'Content-Type': 'application/json',
    },
    body: {
        a: 1,
    },
});

console.log(r);

