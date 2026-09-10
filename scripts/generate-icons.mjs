import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  table[i] = c;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createPng(width, height, drawFn) {
  const header = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); ihdr.writeUInt8(6, 9);
  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const [r,g,b,a] = drawFn(x,y,width,height);
      raw[offset++] = r; raw[offset++] = g; raw[offset++] = b; raw[offset++] = a;
    }
  }
  return Buffer.concat([header, makeChunk('IHDR', ihdr), makeChunk('IDAT', zlib.deflateSync(raw)), makeChunk('IEND', Buffer.alloc(0))]);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2-x1)**2 + (y2-y1)**2;
  if (!l2) return Math.hypot(px-x1, py-y1);
  const t = Math.max(0, Math.min(1, ((px-x1)*(x2-x1)+(py-y1)*(y2-y1))/l2));
  return Math.hypot(px-(x1+t*(x2-x1)), py-(y1+t*(y2-y1)));
}

// CodePackr Finance mark from the approved HD brand artwork:
// blue C/ribbon + green ascending bars and growth arrow.
function drawIcon(x, y, w, h) {
  const nx = (x + 0.5) / w;
  const ny = (y + 0.5) / h;
  const r = Math.max(0, Math.abs(nx-.5)-.42);
  const s = Math.max(0, Math.abs(ny-.5)-.42);
  if (Math.hypot(r,s) > .08) return [0,0,0,0];

  const blue = (t) => [
    Math.round(19*(1-t)+7*t), Math.round(181*(1-t)+92*t), Math.round(244*(1-t)+234*t)
  ];
  const green = (t) => [Math.round(145*(1-t)+20*t), Math.round(238*(1-t)+184*t), Math.round(99*(1-t)+61*t)];

  // Large blue C/ribbon silhouette, approximated from the supplied master artwork.
  const topC = ny >= .10 && ny <= .34 && nx >= .11 && nx <= .82 && nx <= (.72 + (ny-.10)*1.1);
  const leftC = nx >= .08 && nx <= .36 && ny >= .10 && ny <= .82;
  const bottomC = ny >= .66 && ny <= .90 && nx >= .10 && nx <= .67 && nx >= (.12 + (ny-.66)*.12);
  const innerCut = nx >= .18 && nx <= .66 && ny >= .25 && ny <= .70;
  if ((topC || leftC || bottomC) && !innerCut) {
    const t = Math.max(0, Math.min(1, (nx+ny)/1.5));
    return [...blue(t),255];
  }

  // Green bars.
  const bars = [
    {x:.225,y:.56,w:.115,h:.19},
    {x:.405,y:.42,w:.115,h:.33},
    {x:.585,y:.25,w:.115,h:.50}
  ];
  for (const b of bars) if (nx>=b.x && nx<=b.x+b.w && ny>=b.y && ny<=b.y+b.h) {
    return [...green(Math.max(0,Math.min(1,(nx+ny)/1.5))),255];
  }

  // Green growth curve and arrow head.
  const segs = [
    [.16,.69,.34,.76],[.34,.76,.53,.70],[.53,.70,.67,.57],[.67,.57,.76,.39]
  ];
  let d = Infinity;
  for (const s2 of segs) d = Math.min(d, distToSegment(nx,ny,...s2));
  if (d < .035) return [...green(Math.max(0,Math.min(1,(nx+ny)/1.5))),255];
  if (nx>=.70 && nx<=.88 && ny>=.25 && ny<=.47) {
    const ax = nx-.79, ay = ny-.36;
    if (Math.abs(ay) < .11 && ax > -.05) return [...green(.45),255];
  }

  // Transparent outside the mark; subtle dark anti-aliasing is intentionally avoided.
  return [0,0,0,0];
}

function createIcoFile(sizes) {
  const header = Buffer.alloc(6); header.writeUInt16LE(0,0); header.writeUInt16LE(1,2); header.writeUInt16LE(sizes.length,4);
  const entries = []; const images = []; let offset = 6 + sizes.length*16;
  for (const size of sizes) {
    const bih = Buffer.alloc(40);
    bih.writeUInt32LE(40,0); bih.writeInt32LE(size,4); bih.writeInt32LE(size*2,8);
    bih.writeUInt16LE(1,12); bih.writeUInt16LE(32,14); bih.writeUInt32LE(0,16);
    bih.writeUInt32LE(size*size*4,20);
    const pixels = Buffer.alloc(size*size*4); let p=0;
    for (let y=size-1;y>=0;y--) for (let x=0;x<size;x++) {
      const [r,g,b,a]=drawIcon(x,y,size,size);
      pixels[p++]=b; pixels[p++]=g; pixels[p++]=r; pixels[p++]=a;
    }
    const rowBytes=Math.ceil(size/32)*4;
    const mask=Buffer.alloc(rowBytes*size,0);
    const image=Buffer.concat([bih,pixels,mask]); images.push(image);
    const entry=Buffer.alloc(16);
    entry.writeUInt8(size>=256?0:size,0); entry.writeUInt8(size>=256?0:size,1);
    entry.writeUInt16LE(1,4); entry.writeUInt16LE(32,6); entry.writeUInt32LE(image.length,8); entry.writeUInt32LE(offset,12);
    entries.push(entry); offset += image.length;
  }
  return Buffer.concat([header,...entries,...images]);
}

function generateSvgFavicon() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
<title id="title">CodePackr Finance</title><desc id="desc">Blue CodePackr finance mark with green growth bars and arrow</desc>
<defs><linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#13B5F4"/><stop offset=".55" stop-color="#087CFF"/><stop offset="1" stop-color="#075BEA"/></linearGradient><linearGradient id="green" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#91EE63"/><stop offset="1" stop-color="#14B83D"/></linearGradient></defs>
<path fill="url(#blue)" d="M55 165C80 92 145 52 229 52h170c22 0 34 25 20 42l-42 51c-8 10-20 16-33 16H226c-53 0-93 22-119 56 27-20 63-31 104-31h94l-44 56H192c-58 0-105 26-130 66-16-29-19-69-7-107Z"/>
<path fill="url(#blue)" d="M51 346c25 53 77 92 141 99h115c17 0 27-19 18-33l-34-50c-7-10-18-16-30-16h-82c-45 0-84-20-109-53-16 16-27 34-29 53-2 1-2 1-2 0-3 0-5 0-8 0Z"/>
<path fill="url(#green)" d="M82 351c55 48 138 56 209 8 36-24 64-55 86-91l-30-16 86-42-6 95-29-18c-27 48-62 87-107 117-69 46-153 42-214 8l5-61Z"/>
<rect x="111" y="277" width="45" height="75" rx="5" fill="url(#green)"/><rect x="174" y="222" width="45" height="130" rx="5" fill="url(#green)"/><rect x="237" y="154" width="45" height="198" rx="5" fill="url(#green)"/>
</svg>`;
}

function generateLogoSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1274 384" role="img" aria-labelledby="title desc"><title id="title">CodePackr Finance</title><desc id="desc">CodePackr Finance — Calculate, Plan, Grow</desc><rect width="1274" height="384" rx="20" fill="#000"/><g transform="translate(24 36) scale(.66)">${generateSvgFavicon().split('<svg')[1].split('>')[1].split('</svg>')[0]}</g><text x="420" y="184" font-family="Arial,Helvetica,sans-serif" font-size="126" font-weight="800" letter-spacing="-6" fill="#fff">Code</text><text x="700" y="184" font-family="Arial,Helvetica,sans-serif" font-size="126" font-weight="800" letter-spacing="-6" fill="#0797ED">packr</text><text x="600" y="270" font-family="Arial,Helvetica,sans-serif" font-size="58" font-weight="700" letter-spacing="25" fill="#48D95B">FINANCE</text><text x="390" y="332" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="500" letter-spacing="9" fill="#B8C0D0">CALCULATE  •  PLAN  •  GROW</text></svg>`;
}

function drawOgBanner(x,y,w,h) {
  const nx=x/w, ny=y/h;
  const bgR=Math.round(11+nx*14+ny*6), bgG=Math.round(15+nx*18+ny*8), bgB=Math.round(25+nx*28+ny*12);
  if (ny<.015) return [Math.round(91*(1-nx)),Math.round(82*(1-nx)+159*nx),Math.round(232*(1-nx)+136*nx),255];
  return [bgR,bgG,bgB,255];
}

const publicDir=path.resolve('public');
const distDir=path.resolve('dist');
const ogDir=path.join(publicDir,'assets','og');
fs.mkdirSync(ogDir,{recursive:true});

const sizes=[16,32,48,64,96,128,180,192,256,384,512];
for (const size of sizes) {
  const png=createPng(size,size,drawIcon);
  fs.writeFileSync(path.join(publicDir,`favicon-${size}x${size}.png`),png);
  if (fs.existsSync(distDir)) fs.writeFileSync(path.join(distDir,`favicon-${size}x${size}.png`),png);
}
fs.writeFileSync(path.join(publicDir,'apple-touch-icon.png'),createPng(180,180,drawIcon));
fs.writeFileSync(path.join(publicDir,'android-chrome-192x192.png'),createPng(192,192,drawIcon));
fs.writeFileSync(path.join(publicDir,'android-chrome-512x512.png'),createPng(512,512,drawIcon));

const svgFavicon=generateSvgFavicon();
fs.writeFileSync(path.join(publicDir,'favicon.svg'),svgFavicon,'utf8');
fs.writeFileSync(path.join(publicDir,'codepackr-finance-logo.svg'),generateLogoSvg(),'utf8');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir,'favicon.svg'),svgFavicon,'utf8');
  fs.writeFileSync(path.join(distDir,'codepackr-finance-logo.svg'),generateLogoSvg(),'utf8');
}

const ico=createIcoFile([16,32,48,64,128,256]);
fs.writeFileSync(path.join(publicDir,'favicon.ico'),ico);
if (fs.existsSync(distDir)) fs.writeFileSync(path.join(distDir,'favicon.ico'),ico);

const ogPng=createPng(1200,630,drawOgBanner);
fs.writeFileSync(path.join(ogDir,'default.png'),ogPng);
if (fs.existsSync(distDir)) {
  const distOgDir=path.join(distDir,'assets','og');
  fs.mkdirSync(distOgDir,{recursive:true});
  fs.writeFileSync(path.join(distOgDir,'default.png'),ogPng);
}

console.log(`Generated CodePackr Finance branding assets: ${sizes.length} PNG sizes + ICO + SVG + logo SVG.`);
