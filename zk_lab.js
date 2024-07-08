// Minimal zk-lab utility: Poseidon-like toy hash + session key check.
// NOTE: This is NOT cryptographically secure; it's a lab helper.
const crypto = require('crypto');

function fe(x) {
  // map to field-like 254-bit number (toy modulus)
  const m = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001');
  return BigInt('0x' + crypto.createHash('sha256').update(x).digest('hex')) % m;
}

function sponge(inputs) {
  let state = 0n;
  for (const i of inputs) {
    const t = fe(i);
    // s-box: x^5 + c (toy)
    state = (state + (t ** 5n)) ^ 0x1337n;
  }
  return '0x' + state.toString(16);
}

function sessionKeyVerify(addr, sessionKey, ttlSec) {
  // Verifier that a session key is bound to an address (toy binding)
  const now = Math.floor(Date.now()/1000);
  const parts = [addr.toLowerCase(), sessionKey.toLowerCase(), String(ttlSec)];
  const h = sponge(parts);
  return { ok: ttlSec > 0 && now < (Date.now()/1000 + ttlSec), binding: h };
}

if (require.main === module) {
  const [addr, key, ttl] = process.argv.slice(2);
  if (!addr || !key || !ttl) {
    console.log("usage: node zk_lab.js <0xaddr> <0xsessionKey> <ttlSec>");
    process.exit(1);
  }
  const out = sessionKeyVerify(addr, key, parseInt(ttl));
  console.log(JSON.stringify(out, null, 2));
}

module.exports = { sponge, sessionKeyVerify };
