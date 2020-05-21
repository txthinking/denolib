var ckv = {};

ckv.key = "abcdefghijklmnopqrstuvwxyz012345";

ckv.encrypt = (k, v) => {
    var text = JSON.stringify({
        k: k,
        v: v,
        t: parseInt(Date.now() / 1000),
    });
    var iv = crypto.randomBytes(16);
    var cipher = crypto.createCipheriv('aes-256-cfb', ckv.key, iv);
    let enc = [iv, cipher.update(text, 'utf8')];
    enc.push(cipher.final());
    return Deno.Buffer.concat(enc).toString('hex');
};

ckv.decrypt = (k, c, lifecycle) => {
  var contents = Deno.Buffer.from(c, 'hex');
  var iv = contents.slice(0, 16);
  var textBytes = contents.slice(16);
  var decipher = crypto.createDecipheriv('aes-256-cfb', ckv.key, iv);
  let res = decipher.update(textBytes, '', 'utf8');
  res += decipher.final('utf8');
  var o = JSON.parse(res);
  if (lifecycle && o.t + lifecycle < parseInt(Date.now() / 1000)) {
    return null;
  }
  if (o.k !== k) {
    return null;
  }
  return o.v;
};

export default ckv;
