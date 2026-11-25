const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_prefs',JSON.stringify({coreSuggested:true}));});
await p.goto(__URL);await p.waitForTimeout(600);
const E=(f,a)=>p.evaluate(f,a);const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};
// 1. all rounds count
ok(await E(()=>{const d=new Date().toISOString();log.push({date:d,format:'emom',exercises:[{name:'Kettlebell Swing',type:'reps',reps:15}],repLog:{'1_0_s1':15,'2_0_s1':15,'3_0_s1':14,'4_0_s1':15,'2_0_s1_w':16}});
  const h=getExerciseHistory('Kettlebell Swing').at(-1);return h.totalReps===59&&h.sets.length===4&&h.weights[1]===16;}),'history counts every round (59 reps, 4 sets, weight of round 2)');
ok(await E(()=>{const d=new Date().toISOString().slice(0,10);const r=calcChallengeProgress({id:'x',type:'reps',exercise:'swing',target:100,startDate:d,endDate:d});return r.cur===59;}),'rep challenge counts current format + all rounds');
ok(await E(()=>coreHistory('Kettlebell Swing').at(-1).total===59),'core progress counts all rounds');
ok(await E(()=>_exReps({amrap:true,amrapRounds:5,exercises:[{reps:10}],repLog:{}},0)===50),'AMRAP rounds × reps');
// 3. PR also for plan sessions
ok(await E(()=>{log=[{date:new Date(Date.now()-864e5).toISOString(),exercises:[{name:'Liegestütze',type:'reps',reps:10}],repLog:{'1_0_s1':10}}];
  plan={title:'P',startDate:new Date().toISOString().slice(0,10),weeks:[{week:1,sessions:[{dow:new Date().getDay(),focus:'Push',intensity:'medium',durationMin:30}]}]};pendingPlanSession={wi:0,si:0};
  curExercises=[{name:'Liegestütze',type:'reps',reps:10}];wuExercises=[];curSetup={muscles:['chest'],durationMin:30};tReps={'1_0_s1':14};rpe=7;window._prMsg=null;const oN=showNote;showNote=m=>{if(/Rekord/.test(m))window._prMsg=m;oN(m);};
  saveWorkout();return true;}),'plan session saved');
await p.waitForTimeout(900);
ok(await E(()=>/Liegestütze: 14 Wdh \(vorher: 10\)/.test(window._prMsg||'')),'PR detected for plan session');
// 4. actual minutes
ok(await E(()=>wMin({durationMin:30,actualMin:22})===22&&wMin({durationMin:30})===30),'actual minutes preferred');
// 5. toasts: positive styling + queue
await E(()=>{hideErr();_toastQ.length=0;});
await E(()=>{showErr('✓ Gespeichert');showErr('Fehler: kaputt');showNote('🎉 Challenge geschafft');});
ok(await E(()=>document.getElementById('err').classList.contains('info')&&/Gespeichert/.test(document.getElementById('err-txt').textContent)&&_toastQ.length===2),'positive toast styled as info, others queued');
await E(()=>hideErr());await p.waitForTimeout(300);
ok(await E(()=>/kaputt/.test(document.getElementById('err-txt').textContent)&&!document.getElementById('err').classList.contains('info')),'queued error shown next in error style');
// 6. prompt
ok(await E(()=>!/5-7 Hauptübungen \+/.test(document.documentElement.innerHTML)),'no fixed 5–7 rule in prompt');
// 7. review summary
ok(await E(()=>{curSetup={trainingMode:'circuit'};const a=_revSummary({type:'reps',reps:10,sets:3,bilateral:true});curSetup={trainingMode:'sets'};const b=_revSummary({type:'reps',reps:10,sets:3});return /^5 Wdh je Seite pro Runde/.test(a)&&!/3 ×/.test(a)&&/^3 × 10 Wdh/.test(b);}),'review: circuit per round, one-sided as je Seite');
console.log(errs.length?'ERRORS: '+errs.join(' | '):'ALL OK');await b.close();})();
