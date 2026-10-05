import { writeFileSync } from 'node:fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const t = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const ws = new WebSocket(t.find(x => x.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 1; const p = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && p.has(m.id)) { const { resolve, reject } = p.get(m.id); p.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); } });
const send = (me, pa = {}) => { const i = id++; ws.send(JSON.stringify({ id: i, method: me, params: pa })); return new Promise((a, b) => p.set(i, { resolve: a, reject: b })); };
await send('Runtime.enable'); await send('Page.enable');
const ev = async x => { const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return r.exceptionDetails ? 'THREW' : r.result.value; };
await send('Emulation.setDeviceMetricsOverride',{width:1200,height:900,deviceScaleFactor:2,mobile:false});
const URL='http://localhost:5173/';
await send('Page.navigate',{url:URL}); await sleep(2500);
await ev('localStorage.setItem("editorTabsState", JSON.stringify({tabs:[{id:"whiteout-calculator",title:"Calculator.tsx",componentName:"WhiteoutCalculatorPage",props:{}}],activeTabId:"whiteout-calculator"}))');
await send('Page.navigate',{url:URL}); await sleep(8000);
await ev('(function(){var hs=[].slice.call(document.querySelectorAll("button[class*=cardHeader]")); for(var i=0;i<hs.length;i++){ var n=hs[i].querySelector("h3").textContent; if(n==="Resources" && hs[i].getAttribute("aria-expanded")!=="true") hs[i].click(); } return 1;})()');
await sleep(1500);
console.log(await ev('(function(){' +
  'var hs=[].slice.call(document.querySelectorAll("button[class*=cardHeader]"));' +
  'var h=null; for(var i=0;i<hs.length;i++){ if(hs[i].querySelector("h3").textContent==="Resources"){h=hs[i];break;} }' +
  'var sec=h.closest("section");' +
  'var labs=[].slice.call(sec.querySelectorAll("label"));' +
  'var out=[]; var prev=null;' +
  'for(var j=0;j<labs.length;j++){' +
  '  var r=labs[j].getBoundingClientRect();' +
  '  var inp=labs[j].querySelector("input");' +
  '  var ir=inp?inp.getBoundingClientRect():null;' +
  '  var gap = prev===null ? 0 : Math.round(r.top - prev);' +
  '  prev = r.bottom;' +
  '  out.push("  " + labs[j].textContent.trim().slice(0,22).padEnd(24) + "gap " + String(gap).padStart(3) + "   inputLeft " + (ir?Math.round(ir.left):"-") + "   width " + (ir?Math.round(ir.width):"-"));' +
  '}' +
  'return out.join("\n");' +
'})()'));
await ev('(function(){var hs=[].slice.call(document.querySelectorAll("button[class*=cardHeader]")); for(var i=0;i<hs.length;i++){ if(hs[i].querySelector("h3").textContent==="Resources"){ hs[i].scrollIntoView({block:"start"}); } } return 1;})()');
await sleep(700);
const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync('rows2.png', Buffer.from(shot.data, 'base64'));
console.log('\ncaptured');
ws.close(); process.exit(0);
