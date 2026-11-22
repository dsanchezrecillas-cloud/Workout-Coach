const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(__APP,'utf8');
const vc=new VirtualConsole();const errs=[];vc.on('jsdomError',e=>{if(!/Not implemented/.test(e.message))errs.push(e.message)});
let mode='empty',calls=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',virtualConsole:vc,beforeParse(w){
 w.localStorage.setItem('coach_api_key','k');w.localStorage.setItem('coach_v5',JSON.stringify([{date:new Date().toISOString(),rpe:6,exercises:[{name:'A',muscles:['chest']}],repLog:{'1_0_s1':10}}]));
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};
 w.fetch=async(u,o)=>{const b=JSON.parse(o.body);calls.push(b.model+':'+b.max_tokens);let content;
  if(mode==='empty')content=b.model==='claude-sonnet-5-5'?[]:[{type:'text',text:'{"message":"Gute Arbeit heute.","tip":"Trink Wasser."}'}];
  if(mode==='prose')content=[{type:'text',text:'Gute Arbeit heute, morgen ist Ruhetag.'}];
  if(mode==='cut')content=[{type:'text',text:'{"message":"Stark trainiert, jetzt erhol dich gut und schl'}];
  return{ok:true,status:200,json:async()=>({model:b.model,stop_reason:mode==='cut'?'max_tokens':'end_turn',content})};};}});
const w=dom.window,d=w.document;const A=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)errs.push(m)};
setTimeout(async()=>{
 await w.fetchCoach(true);const t1=d.getElementById('c-text').textContent;
 A(t1==='Gute Arbeit heute.','empty → fallback model: '+t1+' '+calls.join(' '));
 A(w.localStorage.getItem('coach_model_fallback')==='1','fallback remembered');
 A(calls.some(c=>/:900$/.test(c)),'coach uses 900 tokens');
 mode='prose';await w.fetchCoach(true);A(d.getElementById('c-text').textContent==='Gute Arbeit heute, morgen ist Ruhetag.','prose shown');
 mode='cut';await w.fetchCoach(true);A(/^Stark trainiert/.test(d.getElementById('c-text').textContent),'truncated rescued: '+d.getElementById('c-text').textContent);
 w.showLastAI();A(/max_tokens/.test(d.getElementById('last-ai').textContent),'diagnostics shown');
 w.resetModel();A(w.eval('MODEL')==='claude-sonnet-5-5','reset model');
 console.log(errs.length?'ERR '+errs.join('|'):'NO ERRORS');process.exit(0);},500);
