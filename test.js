import {sf, migrate, mysql, cron, redis, http} from './mod.js';

var r = await http('https://httpbin.org/post?a=1', {
    method: 'POST',
    query: {
        hello: 'world',
    },
    body: new FormData(),
});

console.log(r);

