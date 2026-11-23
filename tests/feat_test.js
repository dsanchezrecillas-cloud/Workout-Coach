const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(__APP,'utf8');
const errs=[];const vc=new VirtualConsole();vc.on('error',(...a)=>errs.push(a.map(String).join(' ')));vc.on('jsdomError',e=>errs.push(e.message));
const spoken=[];
const ago=d=>{const x=new Date(Date.now()-d*864e5);return x.toISOString().slice(0,10);};
const mkLog=()=>[
 {date:ago(5),rpe:8,exercises:[{name:'Kettlebell Swing',equip:'kettlebell',muscles:['glutes','hamstrings'],sets:3,reps:15,defaultWeight:12}],repLog:{'1_0_s1':15,'1_0_s2':15,'1_0_s3':15}},
 {date:ago(3),rpe:9,exercises:[{name:'Kettlebell Swing',equip:'kettlebell',muscles:['glutes','hamstrings'],sets:3,reps:15,defaultWeight:12}],repLog:{'1_0_s1':15,'1_0_s2':14,'1_0_s3':13}},
 {date:ago(1),rpe:9,exercises:[{name:'Kettlebell Swing',equip:'kettlebell',muscles:['glutes','hamstrings'],sets:3,reps:15,defaultWeight:12}],repLog:{'1_0_s1':13,'1_0_s2':12,'1_0_s3':12}},
];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',virtualConsole:vc,
 beforeParse(w){w.localStorage.setItem('coach_v5',JSON.stringify(mkLog()));
  w.localStorage.setItem('coach_profile',JSON.stringify({kettlebell:{weights:[12,16]}}));
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};
  w.navigator.wakeLock={request:async()=>({release:async()=>{},addEventListener(){}})};
  w.AudioContext=class{constructor(){this.state='running';this.destination={};this.currentTime=0}createOscillator(){return{connect(){},start(){},stop(){},frequency:{setValueAtTime(){}},type:''}}createGain(){return{connect(){},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}}}}resume(){return Promise.resolve()}};
  w.SpeechSynthesisUtterance=function(t){this.text=t;};
  w.speechSynthesis={speak:u=>spoken.push(u.text),cancel(){},getVoices:()=>[{lang:'de-DE',name:'Anna'}]};
 }});
const w=dom.window,d=w.document,E=c=>w.eval(c);
const t=(n,f)=>{try{f();console.log('PASS',n);}catch(e){console.log('FAIL',n,'—',e.message);errs.push(n);}};
const A=(c,m)=>{if(!c)throw new Error(m||'assert');};
setTimeout(()=>{
 // 3 Deload
 t('deload card shows on high RPE + falling volume',()=>{E('updateDeloadCard()');A(d.getElementById('deload-card').style.display==='block','hidden');A(/9|8,7/.test(d.getElementById('deload-sub').textContent));});
 t('deload dismiss hides for 7 days',()=>{E("dismissCard('deload')");A(d.getElementById('deload-card').style.display==='none');w.localStorage.removeItem('coach_dismiss_deload');});
 t('applyAutoDeload without plan sets applied flag & hides',()=>{E('applyAutoDeload()');A(w.localStorage.getItem('coach_deload_applied'));E('updateDeloadCard()');A(d.getElementById('deload-card').style.display==='none');w.localStorage.removeItem('coach_deload_applied');});
 t('applyAutoDeload with plan sets next-7-day sessions easy',()=>{
   E(`plan={startDate:todayIso(),durMin:20,weeks:[{theme:'Aufbau',sessions:[{dow:new Date().getDay(),intensity:'hard',durationMin:45},{dow:(new Date().getDay()+2)%7,intensity:'hard',durationMin:45}]},{theme:'Aufbau',sessions:[{dow:3,intensity:'hard',durationMin:45}]}]};`);
   E('applyAutoDeload()');const p=E('plan');
   const easy=p.weeks.flatMap(x=>x.sessions).filter(s=>s.intensity==='easy').length;
   A(easy>=1,'none easy');A(p.weeks[0].sessions.every(s=>s.durationMin===20||s.intensity!=='easy'));
   E('plan=null');w.localStorage.removeItem('coach_deload_applied');
 });
 // 2 Balance
 t('muscle balance counts sets per group',()=>{const b=E('muscleBalance(7)');A(b['Gesäß']===9,'glute '+JSON.stringify(b));A(b['Beine']===4.5,'legs '+b['Beine']);A(b['Brust']===0);});
 t('balance card names neglected groups',()=>{E('updateBalanceCard()');A(d.getElementById('balance-card').style.display==='block');A(/Brust/.test(d.getElementById('balance-sub').textContent)&&/Rücken/.test(d.getElementById('balance-sub').textContent));});
 t('muscle balance renders bars',()=>{E(`log.push({date:new Date().toISOString(),rpe:7,exercises:[{name:'Kettlebell Swing',equip:'kettlebell',muscles:['glutes','hamstrings'],sets:2,reps:10}],repLog:{'1_0_s1':10,'1_0_s2':10}})`);E('renderMuscleBalance()');E('log.pop()');A((d.getElementById('muscle-balance').innerHTML.match(/Sätze/g)||[]).length>=7);});
 // 4 KB upgrade
 t('no KB upgrade when reps missed / RPE high',()=>{A(E("kbUpgradeHtml({name:'Kettlebell Swing',equip:'kettlebell'})")==='');});
 t('KB upgrade suggests next owned bell',()=>{
   E(`log.forEach(w=>{w.rpe=5;w.repLog={'1_0_s1':15,'1_0_s2':15,'1_0_s3':15,'1_0_s1_w':12};});`);
   const h=E("kbUpgradeHtml({name:'Kettlebell Swing',equip:'kettlebell'})");A(/16-kg/.test(h),h);
 });
 t('KB upgrade suggests buying when none heavier',()=>{E(`log.forEach(w=>w.repLog['1_0_s1_w']=16)`);const h=E("kbUpgradeHtml({name:'Kettlebell Swing',equip:'kettlebell'})");A(/18–22 kg/.test(h),h);});
 // 7 Bench
 t('bench card due without assessment after 3 workouts',()=>{E('updateBenchCard()');A(d.getElementById('bench-card').style.display==='block');});
 t('bench card hidden with fresh assessment',()=>{E(`saveProfile({...loadProfile(),assessment:{date:todayIso(),pushups:20,plank:60,pullups:5}})`);E('updateBenchCard()');A(d.getElementById('bench-card').style.display==='none');});
 t('bench card due after 28 days, mentions pullups',()=>{E(`saveProfile({...loadProfile(),assessment:{date:'${ago(30)}',pushups:20,plank:60,pullups:5}})`);E('updateBenchCard()');A(/5 Klimmzüge/.test(d.getElementById('bench-sub').textContent));});
 // 8 Favs
 t('fav quick start appears and toggles',()=>{
   E(`saveMyWorkouts([{id:'my_1',title:'KB AMRAP',capMin:20,recordRounds:7,exercises:[{name:'Kettlebell Swing',sets:1,reps:15}]}])`);
   E('updateFavQuick()');A(d.getElementById('fav-quick').style.display==='none');
   E("toggleFavWorkout('my_1')");A(d.getElementById('fav-quick').style.display==='block');A(/7 Runden/.test(d.getElementById('fav-quick-list').textContent));
 });
 // 1 Readiness
 t('readiness levels',()=>{A(E('readyLevel({sleep:2,sore:2,energy:1})')==='green');A(E('readyLevel({sleep:2,sore:2,energy:0})')==='yellow');A(E('readyLevel({sleep:0,sore:1,energy:1})')==='red');});
 t('ready check opens on start, yellow drops a set without touching original',()=>{
   const orig=[{name:'Push-up',type:'reps',sets:3,reps:10,muscles:['chest']},{name:'Row',type:'reps',sets:1,reps:10,muscles:['lats']}];
   w.__orig=orig;E(`curExercises=[...window.__orig];wuExercises=[];curSetup={durationMin:20};`);
   E('startWorkout()');A(d.getElementById('modal-ready').classList.contains('open'),'modal not open');
   E("readyPick('sleep',1);readyPick('sore',1);readyPick('energy',1)");
   A(/Angepasst/.test(d.getElementById('ready-result').textContent));
   E("applyReady('ease')");
   A(E('curExercises[0].sets')===2&&E('curExercises[1].sets')===1,'sets');A(orig[0].sets===3,'original mutated');
   A(E('curSetup.readiness.level')==='yellow'&&E('curSetup.reserve')===true,'reserve');
   A(!d.getElementById('modal-ready').classList.contains('open'));
 });
 t('voice announces first exercise',()=>{E("isWU=false;tIdx=0;tSet=1;tStatus='work';updateTimer()");A(spoken.some(s=>/Push-up, 10 Wiederholungen/.test(s)),spoken.join('|'));});
 t('voice toggle off/on syncs UI',()=>{E('toggleVoice()');A(!d.getElementById('voice-btn').classList.contains('on')&&!d.getElementById('voice-setting').classList.contains('on'));E('toggleVoice()');A(d.getElementById('voice-btn').classList.contains('on'));});
 t('red light AMRAP shortens cap',()=>{
   E(`curExercises=[{name:'Kettlebell Swing',type:'reps',reps:15,sets:1,muscles:['glutes']}];wuExercises=[];curSetup={durationMin:30,trainingMode:'circuit',capMin:30,rounds:99};`);
   E('_ready={sleep:0,sore:0,energy:1};curSetup._readyDone=true;');
   // call only the mutating part: applyReady restarts workout; stub startWorkout
   const sw=w.startWorkout;w.startWorkout=()=>{};E("applyReady('light')");w.startWorkout=sw;
   A(E('curSetup.capMin')===20,'cap '+E('curSetup.capMin'));
 });
 // 6 Race
 t('race uses splits of best matching AMRAP',()=>{
   E(`log.push({date:'${ago(2)}',amrap:true,amrapRounds:3,capMin:10,amrapSplits:[100,210,330],rpe:7,exercises:[{name:'Kettlebell Swing',type:'reps',reps:15,sets:1,muscles:['glutes']}],repLog:{}});`);
   E(`curExercises=[{name:'Kettlebell Swing',type:'reps',reps:15,sets:1,muscles:['glutes']}];curSetup={trainingMode:'circuit',capMin:10,rounds:99};`);
   E('window._amrapSplits=[];_amrapStart=Date.now()-50000;_initRace()');
   A(JSON.stringify(E('window._raceSplits'))==='[100,210,330]');
   A(/Runde 1 bei 0?1:40/.test(E('raceLine()')),E('raceLine()'));
   E('window._amrapSplits=[90]');A(/10 Sekunden voraus/.test(E('_raceSpeech()')),E('_raceSpeech()'));
   E('window._amrapSplits=[90,200,320]');A(/überboten/.test(E('raceLine()')));
 });
 t('race falls back to average pace',()=>{E('log[log.length-1].amrapSplits=undefined;_initRace()');A(E('window._raceIsAvg')===true&&E('window._raceSplits[0]')===200);});
 t('amrap voice crossings',()=>{spoken.length=0;E('_amrapVoice(305,298)');A(spoken.includes('Noch 5 Minuten'),spoken.join('|'));spoken.length=0;E('_amrapVoice(62,59)');A(spoken.includes('Noch eine Minute'));spoken.length=0;E('_amrapVoice(4,1)');A(spoken.join(',')==='drei,zwei,eins',spoken.join(','));});
 t('readiness context in analysis',()=>{E(`log[0].readiness={level:'red',mode:'light'}`);A(/TAGESFORM/.test(E('_readinessCtx()')));});
 t('updateHome runs clean',()=>{E('updateHome()');});
 const real=errs.filter(e=>!/Not implemented|scrollTo/.test(e));
 console.log(real.length?'ERRORS:\n'+real.join('\n'):'NO ERRORS');process.exit(0);
},400);
