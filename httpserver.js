var httpserver = {};
httpserver.cors = "*";
httpserver.handler = {};
httpserver.path = (path, f) => (httpserver.handler[path] = f);
httpserver.notfound = async (r) => {
    return new Response(`404`, {
        status: 404,
    });
};

async function handle(conn) {
    const httpConn = Deno.serveHttp(conn);
    while (true) {
        try {
            const r = await httpConn.nextRequest();
            if(!r)break;
            var h = httpserver.handler[new URL(r.request.url).pathname];
            try {
                var res;
                if (r.request.method == "OPTIONS"){
                    res = new Response()
                }
                if (r.request.method != "OPTIONS"){
                    if (!h) {
                        res = await httpserver.notfound(r.request);
                    }
                    if (h) {
                        res = await h(r.request);
                    }
                }
                if (r.request.headers.get("Origin")) {
                    res.headers.set("Access-Control-Allow-Origin", httpserver.cors);
                    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, HEAD, PATCH");
                    if (r.request.headers.get("Access-Control-Request-Headers")) {
                        res.headers.set("Access-Control-Allow-Headers", r.request.headers.get("Access-Control-Request-Headers"));
                    }
                    res.headers.set("Access-Control-Max-Age", 24 * 60 * 60);
                }
                await r.respondWith(res);
            } catch (e) {
                await r.respondWith(
                    new Response(`${e}`, {
                        status: 500,
                    })
                );
            }
        } catch (err) {
            console.log(err);
            break;
        }
    }
}

httpserver.run = async (port, hostname) => {
    
    const server = Deno.listen({ port, hostname});
    while (true) {
        try {
            const conn = await server.accept();
            if(!conn)break;
            handle(conn);
        } catch (err) {
            console.log(err);
            break;
        }
    }
};

export default httpserver;
