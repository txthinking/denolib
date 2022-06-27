import { encode as hexencode, decode as hexdecode } from "https://deno.land/std@0.130.0/encoding/hex.ts";
import { createHash } from "https://deno.land/std@0.130.0/hash/mod.ts";
import { join } from "https://deno.land/std@0.130.0/path/mod.ts";
import { yellow, bgGreen } from "https://deno.land/std@0.130.0/fmt/colors.ts";

// why 1, because return STDOUT, that is 1
export async function sh1(s) {
    var p = Deno.run({
        cmd: ["sh", "-c", s],
        stdout: "piped",
        stderr: "piped",
    });
    var [status, stdout, stderr] = await Promise.all([p.status(), p.output(), p.stderrOutput()]);
    p.close();
    if (status.code != 0) {
        throw `${new TextDecoder("utf-8").decode(stdout)} ${new TextDecoder("utf-8").decode(stderr)}`;
    }
    return new TextDecoder("utf-8").decode(stdout);
}

export async function sh(s) {
    var p = Deno.run({
        cmd: ["sh", "-c", s],
    });
    var [status] = await Promise.all([p.status()]);
    p.close();
    if (status.code != 0) {
        throw `${status.code}`;
    }
}

export function s2b(s) {
    return new TextEncoder().encode(s);
}

export function b2s(b) {
    return new TextDecoder().decode(b);
}

export function s2h(s) {
    return new TextDecoder().decode(hexencode(new TextEncoder().encode(s)));
}

export function h2s(h) {
    return new TextDecoder().decode(hexdecode(new TextEncoder().encode(h)));
}

export async function hmac_sha256(message, key){
    key = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, true, ["sign", "verify"]);
    var result = await crypto.subtle.sign("HMAC", key, message);
    return new Uint8Array(result);
}

export function home() {
    return join.apply(null, [Deno.env.get("HOME"), ...arguments]);
}

export function joinhostport(h, p) {
    if (h.indexOf(":") != -1) {
        return `[${h}]:${p}`;
    }
    return `${h}:${p}`;
}

export function splithostport(s) {
    if (s.indexOf("]:") != -1) {
        var l = s.split("]:");
        if (l.length != 2) {
            throw "Invalid address";
        }
        var p = parseInt(l[1]);
        if (isNaN(p)) {
            throw "Invalid address";
        }
        return [l[0].replace("[", ""), p];
    }
    if (s.indexOf(":") == -1) {
        throw "Invalid address";
    }
    var l = s.split(":");
    if (l.length != 2) {
        throw "Invalid address";
    }
    var p = parseInt(l[1]);
    if (isNaN(p)) {
        throw "Invalid address";
    }
    return [l[0], p];
}

export function md5(s) {
    var hash = createHash("md5");
    hash.update(s);
    return hash.toString();
}

export function sha256(s) {
    var hash = createHash("sha256");
    hash.update(s);
    return hash.toString();
}

export async function which(question, anwseraction) {
    for (;;) {
        var i = prompt(yellow(anwseraction.map((v, i) => `${i + 1}: ${v.anwser}`).join("\n") + `\n${question}`));
        i = parseInt(i);       
        if (isNaN(i) || i < 1 || i > anwseraction.length) {
            continue;
        }
        break;
    }                                                      
    await anwseraction[i-1].action();
} 

export function what(q, v) {
    for (;;) {
        var s = prompt(yellow(q));
        if(!s){
            continue;
        }
        if(typeof v === "function"){
            if(v(s)){
                return s;
            }
            continue;
        }
        if (v.test(s)) {
            return s;
        }
    }
}

export function echo(s) {
    console.log(s);
}

export function log(s) {
    console.log(new Date().toLocaleString(), s);
}

export function err (s, code){
    return new Response(s, {
        status: code ?? 400,
    });
}

export function ok (s){
    if(!s){
        return new Response();
    }
    return new Response(typeof s === 'string' ? s : JSON.stringify(s), {
        status: 200,
        headers: { "Content-Type": typeof s === 'string' ? "text/plain; charset=utf-8" : "application/json" },
    });
};

export async function sleep (ms){
    await new Promise(r => setTimeout(r, ms));
}

// async lock, js lock, js mutex, js sync, js queue
// var sync = new Sync();
// await sync.atomic(async () => {});
export function Sync() {
    var p = Promise.resolve();
    this.atomic = (f) => {
        p = new Promise((resolve, reject) => {
            p.then(() => {
                f()
                    .then((v) => resolve(v))
                    .catch((v) => reject(v));
            }).catch((e) => {
                f()
                    .then((v) => resolve(v))
                    .catch((v) => reject(v));
            });
        });
        return p;
    };
}

export function now (){
    return parseInt(Date.now() / 1000);
}

export function exit (code){
    Deno.exit(code);
}
