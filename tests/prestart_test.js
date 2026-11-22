const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t=new Date();const mon=new Date(t);mon.setDate(t.getDate()-((t.getDay()+6)%7)+7);// next Monday
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const pl={title:'Winter-Arc',goal:'strength',freq:2,kbMode:'mix',startDate:iso(mon),weeks:[{week:1,theme:'Technik',sessions:[{dow:1,focus:'KB Ganzkörper',intensity:'easy',durationMin:20,format:'emom'},{dow:0,focus:'Ganzkörper',intensity:'easy',durationMin:20,format:'sets'}]},{week:2,sessions:[{dow:2,focus:'Oberkörper',intensity:'medium',durationMin:30}]}]};
await p.addInitScript(pl=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_api_key','k');localStorage.setItem('coach_prefs',JSON.stringify({coreSuggested:true}));localStorage.setItem('coach_profile',JSON.stringify({name:'Rike'}));localStorage.setItem('coach_plan_v3',pl);},JSON.stringify(pl));
await p.goto(__URL);await p.waitForTimeout(900);
const E=f=>p.evaluate(f);const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};
ok(await E(()=>planNotStarted()),'not started');
ok(await E(()=>_todayPlanSession()===null),'no today session before start (even on matching weekday)');
ok(await E(()=>/Plan startet/.test(document.getElementById('today-hero').textContent)&&/KB Ganzkörper|Ganzkörper/.test(document.getElementById('today-hero').textContent)&&!/Training starten/.test(document.getElementById('today-hero').textContent)),'pre-start hero');
ok(await E(()=>/^0 diese Woche/.test(document.querySelector('.ws-foot').textContent.trim())),'week strip no plan target before start');
ok(await E(()=>/Rike\./.test(document.getElementById('greeting').textContent)),'greeting name');
await p.screenshot({path:require('path').join(__TMP,'prestart.png')});
await E(()=>showPlan());await p.waitForTimeout(300);
ok(await E(()=>/Ab /.test(document.querySelector('.tl-badge')?.textContent||'')),'timeline badge "Ab …"');
// started plan: today session found by date
await E(()=>{const t=new Date();const m=new Date(t);m.setDate(t.getDate()-((t.getDay()+6)%7));const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');plan.startDate=iso(m);plan.weeks[0].sessions.push({dow:t.getDay(),focus:'Heute-Test',intensity:'medium',durationMin:30});savePlan();updateHome();});
ok(await E(()=>!planNotStarted()&&_todayPlanSession()?.s.focus&&/Training starten/.test(document.getElementById('today-hero').textContent)),'started: today session shown');
console.log(errs.length?'ERRORS: '+errs.join(' | '):'ALL OK');await b.close();})();
