const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t=new Date();const mon=new Date(t);mon.setDate(t.getDate()-((t.getDay()+6)%7));const iso=d=>d.toISOString().slice(0,10);
const pl={title:'P',goal:'strength',freq:3,kbMode:'mix',kbFocus:true,startDate:iso(mon),weeks:[{week:1,sessions:[{dow:0,focus:'KB Ganzkörper',intensity:'easy',durationMin:20,format:'emom'}]}]};
await p.addInitScript(pl=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_api_key','k');localStorage.setItem('coach_profile',JSON.stringify({kettlebell:{weights:[16]}}));localStorage.setItem('coach_plan_v3',pl);},JSON.stringify(pl));
await p.goto(__URL);await p.waitForTimeout(700);
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};const E=(f,a)=>p.evaluate(f,a);
await E(()=>{show('s-plan');renderPlanView(0);openSessEdit(0,0);});await p.waitForTimeout(300);
ok(await E(()=>/Minute/.test(document.getElementById('sess-fmt-desc').textContent)),'editor desc for EMOM');
// long press AMRAP → popup, selection unchanged
const box=await p.locator('#sess-fmt-picker .chip',{hasText:'AMRAP'}).boundingBox();
await p.mouse.move(box.x+10,box.y+10);await p.mouse.down();await p.waitForTimeout(600);await p.mouse.up();await p.waitForTimeout(250);
ok(await E(()=>document.getElementById('fmt-pop')?.classList.contains('on')&&/As Many Rounds/.test(document.getElementById('fmt-pop').textContent)),'long press shows AMRAP info');
ok(await E(()=>sessEditFmt==='emom'),'long press does not select');
await p.screenshot({path:require('path').join(__TMP,'fi1.png')});
await E(()=>document.getElementById('fmt-pop').click());await p.waitForTimeout(250);
// short tap selects
await p.locator('#sess-fmt-picker .chip',{hasText:'AMRAP'}).click();
ok(await E(()=>sessEditFmt==='amrap'&&/Runden wie möglich/.test(document.getElementById('sess-fmt-desc').textContent)&&!document.getElementById('fmt-pop').classList.contains('on')),'tap selects + desc updates');
// plan tag tap
await E(()=>closeModal('modal-session'));await p.waitForTimeout(200);
await p.locator('.fmt-tag').first().click();await p.waitForTimeout(250);
ok(await E(()=>document.getElementById('fmt-pop').classList.contains('on')&&/Every Minute/.test(document.getElementById('fmt-pop').textContent)&&!document.getElementById('modal-session').classList.contains('on')),'plan tag tap shows info only');
// review chips bound
ok(await E(()=>!!document.getElementById('ctype-emom')?._lp),'review chips long-press bound');
console.log(errs.length?'ERRORS: '+errs.join(' | '):'ALL OK');await b.close();})();
