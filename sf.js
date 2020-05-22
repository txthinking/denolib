import { serve, serveTLS } from "https://deno.land/std/http/server.ts";
import { acceptWebSocket } from "https://deno.land/std/ws/mod.ts";
import { cron } from './cron.js';

var sf = {};

sf.cors = '*';
sf.debuging = false

sf.before = (r)=>null;
sf.after = (r)=>null;
sf.handles = {};
sf.handle = (path, fn) => {
    sf.handles[path] = fn;
};
sf.wshandles = {};
sf.wshandle = (path, fn) => {
    sf.wshandles[path] = fn;
};

sf.notfound = (r)=>{
    return sf.err('404');
}

sf.ok = (data) => {return{error: null, data}};
sf.err = (error) => {return{error, data: null}};
sf.log = (...args) => {
    if(sf.debuging){
        console.log((new Date()).toString(), ...args);
    }
}
sf.register = (name, any) => {
    if(['cors', 'debug', 'debuging', 'before', 'after', 'handles', 'handle', 'wshandles', 'wshandle', 'ok', 'err', 'log', 'run'].indexOf(name) != -1){
        throw new Error("Can not register with name "+ name);
        return;
    }
    Object.defineProperty(sf, name, {
        get: ()=>any,
    });
};

Object.defineProperty(sf, 'debug', {
    get: function(){
        return this.debuging;
    },
    set: function(v){
        cron(!!v);
        this.debuging = v;
    },
});

sf.run = async (options) => {
    if(!options || typeof options === 'number'){
        var s = serve({
            port: options || 2020,
        });
    }else{
        var s = serveTLS({
            port: options.port || 2020,
            hostname: options.hostname,
            certFile: options.certFile,
            keyFile: options.keyFile,
        });
    }
    for await (var r of s) {
        sf.before(r);
        sf.log("=>", r.url);
        r.query = {};
        var i = r.url.indexOf('?');
        if(i != -1){
            r.url.substr(i+1).split('&').forEach(v => {if(v.split('=')[0]) r.query[v.split('=')[0]] = v.split('=')[1] ? decodeURIComponent(v.split('=')[1]) : '';});
        }
        sf.log(r.url, "query", r.query);
        r.json = null;
        r.reply = null;
        var headers = {"Content-Type": "application/json"};
        if(r.headers.get("Origin")){
            headers["Access-Control-Allow-Origin"] = sf.cors;
            headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, HEAD, PATCH";
            if(r.headers.get("Access-Control-Request-Headers")){
                headers["Access-Control-Allow-Headers"] = r.headers.get("Access-Control-Request-Headers");
            }
            headers["Access-Control-Max-Age"] = 24*60*60;
        }

        var h = sf.handles[r.url.split('?')[0]];
        if(!h){
            var wsh = sf.wshandles[r.url.split('?')[0]];
            if(wsh){
                try {
                    var ws = await acceptWebSocket({
                        conn: r.conn,
                        bufReader: r.r,
                        bufWriter: r.w,
                        headers: r.headers,
                    });
                } catch (e) {
                    var o = sf.err(e.toString());
                    r.respond({
                        headers: new Headers(headers),
                        body: JSON.stringify(o),
                    });
                    r.reply = o;
                    sf.log('<=', r.url, o);
                    sf.after(r);
                    continue;
                }
                wsh(r, ws).catch(async e=>{
                    console.error("wshandle", r.url, e);
                    if (!ws.isClosed) {
                        await ws.close(1000).catch(console.error);
                    }
                    sf.after(r);
                });
                continue;
            }

            try{
                var o = await sf.notfound(r);
                r.respond({
                    headers: new Headers(headers),
                    body: JSON.stringify(o),
                });
            }catch(e){
                var o = sf.err(e.toString());
                r.respond({
                    headers: new Headers(headers),
                    body: JSON.stringify(o),
                });
            }
            r.reply = o;
            sf.log('<=', r.url, o);
            sf.after(r);
            continue
        }

        if(r.contentLength){
            var b = new Uint8Array(r.contentLength);
            var buf = b;
            var n = 0;
            for(;;) {
                var i = await r.body.read(buf);
                if (i === null) break;
                n += i;
                if (n >= r.contentLength) break;
                buf = buf.subarray(i);
            }
            if(n !== r.contentLength){
                sf.log(r.url, "body length is", r.contentLength, "but read", n, ", ignored")
            }
            if(n === r.contentLength){
                try{
                    r.json = JSON.parse(String.fromCharCode.apply(null, b));
                }catch(e){
                    sf.log(r.url, "body is not json, ignored");
                }
                if(r.json){
                    sf.log(r.url, "body", r.json);
                }
            }
        }

        try{
            var o = await h(r);
            r.respond({
                headers: new Headers(headers),
                body: JSON.stringify(o),
            });
        }catch(e){
            var o = sf.err(e.toString());
            r.respond({
                headers: new Headers(headers),
                body: JSON.stringify(o),
            });
        }
        r.reply = o;
        sf.log('<=', r.url, o);
        sf.after(r);
    }
}

export {sf};
