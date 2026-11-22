const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');
const ago=d=>new Date(Date.now()-d*864e5).toISOString();
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const ex=[{name:'Kettlebell Swing',equip:'kettlebell',type:'reps',muscles:['glutes','hams'],sets:3,reps:15},{name:'Liegestütze',type:'reps',muscles:['chest','triceps'],sets:3,reps:12}];
const log=[{date:ago(1),rpe:7,exercises:ex,repLog:{'1_0_s1':15,'1_0_s2':15,'1_0_s3':15,'1_1_s1':12,'1_1_s2':12,'1_1_s3':10}},{date:ago(2),stretch:true,exercises:[],repLog:{}}];
await p.addInitScript(l=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_v5',l);localStorage.setItem('coach_api_key','x');},JSON.stringify(log));
await p.goto(__URL);await p.waitForTimeout(700);
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push('FAIL '+m);};
ok(await p.$eval('#week-strip',e=>e.querySelectorAll('.ws-day').length===7),'week strip 7 days');
ok(await p.$eval('#week-strip',e=>e.querySelectorAll('.ws-dot.done').length>=0&&/gesamt/.test(e.textContent)),'week strip footer');
ok(await p.$eval('#today-hero',e=>/Bereit fürs Training/.test(e.textContent)),'hero free state');
ok(await p.evaluate(()=>document.body.classList.contains('has-nav')),'nav visible on home');
ok(await p.evaluate(()=>!document.querySelector('i[data-ic]')),'all icons hydrated');
await p.screenshot({path:require('path').join(__TMP,'d_home.png'),fullPage:true});
// start sheet
await p.click('.bnav-main');await p.waitForTimeout(300);
ok(await p.$eval('#start-opts',e=>e.children.length>=4),'start sheet options');
await p.screenshot({path:require('path').join(__TMP,'d_sheet.png')});
await p.evaluate(()=>closeModal('modal-start'));
// plan hero
await p.evaluate(()=>{const dow=new Date().getDay();const t=new Date();const mon=new Date(t);mon.setDate(t.getDate()-((t.getDay()+6)%7));
  plan={title:'P',startDate:mon.toISOString().slice(0,10),durMin:20,freq:3,_extFixV1:true,weeks:[{theme:'Aufbau',sessions:[{dow:1,focus:'Ganzkörper',intensity:'medium',durationMin:30,done:true},{dow,focus:'Oberkörper',intensity:'hard',durationMin:35},{dow:(dow+2)%7||5,focus:'Unterkörper',intensity:'medium',durationMin:30}]},{theme:'Aufbau',sessions:[{dow:1,focus:'Ganzkörper',intensity:'medium',durationMin:30}]}]};savePlan();updateHome();});
ok(await p.$eval('#today-hero',e=>/Oberkörper/.test(e.textContent)&&/Training starten/.test(e.textContent)),'hero plan state');
ok(await p.evaluate(()=>!!pendingPlanSession),'pendingPlanSession set');
await p.screenshot({path:require('path').join(__TMP,'d_home_plan.png')});
// nav
await p.click('#bnav [data-nav="s-history"]');await p.waitForTimeout(200);
ok(await p.evaluate(()=>document.getElementById('s-history').classList.contains('active')&&document.querySelector('#bnav [data-nav="s-history"]').classList.contains('on')),'nav to history');
await p.click('#bnav [data-nav="s-analytics"]');await p.waitForTimeout(500);
ok(await p.$eval('#muscle-balance',e=>!!e.querySelector('svg')),'balance silhouette');
await p.screenshot({path:require('path').join(__TMP,'d_ana.png'),fullPage:true});
// timer: wake lock fallback + far view + phase
await p.evaluate(()=>{Object.defineProperty(navigator,'wakeLock',{value:{request:()=>Promise.reject(new Error('no'))},configurable:true});
  curExercises=[{name:'Kettlebell Swing',type:'time',duration:30,rest:15,sets:2,muscles:['glutes']}];wuExercises=[];curSetup={durationMin:10,_readyDone:true};startWorkout();});
await p.waitForTimeout(400);
ok(await p.evaluate(()=>!document.body.classList.contains('has-nav')),'nav hidden in timer');
ok(await p.evaluate(()=>document.getElementById('wake-ind').classList.contains('ok')||document.getElementById('wake-ind').classList.contains('bad')),'wake indicator state set');
await p.click('#far-btn');await p.waitForTimeout(200);
ok(await p.evaluate(()=>document.getElementById('s-timer').classList.contains('far')),'far view on');
await p.evaluate(()=>{startTimer();});await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.getElementById('s-timer').dataset.phase==='work'),'phase work');
await p.evaluate(()=>{tLeft=3;_syncPhase();});
ok(await p.evaluate(()=>document.getElementById('s-timer').dataset.final==='1'),'final countdown flag');
await p.evaluate(()=>{tLeft=24;_syncPhase();});
await p.screenshot({path:require('path').join(__TMP,'d_timer_far.png')});
await p.click('#far-btn');await p.evaluate(()=>{tLeft=24;_syncPhase();});await p.screenshot({path:require('path').join(__TMP,'d_timer.png')});
// finish hero with record
await p.evaluate(()=>{clearInterval(tIv);tRun=false;
  curExercises=JSON.parse(JSON.stringify(log[0].exercises));curSetup={durationMin:20,_startedAt:Date.now()-23*60000,muscles:['glutes','chest']};
  tReps={'1_0_s1':16,'1_0_s2':16,'1_0_s3':16,'1_1_s1':12,'1_1_s2':12,'1_1_s3':12};tStatus='done';initRating();});
await p.waitForTimeout(1300);
ok(await p.$eval('#fin-title',e=>e.textContent==='Neuer Rekord!'),'record detected');
ok(await p.$eval('#fin-stats',e=>/23/.test(e.textContent)&&/84/.test(e.textContent)),'finish stats');
await p.screenshot({path:require('path').join(__TMP,'d_finish.png')});
// story image
const data=await p.evaluate(()=>_storyCanvas().toDataURL('image/png'));
require('fs').writeFileSync(require('path').join(__TMP,'d_story.png'),Buffer.from(data.split(',')[1],'base64'));
ok(data.length>20000,'story canvas rendered');
// save stores actualMin
await p.evaluate(()=>{saveWorkout();});
ok(await p.evaluate(()=>log[log.length-1].actualMin===23),'actualMin saved');
ok(await p.evaluate(()=>!document.getElementById('wake-ind').classList.contains('ok')),'wake released after leaving timer');

// round 2
await p.evaluate(()=>show('s-home'));await p.waitForTimeout(200);
await p.evaluate(()=>{document.getElementById('c-text').textContent='Sehr langer Coach-Text. '.repeat(30);});await p.waitForTimeout(150);
ok(await p.evaluate(()=>document.getElementById('c-more').style.display==='flex'),'coach clamp shows mehr');
ok(await p.evaluate(()=>document.querySelectorAll('#routine-rows .rt-row').length===2),'routine rows');
await p.evaluate(()=>routineMenu('evening'));await p.waitForTimeout(200);
ok(await p.$eval('#start-title',e=>/Abend/i.test(e.textContent)),'routine menu sheet');
await p.evaluate(()=>closeModal('modal-start'));
await p.evaluate(()=>{['deload-card','bench-card'].forEach(id=>document.getElementById(id).style.display='block');updateHintRail();});
ok(await p.evaluate(()=>document.getElementById('hint-wrap').style.display==='block'&&HINT_PRIO.map(id=>document.getElementById(id)).filter(el=>el&&getComputedStyle(el).display!=='none').length<=2),'hint stack max 2');
await p.screenshot({path:require('path').join(__TMP,'e_home.png')});
await p.evaluate(()=>document.querySelectorAll('.modal-ov.open').forEach(m=>m.classList.remove('open')));
await p.evaluate(()=>{plan.title='Winter Arc – 3 Wochen';plan.intro='drei Wochen Basis';for(let i=0;i<9;i++)plan.weeks.push({theme:i==2?'Deload':'Aufbau',sessions:[{dow:1,focus:'Ganzkörper',intensity:'medium',durationMin:30},{dow:3,focus:'Oberkörper',intensity:'medium',durationMin:30}]});savePlan();showPlan();});
await p.waitForTimeout(400);
ok(await p.evaluate(()=>plan.title==='Winter Arc – 11 Wochen'&&plan.intro==='11 Wochen Basis'),'plan text fixed on save');
ok(await p.evaluate(()=>document.querySelectorAll('#week-tabs .tl-item').length===11&&!!document.querySelector('.tl-item.open #plan-sessions')),'plan timeline');
await p.evaluate(()=>renderPlanView(3));
ok(await p.evaluate(()=>!!document.querySelectorAll('#week-tabs .tl-item')[3].querySelector('#plan-sessions')),'timeline switch week');
await p.evaluate(()=>document.querySelectorAll('.modal-ov.open').forEach(m=>m.classList.remove('open')));await p.screenshot({path:require('path').join(__TMP,'e_plan.png'),fullPage:true});
await p.evaluate(()=>{showHistory();hideErr();document.querySelectorAll('.modal-ov.open').forEach(m=>m.classList.remove('open'));});await p.waitForTimeout(400);
ok(await p.evaluate(()=>document.querySelectorAll('#hist-cal .hc-d').length>=28&&document.querySelectorAll('#hist-list .hw-head').length>=1),'history calendar + week groups');
await p.screenshot({path:require('path').join(__TMP,'e_hist.png'),fullPage:true});
console.log(errs.length?'ERRORS:\n'+errs.join('\n'):'NO ERRORS');await b.close();})();
