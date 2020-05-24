import {sf, migrate, mysql, cron, redis, http} from './mod.js';

sf.handle('/', async (r)=>{
    console.log(r.uint8Array);
    return { hello: "world" }; // must return json parseable result
});

sf.run(2020);
