import {sf, migrate, mysql, cron, redis, http} from './mod.js';

sf.debug = true;

sf.handle('/hello', async (r)=>{
    console.log(r.uint8Array);
    return [];
});

sf.run(2020);
