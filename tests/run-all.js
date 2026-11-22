// Runs every *_test.js in this folder and prints a summary.
// Usage (from the repository root):  npm test   — or —   node tests/run-all.js [filter]
const {spawnSync}=require('child_process');
const fs=require('fs'),path=require('path'),http=require('http');
const ROOT=path.resolve(__dirname,'..');
const filter=process.argv[2]||'';

// Tiny static server: offline_test needs the app over http (service worker)
const TYPES={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const p=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'')||'index.html');
  if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':TYPES[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(res);
}).listen(8765,run);

// Lines caused by the sandbox having no internet (Google Fonts etc.) are not app errors
const NOISE=/fonts\.(googleapis|gstatic)|ERR_TUNNEL|ERR_INTERNET|net::ERR|agent-proxy|Failed to load resource/i;

async function run(){
  const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('_test.js')&&f.includes(filter)).sort();
  const results=[];
  for(const f of files){
    const t0=Date.now();
    const r=await new Promise(resolve=>{
      const {spawn}=require('child_process');
      const ch=spawn(process.execPath,[path.join(__dirname,f)],{cwd:ROOT});
      let out='';ch.stdout.on('data',d=>out+=d);ch.stderr.on('data',d=>out+=d);
      const to=setTimeout(()=>{ch.kill();out+='\nTIMEOUT';},240000);
      ch.on('close',code=>{clearTimeout(to);resolve({code,out});});
    });
    const lines=r.out.split('\n').filter(l=>!NOISE.test(l));
    const fails=lines.filter(l=>/^FAIL\b|^ERRORS: |TIMEOUT|Error:|TypeError|ReferenceError/.test(l));
    const ok=r.code===0&&!fails.length;
    results.push({f,ok,fails,ms:Date.now()-t0});
    console.log((ok?'✓ ':'✗ ')+f.padEnd(22)+String(Math.round((Date.now()-t0)/1000)).padStart(4)+' s'+(ok?'':'\n    '+fails.slice(0,5).join('\n    ')));
  }
  server.close();
  const bad=results.filter(r=>!r.ok);
  console.log(`\n${results.length-bad.length}/${results.length} Testdateien ok`);
  process.exit(bad.length?1:0);
}
