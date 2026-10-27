const {chromium}=require('@playwright/test');
const fs=require('node:fs');
// Run from the repository root: node scripts/studio-matchday-audit.cjs
(async()=>{
 const {createServer}=await import('vite');const server=await createServer({configFile:require('node:path').resolve('src/test/post-editor-preview/vite.config.ts')});await server.listen();
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:1000}}); await page.goto('http://127.0.0.1:4176/?visual-audit=1');await page.waitForFunction(()=>!!window.renderCricketAudit);
  const errors=[];let cases=0;
  for(const style of ['stadium','editorial','classic']) for(const format of ['portrait','square','story','landscape']) for(const language of ['en','ne']) for(const stress of [false,true]){
   const overrides=stress?{headline:language==='ne'?'आजको खेलको विशेष पूर्वावलोकन':'THE BIG MATCH / A SEASON DEFINING CLASH',summary:language==='ne'?'आजको खेलका लागि दुवै टोली तयार छन्। आधिकारिक खेल तालिका हेर्नुहोस्।':'Two teams meet in the next league fixture. Follow the official match updates for confirmed team news.'}:{};
   const config={template:'matchday',style,format,language,overrides};await page.evaluate(v=>window.renderCricketAudit(v),config);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});await page.waitForTimeout(80);
   const check=await page.evaluate(()=>{const root=document.querySelector('[data-testid="post-artwork"]'); const r=root.getBoundingClientRect();const slots=[...root.querySelectorAll('[data-matchday-slot]')]; return {fit:window.checkCricketArtwork(), outside:slots.filter(n=>{const b=n.getBoundingClientRect();return b.left<r.left-1||b.right>r.right+1||b.top<r.top-1||b.bottom>r.bottom+1}).map(n=>n.textContent),ready:root.querySelectorAll('[data-text-ready="false"]').length};});
   if(check.fit.some(x=>x.issues.length)||check.outside.length||check.ready)errors.push({style,format,language,stress,...check});cases++;
   if(!stress&&style!=='classic')await page.getByTestId('post-artwork').screenshot({path:`.next/matchday-${style}-${format}-${language}.png`});
  }
  const teams=['biratnagar','chitwan','janakpur','karnali','kathmandu','lumbini','pokhara','sudurpaschim'];
  for(const teamId of teams)for(const opponentId of teams.filter(t=>t!==teamId))for(const format of ['portrait','square','story','landscape'])for(const language of ['en','ne']){
   await page.evaluate(v=>window.renderCricketAudit(v),{template:'matchday',style:'stadium',format,language,teamId,opponentId,overrides:{summary:'A'.repeat(120),author:'Editorial desk '.repeat(7)},cricket:{competition:'Competition '.repeat(5),venue:'International cricket stadium, '.repeat(4),matchLabel:'Match preview '.repeat(4),logoScale:300}});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});await page.waitForTimeout(20);
   const check=await page.evaluate(()=>({fit:window.checkCricketArtwork(),collisions:(()=>{const slots=[...document.querySelectorAll('[data-matchday-slot]')];const result=[];for(let a=0;a<slots.length;a++)for(let b=a+1;b<slots.length;b++){const x=slots[a].getBoundingClientRect(),y=slots[b].getBoundingClientRect();if(x.width&&y.width&&x.height&&y.height&&x.left<y.right-1&&x.right>y.left+1&&x.top<y.bottom-1&&x.bottom>y.top+1)result.push([slots[a].textContent,slots[b].textContent]);}return result;})()}));
   if(check.fit.some(x=>x.issues.length)||check.collisions.length)errors.push({teamId,opponentId,format,language,...check});cases++;
  }
  for(const style of ['stadium','editorial']){
   await page.evaluate(v=>window.renderCricketAudit(v),{template:'matchday',style,format:'portrait',language:'en',overrides:{placedImages:[{id:'cover',uri:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="white"/%3E%3C/svg%3E',x:0,y:0,width:360,height:450,scale:1,layer:'front'}]}});
   const protectedStack=await page.evaluate(()=>{const root=document.querySelector('[data-testid="post-artwork"]');const content=root.querySelector('[data-testid="artwork-headline"]').parentElement.parentElement;const overlay=root.querySelector('img[src^="data:"]').parentElement.parentElement.parentElement;return Number(getComputedStyle(content).zIndex)>Number(getComputedStyle(overlay).zIndex);});
   if(!protectedStack)throw Error('An overlay can cover the managed content');
  }
  fs.writeFileSync('.next/matchday-audit.json',JSON.stringify(errors,null,2));console.log(JSON.stringify({cases,failures:errors.length,examples:errors.slice(0,8)}));if(errors.length)process.exitCode=1;
  for(const language of ['en','ne'])for(const format of ['portrait','square','story','landscape']){
   await page.evaluate(v=>window.renderCricketAudit(v),{template:'matchday',style:'stadium',format,language});await page.waitForTimeout(100);
   try{const bytes=await page.evaluate(()=>window.exportCricketAudit());const buffer=Buffer.from(bytes);fs.writeFileSync(`.next/matchday-export-${format}-${language}.png`,buffer);const meta=await require('sharp')(buffer).metadata();const expected={portrait:[1080,1350],square:[1080,1080],story:[1080,1920],landscape:[1920,1080]}[format];if(meta.width!==expected[0]||meta.height!==expected[1])throw Error('Wrong dimensions');console.log('export '+format+' '+language+' '+bytes.length+' bytes');}catch(e){console.log('EXPORT FAILED '+format+' '+e.message);process.exitCode=1;}
  }
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
