import httpserver from './httpserver.js';

httpserver.staticdir = "./";

await httpserver.run({port: 8080});
