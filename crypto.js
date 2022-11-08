import { decode as hexdecode } from "https://deno.land/std@0.130.0/encoding/hex.ts";
import { encode as hexencode } from "https://deno.land/std@0.130.0/encoding/hex.ts";

var crypto = (key) => {
    if (key.length != 32) {
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
            var iv = window.crypto.getRandomValues(new Uint8Array(16));
            var ab = await window.crypto.subtle.encrypt(
                {
                    name: "AES-CBC",
                    iv,
                },
                await window.crypto.subtle.importKey("raw", new TextEncoder().encode(key).buffer, "AES-CBC", false, ["encrypt", "decrypt"]),
                new TextEncoder().encode(text)
            );

            return new TextDecoder().decode(hexencode(new Uint8Array([...iv, ...new Uint8Array(ab)])));
        },
        decrypt: async (k, c, lifecycle) => {
            var b = hexdecode(new TextEncoder().encode(c));
            var ab = await window.crypto.subtle.decrypt({ name: "AES-CBC", iv: b.slice(0, 16) }, await window.crypto.subtle.importKey("raw", new TextEncoder().encode(key).buffer, "AES-CBC", false, ["encrypt", "decrypt"]), b.slice(16));
            var b = new Uint8Array(ab);
            var s = new TextDecoder().decode(b);
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
