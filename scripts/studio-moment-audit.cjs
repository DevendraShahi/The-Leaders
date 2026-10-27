const {chromium}=require('@playwright/test');
const fs=require('node:fs');
(async()=>{
 const {createServer}=await import('vite');
 const server=await createServer({configFile:require('node:path').resolve('src/test/post-editor-preview/vite.config.ts')});await server.listen();
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:1000}});
  await page.goto('http://127.0.0.1:4176/?visual-audit=1');await page.waitForFunction(()=>!!window.renderCricketAudit);
  let cases=0,exports=0;const failures=[];
  for(const template of ['four','six','wicket'])for(const style of ['stadium','editorial'])for(const format of ['portrait','square','story','landscape'])for(const language of ['en','ne'])for(const photo of [false,true]){
   const wicket=template==='wicket';
   const cricket={matchDate:'2026-10-26',runs:128,wickets:3,overs:'14.2',sourceUrl:'https://example.com/scorecard',wicketType:wicket?'caught':null,dismissal:wicket?'c Illustrative fielder b Dipendra Singh Airee':'',batter:{name:photo?'Rohit Paudel':'Illustrative batter full name',runs:null,balls:null,fours:null,sixes:null,notOut:false},bowler:{name:wicket?'Dipendra Singh Airee':'',overs:'',maidens:null,runs:null,wickets:null}};
   const catalog=require('../public/studio/cricket/players/catalog.json');const player=catalog.players.find(p=>p.name===(wicket?'Dipendra Singh Airee':'Rohit Paudel'));
   const credit=photo?`Photo: ${player.name} — ${player.photo.credit}. ${player.photo.license}. Resized for Studio.\n${player.photo.sourceUrl}${player.photo.licenseUrl?'\n'+player.photo.licenseUrl:''}`:'';
   const overrides={imageUri:photo?player.photo.url:null,imageCredit:credit,playerPhotoId:photo?player.id:undefined,imageFit:'contain',summary:language==='ne'?'घटनापछिको स्कोर · नमुना तथ्याङ्क':'Illustrative event data for template review.'};
   await page.evaluate(v=>window.renderCricketAudit(v),{template,style,format,language,cricket,overrides});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});await page.waitForTimeout(40);
   const result=await page.evaluate(()=>({fit:window.checkCricketArtwork(),error:document.querySelector('[data-testid="post-artwork"]').dataset.exportError}));
   if(result.error||result.fit.some(r=>r.issues.length))failures.push({template,style,format,language,photo,...result});cases++;
   if(photo&&style==='stadium'){
    await page.getByTestId('post-artwork').screenshot({path:`.next/moment-${template}-${format}-${language}.png`});
    if(!process.env.STUDIO_SKIP_EXPORTS)try{const bytes=Buffer.from(await page.evaluate(()=>window.exportCricketAudit()));const meta=await require('sharp')(bytes).metadata();const expected={portrait:[1080,1350],square:[1080,1080],story:[1080,1920],landscape:[1920,1080]}[format];if(meta.width!==expected[0]||meta.height!==expected[1])throw Error('Wrong dimensions');fs.writeFileSync(`.next/moment-export-${template}-${format}-${language}.png`,bytes);exports++;}catch(e){failures.push({template,format,language,exportError:e.message});}
   }
  }
  fs.writeFileSync('.next/moment-audit.json',JSON.stringify(failures,null,2));console.log(JSON.stringify({cases,exports,failures:failures.length,examples:failures.slice(0,8)}));if(failures.length)process.exitCode=1;
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
