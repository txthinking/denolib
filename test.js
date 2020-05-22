import {sf, migrate, mysql, cron, redis} from './mod.js';

sf.debug = true;

sf.handle('/', async (r)=>{
    return sf.ok({ query: r.query, json: r.json });
});

sf.run(2020);
