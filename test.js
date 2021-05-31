import httpserver from './httpserver.js';

httpserver.path('/', async (r)=>{
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
httpserver.ws('/ws', async (r, ws)=>{
    for await (var v of ws) {
        await ws.send(v);
    }
});

httpserver.run(2020);

// var kv = ckv("abcdefghijklmnopqrstuvwxyz012345"); // pass in a 32 length key

// var token = kv.encrypt("uid", 1);
// var uid = kv.decrypt("uid", token);
// var uid = kv.decrypt("uid", token, 30*24*60*60); // only allow token to be valid for 30 days
