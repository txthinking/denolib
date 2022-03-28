import {Sync} from 'https://raw.githubusercontent.com/txthinking/denolib/master/f.js';

var localstorage = (file) => {
    var sync = new Sync();
    return {
        clear: async () => {
            return await sync.atomic(async () => {
                var j = {};
                await Deno.writeFile(file, new TextEncoder().encode(JSON.stringify(j)));
            });
        },
        removeItem: async (k) => {
            return await sync.atomic(async () => {
                var j = {};
                try {
                    var b = await Deno.readFile(file);
                    var s = new TextDecoder().decode(b);
                    j = JSON.parse(s);
                } catch (e) {
                    if (e.toString().indexOf("NotFound") == -1) {
                        throw e;
                    }
                }
                delete j[k];
                await Deno.writeFile(file, new TextEncoder().encode(JSON.stringify(j)));
            });
        },
        setItem: async (k, v) => {
            return await sync.atomic(async () => {
                var j = {};
                try {
                    var b = await Deno.readFile(file);
                    var s = new TextDecoder().decode(b);
                    j = JSON.parse(s);
                } catch (e) {
                    if (e.toString().indexOf("NotFound") == -1) {
                        throw e;
                    }
                }
                j[k] = v;
                await Deno.writeFile(file, new TextEncoder().encode(JSON.stringify(j)));
            });
        },
        getItem: async (k) => {
            return await sync.atomic(async () => {
                var j = {};
                try {
                    var b = await Deno.readFile(file);
                    var s = new TextDecoder().decode(b);
                    j = JSON.parse(s);
                } catch (e) {
                    if (e.toString().indexOf("NotFound") == -1) {
                        throw e;
                    }
                }
                return j[k];
            });
        },
    };
};

export default localstorage;
