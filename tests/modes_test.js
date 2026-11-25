const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_prefs',JSON.stringify({coreSuggested:true}));localStorage.setItem('coach_voice','0');});
await p.goto(__URL);await p.waitForTimeout(700);
const E=(f,a)=>p.evaluate(f,a);const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};
const st=()=>E(()=>({s:tStatus,i:tIdx,r:tRound,set:tSet,left:tLeft,run:tRun,lbl:document.getElementById('ph-label').textContent,disp:document.getElementById('t-disp').textContent,btn:document.getElementById('main-btn').textContent,rd:document.getElementById('reps-done-btn').textContent,rl:(()=>{try{return _roundLabel()}catch(e){return''}})()}));
// ── bilateral fixer
ok(await E(()=>{const a=_fixBilateral({name:'Liegestütze',type:'reps',reps:10,bilateral:true},true),b=_fixBilateral({name:'Ausfallschritte',type:'reps',reps:10,bilateral:true},true),c=_fixBilateral({name:'Einarmiger Kettlebell Swing',type:'reps',reps:20,bilateral:false},true),d=_fixBilateral({name:'Kettlebell Rudern',type:'reps',reps:8,bilateral:true},true);
  return !a.bilateral&&a.reps===10&&b.bilateral&&b.reps===20&&c.bilateral&&c.reps===20&&d.bilateral&&d.reps===16;}),'bilateral corrected by name, per-side reps → total');
// ── EMOM: one continuous minute clock
await E(()=>{curExercises=[{name:'Liegestütze',type:'reps',reps:10,sets:3},{name:'Goblet Squat',type:'reps',reps:12,sets:3}];wuExercises=[];curSetup={muscles:['chest'],durationMin:6,format:'emom',emomMin:6,trainingMode:'circuit',_readyDone:true};startWorkout();startTimer();});
await p.waitForTimeout(300);
let a=await st();
ok(a.s==='work'&&a.run&&/^0?1:00|^00:5|^01:00/.test(a.disp)&&/10 WIEDERHOLUNGEN/.test(a.lbl)&&/Pause/.test(a.btn)&&/Geschafft/.test(a.rd),'emom work shows running minute clock');
await E(()=>{window._emomStart=Date.now()-22000;repsDone();});a=await st();
ok(a.s==='rest'&&a.left>=37&&a.left<=39&&a.lbl==='NÄCHSTE MINUTE IN','after done: rest = rest of the minute ('+a.left+')');
await E(()=>{window._emomStart=Date.now()-60100;tick();});a=await st();
ok(a.s==='work'&&a.i===1&&a.left>=59,'next minute starts automatically ('+a.left+')');
// minute runs out without tapping → planned reps logged, straight to next minute
await E(()=>{window._emomStart=Date.now()-60500;tick();});a=await st();
ok(a.s==='work'&&a.i===0&&a.r===2&&a.left>=59,'time over → next minute, no extra pause');
ok(await E(()=>tReps['1_1_s1']===12),'planned reps logged on timeout');
// pause keeps remaining time
await E(()=>{window._emomStart=Date.now()-30000;pauseTimer();window._emomStart=Date.now()-55000;startTimer();});a=await st();
ok(a.left>=29&&a.left<=31,'pause/resume keeps remaining minute ('+a.left+')');
await E(()=>{clearInterval(tIv);});
// ── classic circuit: each exercise once per round
await E(()=>{curExercises=[{name:'Liegestütze',type:'reps',reps:10,sets:3},{name:'Kniebeugen',type:'reps',reps:12,sets:3}];wuExercises=[];curSetup={muscles:['chest'],durationMin:20,trainingMode:'circuit',rounds:2,exRest:false,roundRest:true,_readyDone:true};startWorkout();startTimer();clearInterval(tIv);});
const seq=await E(()=>{const o=[];for(let g=0;g<8&&tStatus!=='done';g++){o.push(tStatus+tIdx+'r'+tRound);if(tStatus==='work')repsDone();else{tLeft=1;advance();}clearInterval(tIv);}return o.join(' ');});
console.log(seq);
ok(/^work0r1 work1r1 round_rest0r2 work0r2 work1r2/.test(seq),'circuit: one pass per round, then round rest');
// ── flow: timed exercise auto-starts after 3 s
await E(()=>{curExercises=[{name:'Liegestütze',type:'reps',reps:10,sets:1},{name:'Plank',type:'hold',duration:30,sets:1}];wuExercises=[];curSetup={muscles:['core'],durationMin:10,trainingMode:'circuit',rounds:1,exRest:false,roundRest:false,_readyDone:true};startWorkout();startTimer();clearInterval(tIv);repsDone();});
a=await st();ok(a.s==='ready'&&a.i===1,'plank armed (ready)');
await p.waitForTimeout(3300);a=await st();ok(a.s==='work'&&a.run,'plank started automatically');
await E(()=>{clearInterval(tIv);});
// ── sets mode keeps waiting for tap
await E(()=>{curExercises=[{name:'Plank',type:'hold',duration:30,sets:2,rest:30}];wuExercises=[];curSetup={muscles:['core'],durationMin:10,trainingMode:'sets',_readyDone:true};localStorage.setItem('coach_autoadvance','0');startWorkout();startTimer();clearInterval(tIv);tLeft=1;advance();clearInterval(tIv);tLeft=1;advance();clearInterval(tIv);});
await p.waitForTimeout(3300);a=await st();ok(a.s==='ready','sets mode: hold still waits for tap');
// ── tabata exact interval count
await E(()=>{curExercises=[{name:'Burpees',type:'reps',reps:10},{name:'Kniebeugen',type:'reps',reps:10},{name:'Mountain Climber',type:'reps',reps:10}];wuExercises=[];curSetup={muscles:['legs'],durationMin:4,format:'tabata',tabataInt:8,trainingMode:'circuit',_readyDone:true};startWorkout();startTimer();clearInterval(tIv);});
ok(await E(()=>_roundLabel()==='Intervall 1/8'),'tabata label 1/8');
const n=await E(()=>{let w=0;for(let g=0;g<40&&tStatus!=='done';g++){if(tStatus==='work')w++;tLeft=1;advance();clearInterval(tIv);}return w;});
ok(n===8,'tabata ends after exactly 8 work intervals ('+n+')');
console.log(errs.length?'ERRORS: '+errs.join(' | '):'ALL OK');await b.close();})();
