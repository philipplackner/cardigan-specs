function inflate(src){let pos=0,bitbuf=0,bitcnt=0;const out=[];
function bits(n){while(bitcnt<n){bitbuf|=src[pos++]<<bitcnt;bitcnt+=8}const v=bitbuf&((1<<n)-1);bitbuf>>>=n;bitcnt-=n;return v}
function build(lengths){const count=new Uint16Array(16),offs=new Uint16Array(16),sym=new Uint16Array(lengths.length);for(const l of lengths)count[l]++;count[0]=0;for(let i=1;i<16;i++)offs[i]=offs[i-1]+count[i-1];for(let i=0;i<lengths.length;i++)if(lengths[i])sym[offs[lengths[i]]++]=i;return{count,sym}}
function decode(h){let code=0,first=0,index=0;for(let len=1;len<16;len++){code|=bits(1);const c=h.count[len];if(code-c<first)return h.sym[index+(code-first)];index+=c;first+=c;first<<=1;code<<=1}throw new Error('bad code')}
const LB=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],LE=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],DB=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],DE=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
let fl=null,fd=null;
function codes(lh,dh){for(;;){let s=decode(lh);if(s<256)out.push(s);else if(s===256)return;else{s-=257;const len=LB[s]+bits(LE[s]);const ds=decode(dh);const d=DB[ds]+bits(DE[ds]);let st=out.length-d;for(let i=0;i<len;i++)out.push(out[st+i])}}}
pos=2;let last;do{last=bits(1);const type=bits(2);
if(type===0){bitbuf=0;bitcnt=0;const len=src[pos]|(src[pos+1]<<8);pos+=4;for(let i=0;i<len;i++)out.push(src[pos++])}
else if(type===1){if(!fl){const l=new Array(288);for(let i=0;i<144;i++)l[i]=8;for(let i=144;i<256;i++)l[i]=9;for(let i=256;i<280;i++)l[i]=7;for(let i=280;i<288;i++)l[i]=8;fl=build(l);fd=build(new Array(30).fill(5))}codes(fl,fd)}
else if(type===2){const hl=bits(5)+257,hd=bits(5)+1,hc=bits(4)+4;const ord=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];const cl=new Array(19).fill(0);for(let i=0;i<hc;i++)cl[ord[i]]=bits(3);const ch=build(cl);const lens=[];while(lens.length<hl+hd){const s=decode(ch);if(s<16)lens.push(s);else if(s===16){const p=lens[lens.length-1];for(let r=3+bits(2);r--;)lens.push(p)}else if(s===17){for(let r=3+bits(3);r--;)lens.push(0)}else{for(let r=11+bits(7);r--;)lens.push(0)}}codes(build(lens.slice(0,hl)),build(lens.slice(hl)))}
else throw new Error('bad block')}while(!last);return out}
function utf8(b,s,e){let r='',i=s;while(i<e){let c=b[i++];if(c>=0x80){if(c<0xe0)c=((c&31)<<6)|(b[i++]&63);else if(c<0xf0)c=((c&15)<<12)|((b[i++]&63)<<6)|(b[i++]&63);else{c=((c&7)<<18)|((b[i++]&63)<<12)|((b[i++]&63)<<6)|(b[i++]&63);c-=0x10000;r+=String.fromCharCode(0xd800+(c>>10),0xdc00+(c&1023));continue}}r+=String.fromCharCode(c)}return r}
function pngJSON(bytes){let p=8,W=0,H=0;const idat=[];while(p<bytes.length){const len=(bytes[p]<<24|bytes[p+1]<<16|bytes[p+2]<<8|bytes[p+3])>>>0;const t=String.fromCharCode(bytes[p+4],bytes[p+5],bytes[p+6],bytes[p+7]);if(t==='IHDR'){W=(bytes[p+8]<<24|bytes[p+9]<<16|bytes[p+10]<<8|bytes[p+11])>>>0;H=(bytes[p+12]<<24|bytes[p+13]<<16|bytes[p+14]<<8|bytes[p+15])>>>0}if(t==='IDAT')for(let i=0;i<len;i++)idat.push(bytes[p+8+i]);p+=12+len}
const raw=inflate(idat);const px=new Uint8Array(W*H);for(let y=0;y<H;y++){const f=raw[y*(W+1)];if(f!==0)throw new Error('filter '+f);for(let x=0;x<W;x++)px[y*W+x]=raw[y*(W+1)+1+x]}
const n=(px[0]<<24|px[1]<<16|px[2]<<8|px[3])>>>0;return JSON.parse(utf8(px,4,4+n))}
// ---- paste everything above, then this body. Replace the UPPERCASE placeholders. ----
// DATA_PAGE_ID: page passed as currentPageId to upload_assets (the image must be loaded: use loadAsync if it differs from TARGET)
// HASH / PLACED_ID: from ./up.sh output.  TARGET_PAGE_ID: page that receives the screens (see state.json "pages").
// REPLACE: { 'Screen name': 'oldNodeId' } rebuilds a screen in place (same section, position, order). SKIP: names packed but not built.
const dataPage = await figma.getNodeByIdAsync('DATA_PAGE_ID'); await dataPage.loadAsync();
const payload = pngJSON(await figma.getImageByHash('HASH').getBytesAsync());
{ const n = await figma.getNodeByIdAsync('PLACED_ID'); if (n) n.remove(); }
const page = await figma.getNodeByIdAsync('TARGET_PAGE_ID'); await figma.setCurrentPageAsync(page);
const R = new Function('figma', payload.rt)(figma);
await R.init(payload.d.reg);
const REPLACE = {}, SKIP = {};
const out = [];
for (const sc of payload.d.screens) {
  if (SKIP[sc.spec.n]) continue;
  const node = await R.build(sc.spec, page, null);
  const stats = { w: 0, h: 0, list: [] };
  R.fixSizes(node, sc.spec, stats);
  const old = REPLACE[node.name] ? await figma.getNodeByIdAsync(REPLACE[node.name]) : null;
  if (old) { const sec = old.parent; sec.insertChild(sec.children.indexOf(old), node); node.x = old.x; node.y = old.y; old.remove(); }
  else {
    let sec = page.children.find(n => n.type === 'SECTION' && n.name === sc.meta.group);
    if (!sec) { const secs = page.children.filter(n => n.type === 'SECTION'); sec = figma.createSection(); sec.name = sc.meta.group; sec.x = 0; sec.y = secs.length ? Math.max(...secs.map(s => s.y + s.height)) + 200 : 0; sec.resizeWithoutConstraints(400, 400); }
    const kids = sec.children;
    const right = kids.length ? Math.max(...kids.map(k => k.x + k.width)) : 0;
    sec.appendChild(node); node.x = right + 80; node.y = 100;
    sec.resizeWithoutConstraints(Math.max(...sec.children.map(k => k.x + k.width)) + 80, Math.max(...sec.children.map(k => k.y + k.height)) + 80);
  }
  if (sc.meta.note) node.annotations = [{ label: sc.meta.note }];
  out.push({ id: node.id, name: node.name, fixes: stats.list });
}
return { out, log: R.log.slice(0, 40) };
