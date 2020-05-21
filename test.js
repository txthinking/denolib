import sf from './sf.js';

sf.debug = true;
sf.wshandle('/ws', async (r, ws)=>{
    for await (var v of ws) {
        if (typeof v === "string") {
            console.log("text", v);
            throw new Error("fuck")
            await ws.send(v);
        }
        if (v instanceof Uint8Array) {
            console.log("binary", v);
        }
    }
});

sf.run();
