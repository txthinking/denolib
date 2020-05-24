var http = async (url, options)=>{
    options = options || {};

    var u = new URL(url);
    var q = new URLSearchParams(u.search.slice(1));
    if(options.query){
        for(var k in options.query){
            q.set(k, options.query[k]);
        }
    }
    u.search = q.toString();

    var body = options.body;
    if(options.headers && !(body instanceof FormData)){
        for(var k in options.headers){
            if(k.toLowerCase() != 'content-type'){
                continue;
            }
            if(options.headers[k].startsWith('application/x-www-form-urlencoded')){
                body = new URLSearchParams(options.body);
                break
            }
            if(options.headers[k].startsWith('application/json')){
                body = JSON.stringify(body);
                break;
            }
        }
    }
    if(body instanceof Uint8Array){
        body = body.buffer;
        // care offset
        // body = body.buffer.slice(body.byteOffset, body.byteLength + body.byteOffset);
    }

    var r = await fetch(u.toString(), {
        method: options.method,
        headers: options.headers,
        body: body,
    });
    var h = {};
    for (var l of r.headers.entries()) {
        h[l[0]] = l[1];
    }

    var ab = await r.arrayBuffer();
    var o = {
        status: r.status,
        headers: h,

        uint8Array: new Uint8Array(ab, 0, ab.byteLength),
        text: await r.text(),
        json: await r.json().catch(e=>null),
        formData: await r.formData().catch(e=>null),
    };
    return o;
};

export {http};
