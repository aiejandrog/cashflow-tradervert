// Build a real ZIP (deflate, method 8) containing index.html at the root — for itch.io.
// No zip/unzip/PowerShell available; this hand-builds the archive with CRC32.
const fs = require('fs'), zlib = require('zlib');
const NAME = 'index.html';
const data = fs.readFileSync(NAME);

const TBL = (() => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = TBL[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

const crc = crc32(data);
const comp = zlib.deflateRawSync(data, { level: 9 });
const fname = Buffer.from(NAME);
const usz = data.length, csz = comp.length;
const u16 = n => { const b = Buffer.alloc(2); b.writeUInt16LE(n >>> 0); return b; };
const u32 = n => { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; };
// DOS time/date: fixed 1980-01-01 (avoids env-time dependence)
const DT = u16(0), DD = u16(0x21);

const lfh = Buffer.concat([u32(0x04034b50), u16(20), u16(0), u16(8), DT, DD, u32(crc), u32(csz), u32(usz), u16(fname.length), u16(0), fname]);
const fileRec = Buffer.concat([lfh, comp]);
const cdh = Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(8), DT, DD, u32(crc), u32(csz), u32(usz), u16(fname.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(0), fname]);
const eocd = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(1), u16(1), u32(cdh.length), u32(fileRec.length), u16(0)]);
fs.writeFileSync('freedom-race.zip', Buffer.concat([fileRec, cdh, eocd]));

// Verify: re-read our own zip's stored crc and inflate back to confirm integrity
console.log('built freedom-race.zip', usz, '->', csz, 'bytes, crc', crc.toString(16));
const rt = zlib.inflateRawSync(comp);
console.log('roundtrip ok:', rt.length === usz && crc32(rt) === crc);
