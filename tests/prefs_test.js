const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const mkW=(names)=>JSON.stringify({briefing:{focus:'f',why:'w',structure:'s',goal:'g'},exercises:[{name:'Hampelmann',warmup:true,type:'time',duration:30},...names.map(n=>({name:n,type:'reps',reps:10,sets:3,rest:60,muscles:['chest']}))]});
// history: push-ups + pull-ups in 6 of 6 workouts
const now=Date.now();const hist=[0,1,2,3,4,5].map(i=>({date:new Date(now-(i+2)*86400000).toISOString(),exercises:[{name:'Liegestütze'},{name:'Klimmzüge'},{name:['Kniebeugen','Plank','Rudern','Dips','Burpees','Swing'][i]}],muscles:['chest'],repLog:{}}));
await p.addInitScript(([h,a,b2,c])=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_api_key','k');localStorage.setItem('coach_v5',JSON.stringify({version:5,data:JSON.parse(h)}));
 window.__prompts=[];window.__resp={a,b:b2,c};
 window.fetch=async(u,o)=>{const body=o.body;window.__prompts.push(body);let t;
   if(/Extrahiere NUR dauerhafte/.test(body))t='{"core":[],"like":["Kettlebell Swing"],"avoid":["Burpees"],"note":"lieber Kettlebell als Kurzhantel"}';
   else if(/ÜBERARBEITUNG/.test(body))t=window.__resp.c;else if(/NEUE VARIANTE/.test(body))t=window.__resp.b;else t=window.__resp.a;
   return {ok:true,status:200,json:async()=>({model:'m',stop_reason:'end_turn',content:[{type:'text',text:t}]})};};
},[JSON.stringify(hist),mkW(['Liegestütze','Burpees','Kniebeugen']),mkW(['Klimmzüge','Ausfallschritte','Plank']),mkW(['Liegestütze','Kettlebell Swing','Kniebeugen'])]);
await p.goto(__URL);await p.waitForTimeout(3000);
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};const E=(f,a)=>p.evaluate(f,a);
// core suggestion dialog
ok(await E(()=>/Liegestütze und Klimmzüge|Klimmzüge und Liegestütze/.test(document.getElementById('confirm-msg')?.textContent||'')),'core suggestion from history');
await E(()=>document.getElementById('confirm-ok-btn').click());await p.waitForTimeout(300);
ok(await E(()=>loadPrefs().core.length===2&&prefOf('Liegestütz')==='core'),'core saved (name variant matches)');
// generate → prompt contains prefs
await E(()=>generateWorkout('Ganzkörper, 30 Minuten, Equipment: Körpergewicht, Klimmzugstange'));await p.waitForTimeout(900);
ok(await E(()=>/STAMMÜBUNGEN[^"]*Liegestütze/.test(window.__prompts.at(-1))),'prefs in generation prompt');
ok(await E(()=>document.querySelector('#rev-list')?.innerHTML.includes('pref-mk')),'★ marker in review');
ok(await E(()=>getComputedStyle(document.getElementById('rev-undo')).display==='none'),'no undo initially');
await p.screenshot({path:require('path').join(__TMP,'pr1.png'),fullPage:false});
// regenerate
await E(()=>revRegenerate());await p.waitForTimeout(900);
ok(await E(()=>/NEUE VARIANTE[^"]*Burpees/.test(window.__prompts.at(-1))&&curExercises.map(e=>e.name).includes('Ausfallschritte')),'regenerate with different exercises');
ok(await E(()=>document.getElementById('rev-undo').style.display==='flex'),'undo visible');
// tune with remember
await E(()=>openRevTune());await p.waitForTimeout(250);
await p.screenshot({path:require('path').join(__TMP,'pr2.png')});
await p.fill('#rt-text','Swings rein, keine Burpees mehr');await p.check('#rt-remember');
await E(()=>submitRevTune());await p.waitForTimeout(1200);
ok(await E(()=>curExercises.map(e=>e.name).includes('Kettlebell Swing')&&/WUNSCH DES NUTZERS: .{0,3}Swings rein/.test(window.__prompts.find(x=>/ÜBERARBEITUNG/.test(x))||'')),'refine applied');
ok(await E(()=>prefOf('Burpees')==='avoid'&&prefOf('Kettlebell Swing')==='like'&&/Kettlebell als Kurzhantel/.test(loadPrefs().notes)),'remembered prefs extracted');
// undo twice
await E(()=>revUndo());ok(await E(()=>curExercises.map(e=>e.name).includes('Ausfallschritte')),'undo → previous');
await E(()=>revUndo());ok(await E(()=>curExercises.map(e=>e.name).includes('Burpees')&&document.getElementById('rev-undo').style.display==='none'),'undo → original, button hidden');
// new generation clears undo
await E(()=>revRegenerate());await p.waitForTimeout(800);await E(()=>generateWorkout('Beine, 20 Minuten'));await p.waitForTimeout(800);
ok(await E(()=>_revUndo.length===0),'fresh generation clears undo');
// learning: delete same exercise 3x → confirm
await E(()=>{const p=loadPrefs();p.swapOut={};savePrefs(p);});
for(let i=0;i<3;i++){await E(()=>{curExercises.unshift({name:'Hampelmann Sprung',type:'time',duration:30,sets:2});showReview();deleteEx(0);});await p.waitForTimeout(150);}
await p.waitForTimeout(600);
ok(await E(()=>/Hampelmann Sprung hast du jetzt 3×/.test(document.getElementById('confirm-msg').textContent)),'3× removal asks');
await E(()=>document.getElementById('confirm-ok-btn').click());await p.waitForTimeout(300);
ok(await E(()=>prefOf('Hampelmann Sprung')==='avoid'),'avoid saved');
// info modal chips
await E(()=>openInfoModal({name:'Klimmzüge'}));await p.waitForTimeout(200);
ok(await E(()=>document.querySelector('#mi-prefs .chip.ac')?.textContent.includes('Stammübung')),'info modal shows ★ active');
await E(()=>[...document.querySelectorAll('#mi-prefs .chip')][1].click());
ok(await E(()=>prefOf('Klimmzüge')==='like'),'info modal switch to like');
await E(()=>closeModal('modal-info'));
// settings
await E(()=>show('s-settings'));await p.waitForTimeout(300);
await E(()=>document.getElementById('prefs-set').scrollIntoView({block:'start'}));await p.waitForTimeout(150);
await p.screenshot({path:require('path').join(__TMP,'pr3.png')});
ok(await E(()=>document.querySelectorAll('#prefs-set .pref-chip').length>=4),'settings lists prefs');
// backup roundtrip includes prefs
ok(await E(()=>{let cap=null;const oc=URL.createObjectURL;URL.createObjectURL=b=>{cap=b;return 'blob:x'};doExport();URL.createObjectURL=oc;return !!cap}),'export runs');
// chat + plan prompt include prefs
ok(await E(()=>_prefsTxt().includes('VERMEIDEN')&&_prefsTxt().includes('Burpees')),'prefs text');
console.log(errs.length?'ERRORS: '+errs.join(' | '):'ALL OK');await b.close();})();
