const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ago=d=>new Date(Date.now()-d*864e5).toISOString();
const log=[{date:ago(2),rpe:6,exercises:[{name:'Kettlebell Swing',type:'reps',reps:15,sets:2,equip:'kettlebell',muscles:['glutes']},{name:'Kettlebell Overhead Press',type:'reps',reps:10,bilateral:true,equip:'kettlebell',muscles:['shoulders']}],repLog:{'1_0_s1':15,'1_0_s2':15,'1_0_s1_w':16,'1_1_s1':10,'1_1_s1_w':12}}];
await p.addInitScript(l=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_v5',l);localStorage.setItem('coach_api_key','k');localStorage.setItem('coach_profile',JSON.stringify({kettlebell:{weights:[12,16]}}));
  window.__resp=null;window.fetch=async(u,o)=>({ok:true,status:200,json:async()=>({model:'m',stop_reason:'end_turn',content:[{type:'text',text:window.__resp||'{}'}]})});},JSON.stringify(log));
await p.goto(__URL);await p.waitForTimeout(600);
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};
const E=f=>p.evaluate(f);
// KB pairs
ok(await E(()=>!kbHasPair()&&!_exOk({double:true})),'no pair → double hidden');
await E(()=>{setKbCount(12,2);});ok(await E(()=>kbHasPair()&&kbWeights().join()==='12,12,16'),'set 2× creates pair');
await E(()=>{setKbCount(12,1);});
ok(await E(()=>DEFAULT_LIB.some(e=>e.name==='Kettlebell Snatch')&&!!EX_INFO['Kettlebell Snatch']&&DEFAULT_LIB.filter(e=>e.double).length===4),'new KB exercises + info');
ok(await E(()=>Object.values(KB_NEW_INFO).every(v=>['ex','hx'].every(k=>!v[k]||_libFind(v[k])))),'new KB variant links resolve');
const lib=n=>`JSON.parse(JSON.stringify(DEFAULT_LIB.find(e=>e.name==='${n}')))`;
// Tabata
await E(new Function(`curExercises=[{...${lib('Kettlebell Swing')},type:'reps',reps:15,sets:3},{...${lib('Squat')},type:'reps',reps:12,sets:3}];wuExercises=[];curSetup={trainingMode:'circuit',format:'tabata',tabataInt:8,_readyDone:true,durationMin:5};startWorkout();`));
ok(await E(()=>curSetup.rounds===4&&curExercises.every(e=>e.type==='time'&&e.duration===20&&e.rest===10)&&_roundLabel()==='Intervall 1/8'&&autoAdvanceOn()),'tabata setup');
await E(()=>{startTimer();clearInterval(tIv);tLeft=1;advance();});
ok(await E(()=>tStatus==='rest'&&tLeft===10),'tabata rest 10s');
await E(()=>{clearInterval(tIv);tIdx=1;tStatus='rest';tLeft=1;advance();clearInterval(tIv);});
ok(await E(()=>tStatus==='work'&&tRound===2&&tIdx===0&&_roundLabel()==='Intervall 3/8'),'tabata round wrap without extra pause');
await E(()=>{clearInterval(tIv);show('s-home');});
// EMOM
await E(new Function(`curExercises=[{...${lib('Kettlebell Swing')},type:'reps',reps:15,sets:3},{...${lib('Push-up')},type:'reps',reps:10,sets:3}];wuExercises=[];curSetup={trainingMode:'circuit',format:'emom',emomMin:12,_readyDone:true,durationMin:12};startWorkout();startTimer();`));
ok(await E(()=>curSetup.rounds===6&&_roundLabel()==='Minute 1/12'&&_fmtVoicePrefix()==='Minute 1. '),'emom setup + label + voice');
await E(()=>{window._emomStart=Date.now()-25000;advance();clearInterval(tIv);});
ok(await E(()=>tStatus==='rest'&&tLeft>=34&&tLeft<=36),'emom rest = rest of minute');
await E(()=>{clearInterval(tIv);show('s-home');});
// Complex
await E(new Function(`curExercises=[{...${lib('Kettlebell Clean')},type:'reps',reps:10,sets:1},{...${lib('Kettlebell Overhead Press')},type:'reps',reps:10,sets:1},{...${lib('Kettlebell Swing')},type:'reps',reps:10,sets:1}];wuExercises=[];curSetup={trainingMode:'circuit',format:'complex',complexRounds:3,roundRestSec:60,_readyDone:true,durationMin:15};startWorkout();startTimer();`));
ok(await E(()=>curSetup.sideRounds&&curSetup.rounds===6&&curExercises[0].reps===5&&curExercises[2].reps===10&&/Seite 1/.test(_roundLabel())),'complex setup per side');
ok(await E(()=>curExercises.every(e=>e.defaultWeight===12)&&curSetup.complexWeight===12),'complex uses weakest bell');
await E(()=>{tIdx=2;tStatus='work';advance();clearInterval(tIv);});
ok(await E(()=>tStatus==='work'&&tRound===2&&/Seite 2/.test(_roundLabel())&&_fmtVoicePrefix()==='Seitenwechsel. '),'side switch without pause');
await E(()=>{tIdx=2;tStatus='work';advance();clearInterval(tIv);});
ok(await E(()=>tStatus==='round_rest'&&tLeft===60),'pause after both sides');
ok(await E(()=>{const s=_currentWorkoutSnapshot('x');return s.exercises[0].reps===10&&s.format==='complex'&&s.complexRounds===3;}),'snapshot keeps originals');
await E(()=>{clearInterval(tIv);show('s-home');});
// Ladder
await E(new Function(`curExercises=[{...${lib('Kettlebell Clean & Press')},type:'reps',reps:5,sets:1},{...${lib('Goblet Squat (Kettlebell)')},type:'reps',reps:8,sets:1}];wuExercises=[];curSetup={trainingMode:'circuit',format:'ladder',ladderKey:'1-5',roundRestSec:30,_readyDone:true,durationMin:15};startWorkout();startTimer();`));
ok(await E(()=>curSetup.rounds===5&&curExercises[0].reps===2&&curExercises[1].reps===1&&_roundLabel()==='Stufe 1/5 · 1 Wdh'),'ladder rung 1 (bilateral = both sides)');
await E(()=>{tIdx=1;tStatus='work';advance();clearInterval(tIv);});
ok(await E(()=>tStatus==='round_rest'&&tLeft===30&&tRound===2&&curExercises[1].reps===2),'ladder next rung after pause');
await E(()=>{clearInterval(tIv);show('s-home');});
// Weight memory
await E(new Function(`curExercises=[{...${lib('Kettlebell Swing')},type:'reps',reps:15,sets:2}];wuExercises=[];curSetup={durationMin:10,_readyDone:true};startWorkout();`));
ok(await E(()=>curExercises[0].defaultWeight===16&&curExercises[0].trackWeight),'remembers 16 kg for swings');
await E(()=>{clearInterval(tIv);show('s-home');});
// Swing counter + challenge
ok(await E(()=>swingCount(0)===30),'swing count');
await E(()=>{startChallenge(1000,28);log.push({date:new Date().toISOString(),rpe:6,exercises:[{name:'Einarmiger Kettlebell Swing',reps:20}],repLog:{'1_0_s1_L':20,'1_0_s1_R':20}});updateHome();});
ok(await E(()=>document.getElementById('challenge-card').style.display==='block'&&/40 \/ 1.000/.test(document.getElementById('challenge-sub').textContent)),'challenge card counts from start');
await E(()=>show('s-analytics'));await p.waitForTimeout(400);
ok(await E(()=>/Swing-Zähler/.test(document.getElementById('swing-card').textContent)),'swing card in analytics');
await p.screenshot({path:require('path').join(__TMP,'g_swing.png')});
// Import
await E(()=>{window.__resp=JSON.stringify({title:'KB EMOM Burner',format:'emom',emomMin:16,exercises:[{name:'Kettlebell Swing',reps:15},{name:'Einarmiger Clean',reps:10,bilateral:true,equip:'kettlebell',muscles:['glutes'],tip:'t',details:'d',mistakes:'m'}],changes:['Double Clean → Clean je Seite'],note:'n'});show('s-home');openImport();document.getElementById('imp-text').value='16 min EMOM: 15 swings, 5 double cleans';});
await E(()=>runImport());await p.waitForTimeout(500);console.log('STATUS',await E(()=>document.getElementById('imp-status').textContent));
ok(await E(()=>curSetup.format==='emom'&&curSetup.emomMin===16&&curExercises[0].name==='Kettlebell Swing'&&curExercises.length===2),'import → emom workout');
ok(await E(()=>loadMyWorkouts()[0].title==='KB EMOM Burner'&&loadMyWorkouts()[0].format==='emom'&&library.some(e=>e.name==='Einarmiger Clean')),'import saved + new exercise in library');
console.log('ERRTXT',await E(()=>document.getElementById('err-txt').textContent+'|'+document.getElementById('err').style.display));ok(await E(()=>/Double Clean/.test(document.getElementById('err')?.textContent||document.body.textContent)),'changes shown');
await p.screenshot({path:require('path').join(__TMP,'g_review.png')});
// Plan format
await E(()=>{window._planCtx=true;const t=new Date();plan={title:'P',startDate:t.toISOString().slice(0,10),kbFocus:true,weeks:[{theme:'A',sessions:[{dow:t.getDay(),focus:'KB',intensity:'medium',durationMin:30,format:'complex'}]}]};pendingPlanSession={wi:0,si:0};curSetup={};_applyPlanFormat();});
ok(await E(()=>curSetup.trainingMode==='circuit'&&curSetup.format==='complex'&&curSetup.complexRounds===4),'plan session format applied');
ok(await E(()=>/KETTLEBELL-FOKUS/.test(_kbFocusTxt(true))&&_kbFocusTxt(false)===''),'plan prompt kb focus');
console.log(errs.length?'ERR '+errs.join(' | '):'NO ERRORS');await b.close();})();
