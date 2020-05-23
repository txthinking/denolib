import {sf, migrate, mysql, cron, redis, http} from './mod.js';

sf.debug = true;

sf.handle('/hello', async (r)=>{
    return sf.response({
        status: 200,
        headers: {
            a:1,
        },
        body: 'a',
    });
});

sf.run(2020);
