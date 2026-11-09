// I-03 repro: reveal card has a plain escape line; Change Path hidden when credits < 500.
const path=require('path'),http=require('http'),fs=require('fs');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),SH=process.env.I03_SHOTS||path.join(__dirname,'out');
fs.mkdirSync(SH,{recursive:true});
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,q.url==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();}else{r.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':'application/octet-stream'});r.end(d);}});});
(async()=>{
  await new Promise(r=>srv.listen(0,r));const url='http://127.0.0.1:'+srv.address().port+'/';
  const b=await chromium.launch();let fail=0;
  const chk=(n,ok)=>{console.log((ok?'PASS ':'FAIL ')+n);if(!ok)fail=1;};
  for(const [w,h,tag] of [[1280,800,'desktop'],[375,812,'mobile']]){
    for(const cr of [0,500]){
      const pg=await b.newPage({viewport:{width:w,height:h}});
      await pg.route(u=>!u.href.startsWith(url),r=>r.abort());
      await pg.goto(url);await pg.waitForTimeout(800);await pg.evaluate(()=>{try{window._bootSkip();}catch(e){}});await pg.waitForTimeout(900);
      const res=await pg.evaluate(c=>{const p=loadProfile();p.credits=c;saveProfile(p);revealProf(PROFS[0]);
        const e=document.getElementById('rev-esc'),cp=document.getElementById('btn-change-prof');
        const vis=el=>!!el&&getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().height>0;
        return {esc:vis(e),cp:vis(cp)};},cr).catch(e=>({err:String(e)}));
      if(res.err){console.log('ERR',res.err);fail=1;}
      else{chk(`${tag} credits=${cr}: escape line visible`,res.esc);chk(`${tag} credits=${cr}: Change Path ${cr>=500?'present':'absent'}`,res.cp===(cr>=500));}
      await pg.waitForTimeout(400);await pg.screenshot({path:path.join(SH,`fixer-i03-${tag}-cr${cr}.png`)});await pg.close();
    }
  }
  await b.close();srv.close();process.exit(fail);
})();
