const __APP=require('path').resolve(__dirname,'..','index.html');const __URL='file://'+__APP;const __TMP=require('os').tmpdir();
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.addInitScript(()=>{localStorage.setItem('coach_tour_done','1');localStorage.setItem('coach_tips_off','1');localStorage.setItem('coach_api_key','k');window.fetch=async()=>({ok:true,status:200,json:async()=>({content:[{type:'text',text:'{"p":["glutes"],"s":["hams"],"st":["a","b","c"],"c":["x","y"],"m":["f1","f2"],"b":"atmen","e":"leichter","h":"schwerer"}'}]})});});
await p.goto(__URL);await p.waitForTimeout(500);
await p.evaluate(()=>openInfoModal({name:'Meine Spezialübung',muscles:['glutes'],details:'x'}));await p.waitForTimeout(500);
const r=await p.evaluate(()=>({steps:document.querySelectorAll('#mi-body .mi-steps li').length,cached:!!_exInfoCache()['Meine Spezialübung']}));
console.log(r.steps===3&&r.cached?'PASS enrich':'FAIL enrich '+JSON.stringify(r));await b.close();})();
