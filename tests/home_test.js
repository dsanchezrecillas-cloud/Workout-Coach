const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const now=Date.now();const hist=[...Array(6)].map((_,i)=>({date:new Date(now-(i+3)*86400000).toISOString(),exercises:[{name:'Liegestütze',reps:10,sets:3}],muscles:['chest'],rpe:6,repLog:{}}));
await p.addInitScript(h=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_api_key','k');localStorage.setItem('coach_prefs',JSON.stringify({coreSuggested:true}));localStorage.setItem('coach_v5',JSON.stringify({version:5,data:h}));
  window.fetch=()=>new Promise(()=>{});},hist);
await p.goto(__URL);await p.waitForTimeout(1200);
const E=f=>p.evaluate(f);const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};
ok(await E(()=>getComputedStyle(document.getElementById('backup-card')).display!=='none'),'backup card shown (never backed up)');
// force many hints
await E(()=>{['soreness-card','deload-card','balance-card','bench-card','missed-card'].forEach(id=>document.getElementById(id).style.display='block');updateHintRail();});
ok(await E(()=>HINT_PRIO.map(id=>document.getElementById(id)).filter(el=>el&&getComputedStyle(el).display!=='none').length===2),'max 2 hints visible');
ok(await E(()=>getComputedStyle(document.getElementById('missed-card')).display!=='none'&&getComputedStyle(document.getElementById('soreness-card')).display!=='none'),'priority: missed + soreness');
ok(await E(()=>document.getElementById('challenge-card').parentElement.id!=='hint-rail'),'challenge moved out of rail');
ok(await E(()=>getComputedStyle(document.getElementById('last-card')).display==='none'),'last workout hidden');
ok(await E(()=>document.getElementById('coach-card').classList.contains('coach-col')),'coach collapsed');
await p.click('#c-text');ok(await E(()=>!document.getElementById('coach-card').classList.contains('coach-col')),'coach expands on tap');
// export with share
await E(()=>{window.__shared=null;navigator.canShare=()=>true;navigator.share=async(d)=>{window.__shared=d;};doExport();});await p.waitForTimeout(300);
ok(await E(()=>window.__shared&&window.__shared.files[0].name.startsWith('smart-gains-')&&+localStorage.getItem('coach_last_backup')>0),'export via share + timestamp');
ok(await E(()=>getComputedStyle(document.getElementById('backup-card')).display==='none'),'backup card hidden after backup');
await E(()=>{document.getElementById('soreness-card').style.display='none';document.getElementById('missed-card').style.display='none';document.getElementById('deload-card').style.display='none';document.getElementById('balance-card').style.display='none';updateHintRail();window.scrollTo(0,0)});
await p.screenshot({path:require('path').join(__TMP,'home1.png'),fullPage:true});
console.log(errs.length?'ERRORS: '+errs.join(' | '):'ALL OK');await b.close();})();
