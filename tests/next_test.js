const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_profile',JSON.stringify({kettlebell:{weights:[12,16]}}));window.__sp=[];});
await p.goto(__URL);await p.waitForTimeout(500);
await p.evaluate(()=>{window.speak=(t)=>window.__sp.push(t);});
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};const E=f=>p.evaluate(f);
const last=()=>E(()=>{const a=window.__sp;return a[a.length-1]||'';});
const L=n=>`JSON.parse(JSON.stringify(DEFAULT_LIB.find(e=>e.name==='${n}')))`;
// sets mode
await E(new Function(`curExercises=[{...${L('Kettlebell Swing')},type:'reps',reps:15,sets:2,rest:60,trackWeight:true,defaultWeight:16},{...${L('Kettlebell Overhead Press')},type:'reps',reps:10,sets:2,rest:60,trackWeight:true,defaultWeight:12}];wuExercises=[];curSetup={_readyDone:true,durationMin:10};startWorkout();startTimer();`));
await E(()=>{advance();clearInterval(tIv);});
ok((await last())==='Pause','same exercise next set → just "Pause"');
await E(()=>{tSet=2;tStatus='work';advance();clearInterval(tIv);});
ok((await last())==='Pause. Als Nächstes: Kettlebell Overhead Press, 5 je Seite, 12 Kilo','next exercise with per-side + changed weight: '+await last());
await E(()=>{tLeft=6;window.__sp.length=0;tick();clearInterval(tIv);});
ok((await last())==='Noch 5 Sekunden, gleich Kettlebell Overhead Press','reminder 5s before end');
await E(()=>{clearInterval(tIv);show('s-home');});
// circuit round rest
await E(new Function(`curExercises=[{...${L('Kettlebell Swing')},type:'reps',reps:15,sets:1},{...${L('Push-up')},type:'reps',reps:10,sets:1}];wuExercises=[];curSetup={trainingMode:'circuit',format:'rounds',rounds:3,roundRest:true,exRest:false,_readyDone:true,durationMin:10};startWorkout();startTimer();`));
await E(()=>{tIdx=1;tStatus='work';advance();clearInterval(tIv);});
ok((await last())==='Runde geschafft. Als Nächstes: Kettlebell Swing, 15 Wiederholungen','round rest names first exercise: '+await last());
await E(()=>{clearInterval(tIv);show('s-home');});
// EMOM end of round
await E(new Function(`curExercises=[{...${L('Kettlebell Swing')},type:'reps',reps:15,sets:1},{...${L('Push-up')},type:'reps',reps:10,sets:1}];wuExercises=[];curSetup={trainingMode:'circuit',format:'emom',emomMin:10,_readyDone:true,durationMin:10};startWorkout();startTimer();`));
await E(()=>{tIdx=1;tStatus='work';window._emomKey='x';window._emomStart=Date.now()-20000;repsDone();clearInterval(tIv);});
ok((await last())==='Geschafft. Als Nächstes: Kettlebell Swing, 15 Wiederholungen, 12 Kilo','emom wraps to next round: '+await last());
await E(()=>{clearInterval(tIv);show('s-home');});
// Ladder round rest
await E(new Function(`curExercises=[{...${L('Kettlebell Clean & Press')},type:'reps',reps:5,sets:1},{...${L('Squat')},type:'reps',reps:5,sets:1}];wuExercises=[];curSetup={trainingMode:'circuit',format:'ladder',ladderKey:'1-5',roundRestSec:30,_readyDone:true,durationMin:10};startWorkout();startTimer();`));
await E(()=>{tIdx=1;tStatus='work';advance();clearInterval(tIv);});
ok((await last())==='Runde geschafft. Als Nächstes: Stufe 2: Kettlebell Clean & Press, 2 je Seite','ladder rung announced: '+await last());
await E(()=>{clearInterval(tIv);show('s-home');});
// Tabata short
await E(new Function(`curExercises=[{...${L('Kettlebell Swing')},sets:1},{...${L('Squat')},sets:1}];wuExercises=[];curSetup={trainingMode:'circuit',format:'tabata',tabataInt:8,_readyDone:true,durationMin:4};startWorkout();startTimer();`));
await E(()=>{tLeft=1;advance();clearInterval(tIv);});
ok((await last())==='Pause. Gleich: Squat','tabata short form: '+await last());
console.log(errs.length?'ERR '+errs.join(' | '):'NO ERRORS');await b.close();})();
