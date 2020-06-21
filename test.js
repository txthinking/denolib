import {sf, migrate, mysql, cron, redis, http} from './mod.js';

sf.handle('/', async (r)=>{
    return r.conn;
});

sf.run(80);
