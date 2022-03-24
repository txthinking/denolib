import { encode as hexencode, decode as hexdecode } from "https://deno.land/std@0.130.0/encoding/hex.ts";
import { createHash } from "https://deno.land/std@0.130.0/hash/mod.ts";
import { join } from "https://deno.land/std@0.130.0/path/mod.ts";

export async function sh(s) {
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

export function which(q, m) {
    var l = Object.keys(m);
    for (;;) {
        var i = prompt(l.map((v, i) => `${i}: ${v}`).join("\n") + `\n${q}\n`);
        i = parseInt(i);
        if (isNaN(i) || i < 0 || i + 1 > l.length) {
            continue;
        }
        break;
    }
    m[l[i]]();
}

export function what(q, re) {
    for (;;) {
        var s = prompt(q + "\n");
        if (re.test(s)) {
            return s;
        }
    }
}
