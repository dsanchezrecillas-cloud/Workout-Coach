const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const dev of [{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}]){
const p=await b.newPage(dev);
await p.addInitScript(()=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_voice','0');});
await p.goto(__URL);await p.waitForTimeout(500);
await p.evaluate(()=>{const L=n=>JSON.parse(JSON.stringify(DEFAULT_LIB.find(e=>e.name===n)));curExercises=['Kettlebell Swing','Push-up','Squat','Plank','Goblet Squat (Kettlebell)','Kettlebell Clean','Hip Thrust','Dead Bug'].map(n=>({...L(n),type:'reps',reps:10,sets:3,rest:30}));wuExercises=[];curSetup={durationMin:30,_readyDone:true};startWorkout();startTimer();});
await p.waitForTimeout(300);
await p.mouse.move(195,600);await p.mouse.wheel(0,700);await p.waitForTimeout(900);
const r=await p.evaluate(()=>{const w=document.getElementById('timer-wrap');const rc=w.getBoundingClientRect();return {scrollY:window.scrollY,top:Math.round(rc.top),h:Math.round(rc.height),compact:w.classList.contains('compact'),bg:getComputedStyle(w).backgroundImage.slice(0,30)+'|'+getComputedStyle(w).backgroundColor};});
console.log(JSON.stringify(r));
await p.screenshot({path:require('path').join(__TMP,'sticky.png')});
}await b.close();})();
