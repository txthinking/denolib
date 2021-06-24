import crypto from './crypto.js';

var kv = crypto("abcdefghijklmnopqrstuvwxyz012345"); // pass in a 32 length key

var token = kv.encrypt("uid", 1);
console.log(token);
var uid = kv.decrypt("uid", token);
console.log(uid);
var uid = kv.decrypt("uid", token, 30*24*60*60); // only allow token to be valid for 30 days
console.log(uid);
