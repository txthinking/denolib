import { Aes } from "https://deno.land/x/crypto/aes.ts";
import { Cfb, Padding } from "https://deno.land/x/crypto/block-modes.ts";
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
            var b = new Cfb(Aes, new TextEncoder().encode(key), iv, Padding.PKCS7).encrypt(new TextEncoder().encode(text));
            return hexencode(new Uint8Array([...iv, ...b]));
        },
        decrypt: (k, c, lifecycle) => {
            var b = hexdecode(c);
            var s = new TextDecoder().decode(new Cfb(Aes, new TextEncoder().encode(key), b.slice(0, 16), Padding.PKCS7).decrypt(b.slice(16)));
            var o = JSON.parse(s);
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
