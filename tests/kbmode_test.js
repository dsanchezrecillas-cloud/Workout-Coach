const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_api_key','k');localStorage.setItem('coach_profile',JSON.stringify({kettlebell:{weights:[16]}}));
 window.__resp='{}';window.fetch=async()=>({ok:true,status:200,json:async()=>({model:'m',stop_reason:'end_turn',content:[{type:'text',text:window.__resp}]})});});
await p.goto(__URL);await p.waitForTimeout(600);
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};const E=(f,a)=>p.evaluate(f,a);
const mk=(fmts)=>({weeks:[0,1,2,3].map(w=>({week:w+1,sessions:[1,3,5].map((d,i)=>({dow:d,focus:'Ganzkörper',intensity:'medium',durationMin:30,...(fmts?{format:fmts[i]}:{})}))}))});
// mix: AI gave no formats → enforced 2/1/2/1
ok(await E(new Function('p','_normalizeKbFormats(p,"mix");return p.weeks.map(w=>w.sessions.filter(s=>s.format!=="sets").length).join()==="2,1,2,1"&&p.weeks.every(w=>w.sessions.every(s=>s.format))'),mk()),'mix enforces 2/1 alternating');
// mix: AI made all KB → trimmed
ok(await E(new Function('p','_normalizeKbFormats(p,"mix");return p.weeks.map(w=>w.sessions.filter(s=>s.format!=="sets").length).join()'),mk(['emom','amrap','ladder'])).then(r=>r==='2,1,2,1'),'mix trims all-KB plan');
// focus: sets filled with KB
ok(await E(new Function('p','_normalizeKbFormats(p,"focus");return p.weeks.every(w=>w.sessions.every(s=>s.format&&s.format!=="sets"))'),mk(['sets','emom',null])),'focus fills formats');
ok(await E(new Function('p','_normalizeKbFormats(p,"off");return p.weeks.every(w=>w.sessions.every(s=>!s.format))'),mk(['emom','amrap','ladder'])),'off strips formats');
// prompt texts
ok(await E(()=>_kbFocusTxt('mix').includes('MISCHUNG')&&_kbFocusTxt('focus').includes('KETTLEBELL-FOKUS')&&_kbFocusTxt('off')===''&&_kbFocusTxt(true).includes('FOKUS')),'prompt per mode');
ok(await E(()=>_kbMode({kbFocus:true})==='focus'&&_kbMode({})==='off'&&_kbMode({kbMode:'mix'})==='mix'),'legacy compat');
// UI
await E(()=>{show('s-plan-create');try{buildPlanCreate()}catch(e){};_syncKbFocus();});
ok(await E(()=>document.querySelectorAll('#pc-kb .chip').length===3&&document.querySelector('#pc-kb .chip.ac').textContent==='Aus'),'3 chips, Aus default');
await E(()=>setKbMode('mix'));
ok(await E(()=>document.querySelector('#pc-kb .chip.ac').textContent==='Gemischt'&&planOpts.kbFocus===true&&/jede zweite/.test(document.getElementById('pc-kb-desc').textContent)),'mix selected + desc');
await p.screenshot({path:require('path').join(__TMP,'kbmode.png')});
console.log(errs.length?'ERRORS: '+errs.join(' | '):'ALL OK');await b.close();})();
