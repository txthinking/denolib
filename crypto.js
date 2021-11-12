import { AES } from "https://deno.land/x/god_crypto@v1.4.8/mod.ts";
import { decodeString as hexdecode } from "https://deno.land/std@0.88.0/encoding/hex.ts";
import { encodeToString as hexencode } from "https://deno.land/std@0.88.0/encoding/hex.ts";
import { randomBytes } from "https://deno.land/std@0.85.0/node/crypto.ts";

var crypto = (key) => {
    if(key.length != 32){
        throw new Error("crypto key must be 32 length");
        return;
    }
    return {
        encrypt: (k, v) => {
            var text = JSON.stringify({
                k: k,
                v: v,
                t: parseInt(Date.now() / 1000),
            });
            var iv = randomBytes(16);
            var kv = new AES(key, { mode: "cfb", iv: iv });
            var b = await kv.encrypt(text);
            return hexencode(new Uint8Array([...iv, ...b]));
        },
        decrypt: (k, c, lifecycle) => {
            var b = hexdecode(c);
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
