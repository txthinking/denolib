import { serve } from "https://deno.land/std/http/server.ts";
import {
    acceptWebSocket,
    isWebSocketCloseEvent,
    isWebSocketPingEvent,
} from "https://deno.land/std/ws/mod.ts";

var sf = {};

sf.listen = '0.0.0.0:2020';
sf.debug = false

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

sf.ok = (data) => {return{error: null, data}};
sf.err = (error) => {return{error, data: null}};

sf.log = (...args) => {
    if(sf.debug){
        console.log(...args);
    }
}

sf.run = async () => {
    var s = serve(sf.listen);
    for await (var r of s) {
        sf.before(r);
        sf.log(r.url);
        r.query = {};
        r.url.substr(2).split('&').forEach(v => {r.query[v.split('=')[0]] = v.split('=')[1] ? decodeURIComponent(v.split('=')[1]) : '';});
        r.json = null;
        r.reply = null;

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
                        headers: new Headers({"Content-Type": "application/json"}),
                        body: JSON.stringify(o),
                    });
                    r.reply = o;
                    sf.log(r.url, "reply", o);
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

            var o = sf.err('404');
            r.respond({
                headers: new Headers({"Content-Type": "application/json"}),
                body: JSON.stringify(o),
            });
            r.reply = o;
            sf.log(r.url, "reply", o);
            sf.after(r);
            continue
        }

        if(r.contentLength){
            sf.log(r.url, "request body length", r.contentLength);
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
                sf.log(r.url, "request body length is", r.contentLength, "but read", n, ", ignored")
            }
            if(n === r.contentLength){
                try{
                    r.json = JSON.parse(String.fromCharCode.apply(null, b));
                }catch(e){
                    sf.log(r.url, "request body is not json, ignored");
                }
                if(r.json){
                    sf.log(r.url, "request body", r.json);
                }
            }
        }

        try{
            var o = await h(r);
            r.respond({
                headers: new Headers({"Content-Type": "application/json"}),
                body: JSON.stringify(o),
            });
        }catch(e){
            var o = sf.err(e.toString());
            r.respond({
                headers: new Headers({"Content-Type": "application/json"}),
                body: JSON.stringify(o),
            });
        }
        r.reply = o;
        sf.log(r.url, "reply", o);
        sf.after(r);
    }
}

export default sf;
