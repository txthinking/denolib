import { AES } from "https://deno.land/x/god_crypto@v1.4.10/mod.ts";
import { decode as hexdecode } from "https://deno.land/std@0.130.0/encoding/hex.ts";
import { encode as hexencode } from "https://deno.land/std@0.130.0/encoding/hex.ts";
import { randomBytes } from "https://deno.land/std@0.130.0/node/crypto.ts";

var crypto = (key) => {
    if(key.length != 32){
        throw new Error("crypto key must be 32 length");
        return;
    }
    return {
        encrypt: async (k, v) => {
            var text = JSON.stringify({
                k: k,
                v: v,
                t: parseInt(Date.now() / 1000),
            });
            var iv = randomBytes(16);
            var kv = new AES(key, { mode: "cfb", iv: iv });
            var b = await kv.encrypt(text);
            return new TextDecoder().decode(hexencode(new Uint8Array([...iv, ...b])));
        },
        decrypt: async (k, c, lifecycle) => {
            var b = hexdecode(new TextEncoder().encode(c));
            var kv = new AES(key, { mode: "cfb", iv: b.slice(0, 16) });
            var r = await kv.decrypt(b.slice(16));
            var o = JSON.parse(r.toString());
            if (lifecycle && o.t + lifecycle < parseInt(Date.now() / 1000)) {
                return null;
            }
            if (o.k !== k) {
                return null;
            }
            return o.v;
        },
    };
};

export default crypto;
