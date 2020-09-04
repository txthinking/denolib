import {sf, migrate, mysql, redis, http} from './mod.js';

sf.path('/', async (r)=>{
    var h = {};
    for (var v of r.headers.entries()){
        h[v[0]] = v[1];
    }
    return {
        ip: r.conn.localAddr,
        query: r.query,
        json: r.json,
        headers: h,
    };
});
sf.wspath('/ws', async (r, ws)=>{
    for await (var v of ws) {
        await ws.send(v);
    }
});

sf.run(80);
