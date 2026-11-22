const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t=new Date();const mon=new Date(t);mon.setDate(t.getDate()-((t.getDay()+6)%7));const iso=d=>d.toISOString().slice(0,10);
const pl={title:'P',goal:'strength',freq:3,kbMode:'mix',kbFocus:true,startDate:iso(mon),weeks:[{week:1,sessions:[{dow:0,focus:'KB Ganzkörper',intensity:'easy',durationMin:20,format:'emom'}]},{week:2,sessions:[{dow:1,focus:'Oberkörper',intensity:'medium',durationMin:30,format:'sets'},{dow:3,focus:'KB Beine',intensity:'medium',durationMin:30,format:'complex'}]}]};
await p.addInitScript(pl=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_api_key','k');localStorage.setItem('coach_profile',JSON.stringify({kettlebell:{weights:[16]}}));localStorage.setItem('coach_plan_v3',pl);
 window.__prompts=[];window.fetch=async(u,o)=>{window.__prompts.push(o.body);return {ok:true,status:200,json:async()=>({model:'m',stop_reason:'end_turn',content:[{type:'text',text:'[]'}]})}};},JSON.stringify(pl));
await p.goto(__URL);await p.waitForTimeout(700);
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};const E=(f,a)=>p.evaluate(f,a);
ok(await E(()=>_sessEquip(plan.weeks[0].sessions[0]).join()==='bodyweight,kettlebell'),'existing plan: KB session has kettlebell');
ok(await E(()=>_sessEquip(plan.weeks[1].sessions[0]).includes('kettlebell')),'classic session falls back to known KB');
await E(()=>{show('s-plan');renderPlanView(0);openSessEdit(0,0);});await p.waitForTimeout(300);
ok(await E(()=>[...document.querySelectorAll('#sess-equip-picker .chip.ac')].map(b=>b.textContent.trim()).join('|').includes('Kettlebell')),'editor shows KB selected');
ok(await E(()=>document.querySelector('#sess-fmt-picker .chip.ac')?.textContent==='EMOM'),'editor shows format EMOM');
await p.screenshot({path:require('path').join(__TMP,'eq1.png')});
// switch week2 classic to Komplex
await E(()=>{closeModal('modal-session');openSessEdit(1,0);});
ok(await E(()=>document.querySelector('#sess-fmt-picker .chip.ac')?.textContent==='Klassisch'),'classic shows Klassisch');
await E(()=>{const b=[...document.querySelectorAll('#sess-fmt-picker .chip')].find(x=>x.textContent==='Komplex');b.click();saveSessEdit();});
ok(await E(()=>{const s=plan.weeks[1].sessions.find(x=>x.dow===1);return s.format==='complex'&&/^KB /.test(s.focus)&&!s.equipment;}),'format change saved, equipment not frozen');
// plan edit default equipment: add pull-up bar
await E(()=>{closeModal('modal-session');openPlanEdit();const b=[...document.querySelectorAll('#edit-equip .chip')].find(x=>/Klimmzug/.test(x.textContent));b.click();});
ok(await E(()=>plan.defaultEquip.includes('bar')&&loadProfile().homeEquip.includes('bar')&&_sessEquip(plan.weeks[0].sessions[0]).includes('bar')),'default equip → pull-up bar applies');
// start session → prompt includes Kettlebell
await E(()=>{closeModal('modal-plan-edit');pendingPlanSession={wi:0,si:0};try{startPlanSession()}catch(e){}});await p.waitForTimeout(400);
ok(await E(()=>window.__prompts.some(x=>/Kettlebell/.test(x)&&/EMOM/.test(x))),'start prompt has KB + EMOM');
// plan create picker prefilled from profile
await E(()=>{show('s-plan-create');buildPlanCreate();document.getElementById('pc-equip').scrollIntoView({block:'center'})});
ok(await E(()=>[...document.querySelectorAll('#pc-equip .chip.ac')].length===3),'create picker prefilled (BW, bar, KB)');
await p.screenshot({path:require('path').join(__TMP,'eq2.png')});
console.log(errs.length?'ERRORS: '+errs.join(' | '):'ALL OK');await b.close();})();
