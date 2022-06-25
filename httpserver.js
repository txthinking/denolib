import { serve } from "https://deno.land/std@0.130.0/http/server.ts";
import { join } from "https://deno.land/std@0.130.0/path/mod.ts";

var httpserver = {};

httpserver.cors = "*";

httpserver.handler = {};
httpserver.path = (path, f) => (httpserver.handler[path] = f);

httpserver.staticdir = "";
httpserver.spa = false;
httpserver.statichandler = null;
httpserver.readfile = null;

httpserver.default = async (r) => {
    return new Response(`404`, {
        status: 404,
    });
};
httpserver.notfound = async (r) => {
    return new Response(`404`, {
        status: 404,
    });
};

async function handler(request, connInfo) {
    var h = httpserver.handler[new URL(request.url).pathname];
    try {
        var res;
        if (request.method == "OPTIONS"){
            res = new Response()
        }
        if (request.method != "OPTIONS"){
            if (!h) {
                if(httpserver.statichandler){
                    res = await httpserver.statichandler(request, connInfo);
                }
                if(!httpserver.statichandler){
                    res = await httpserver.notfound(request, connInfo);
                }
            }
            if (h) {
                res = await h(request, connInfo);
            }
        }
        if (request.headers.get("Origin")) {
            res.headers.set("Access-Control-Allow-Origin", httpserver.cors);
            res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, HEAD, PATCH");
            if (request.headers.get("Access-Control-Request-Headers")) {
                res.headers.set("Access-Control-Allow-Headers", request.headers.get("Access-Control-Request-Headers"));
            }
            res.headers.set("Access-Control-Max-Age", 24 * 60 * 60);
        }
        return res;
    } catch (e) {
        return new Response(`${e}`, {
            status: 500,
        });
    }
}

httpserver.run = async (opt) => {
    if(httpserver.staticdir || httpserver.readfile){
        httpserver.statichandler = async (r, connInfo) => {
            var s = `${new URL(r.url).pathname}`;
            if (s.endsWith("/")) {
                s += "index.html";
            }
            var t = "text/plain; charset=utf-8";
            if (s.endsWith(".html")) {
                t = "text/html; charset=utf-8";
            }
            if (s.endsWith(".png")) {
                t = "image/png";
            }
            if (s.endsWith(".css")) {
                t = "text/css";
            }
            if (s.endsWith(".js")) {
                t = "application/javascript";
            }
            if (s.endsWith(".json")) {
                t = "application/json";
            }
            if (s.endsWith(".jpg") || s.endsWith(".jpeg") || s.endsWith(".jfif") || s.endsWith(".pjpeg") || s.endsWith(".pjp")) {
                t = "image/jpeg";
            }
            try {
                if(httpserver.staticdir){
                    var data = await Deno.readFile(join(httpserver.staticdir, s));
                }
                if(httpserver.readfile){
                    var data = await httpserver.readfile(s);
                }
                return new Response(new TextDecoder("utf-8").decode(data), {
                    status: 200,
                    headers: new Headers({
                        "Content-Type": t,
                    }),
                });
            } catch (e) {
                if (e.toString().indexOf("NotFound") == -1) {
                    return new Response(`${e}`, {
                        status: 500,
                    });
                }
                if(!httpserver.spa || s == "/index.html"){
                    return new Response(`404`, {
                        status: 404,
                    });
                }
                try {
                    if(httpserver.staticdir){
                        var data = await Deno.readFile(join(httpserver.staticdir, "index.html"));
                    }
                    if(httpserver.readfile){
                        var data = await httpserver.readfile("/index.html");
                    }
                    return new Response(new TextDecoder("utf-8").decode(data), {
                        status: 200,
                        headers: new Headers({
                            "Content-Type": "text/html; charset=utf-8",
                        }),
                    });
                } catch (e) {
                    if (e.toString().indexOf("NotFound") == -1) {
                        return new Response(`${e}`, {
                            status: 500,
                        });
                    }
                    return new Response(`404`, {
                        status: 404,
                    });
                }
            }
        };
    }
    await serve(handler, opt);
};

export default httpserver;
