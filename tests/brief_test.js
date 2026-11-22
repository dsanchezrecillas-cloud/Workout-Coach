const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ago=d=>new Date(Date.now()-d*864e5).toISOString();
const log=[{date:ago(1),rpe:7,muscles:['chest','triceps'],exercises:[{name:'Push-up',muscles:['chest'],reps:12,sets:3}],repLog:{'1_0_s1':12,'1_0_s2':12,'1_0_s3':10}}];
await p.addInitScript(l=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_v5',l);localStorage.setItem('coach_api_key','k');window.__resp='';window.__prompts=[];
 window.fetch=async(u,o)=>{const bd=JSON.parse(o.body);window.__prompts.push((bd.system||'')+JSON.stringify(bd.messages));return {ok:true,status:200,json:async()=>({content:[{type:'text',text:window.__resp}]})};};},JSON.stringify(log));
await p.goto(__URL);await p.waitForTimeout(500);
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};const E=f=>p.evaluate(f);
// generator returns object with briefing
await E(()=>{window.__resp=JSON.stringify({briefing:{focus:'Rücken und hintere Kette',why:'Gestern Brust, Rücken kam diese Woche zu kurz.',structure:'Schwere Zugübung zuerst, Core am Ende.',goal:'3×12 saubere Rows.'},exercises:[{name:'Inverted Row (Tischrudern)',why:'Hauptzug für den Rücken',type:'reps',reps:12,sets:3,rest:60,muscles:['back'],warmup:false},{name:'Glute Bridge',why:'Gesäß ohne Kniebelastung',type:'reps',reps:15,sets:3,rest:45,muscles:['glutes'],warmup:false},{name:'Hampelmann',type:'time',duration:40,warmup:true,muscles:['legs']}]});startChat();});
await E(()=>generateWorkout('Rücken, 30 Minuten, Körpergewicht'));await p.waitForTimeout(400);
ok(await E(()=>__prompts.some(x=>/KONTEXT/.test(x)&&/Letzte Trainings: gestern/.test(x)&&/Sätze letzte 7 Tage/.test(x))),'generator gets real context');
ok(await E(()=>!__prompts.some(x=>/Plan: Woche/.test(x))),'no plan context for free workout');
ok(await E(()=>curSetup.briefing&&curSetup.briefing.focus==='Rücken und hintere Kette'&&document.getElementById('rev-brief').textContent.includes('Gestern Brust')),'briefing card in review');
ok(await E(()=>document.querySelectorAll('#rev-list .ex-why').length===2),'per-exercise why shown');
await p.screenshot({path:require('path').join(__TMP,'i_brief.png')});
// change workout → stale
await E(()=>{curExercises.push({...DEFAULT_LIB.find(e=>e.name==='Plank'),type:'hold',duration:40,sets:2});showReview();});
ok(await E(()=>/Briefing aktualisieren/.test(document.getElementById('rev-brief').textContent)),'stale after change');
await E(()=>{window.__resp=JSON.stringify({focus:'Rücken, Gesäß, Rumpf',why:'Ergänzt die Brust-Einheit von gestern.',structure:'Zug zuerst.',goal:'Plank 2×40 s.',hints:['Kein Drücken drin — bewusst, weil gestern Brust.'],whys:{'Plank':'Rumpf zum Abschluss'}});});
await E(()=>analyzeWorkout());await p.waitForTimeout(300);
ok(await E(()=>curSetup.briefing.hints.length===1&&curExercises.find(e=>e.name==='Plank').why==='Rumpf zum Abschluss'&&!/aktualisieren/.test(document.getElementById('rev-brief').textContent)),'analyze refreshes + hints + whys');
await p.screenshot({path:require('path').join(__TMP,'i_brief2.png')});
// own workout without briefing → analyze button
await E(()=>{curSetup={durationMin:20};curExercises=[{...DEFAULT_LIB.find(e=>e.name==='Squat'),type:'reps',reps:10,sets:3}];wuExercises=[];showReview();});
ok(await E(()=>/Workout analysieren/.test(document.getElementById('rev-brief').textContent)),'analyze offered for own workout');
// timer + save + history + portfolio
await E(()=>{_setBriefing({focus:'Beine',why:'x',structure:'y',goal:'z'});curSetup._readyDone=true;startWorkout();});
ok(await E(()=>document.getElementById('brief-btn').style.display==='flex'),'briefing button in timer');
await E(()=>{openBriefSheet();});ok(await E(()=>document.getElementById('start-title').textContent==='Beine'),'timer briefing sheet');
await E(()=>{closeModal('modal-start');clearInterval(tIv);tReps={'1_0_s1':10};saveWorkout();document.querySelectorAll('.modal-ov.open').forEach(m=>m.classList.remove('open'));});
ok(await E(()=>log[log.length-1].briefing&&log[log.length-1].briefing.focus==='Beine'&&!('sig' in log[log.length-1].briefing)),'briefing saved with workout');
await E(()=>showHistory());await p.waitForTimeout(300);
ok(await E(()=>/Fokus: Beine/.test(document.getElementById('hist-list').textContent)),'history shows focus');
ok(await E(()=>_currentWorkoutSnapshot('t').briefing.focus==='Beine'),'portfolio keeps briefing');
console.log(errs.length?'ERR '+errs.join(' | '):'NO ERRORS');await b.close();})();
