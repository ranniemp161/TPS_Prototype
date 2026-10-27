import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
import fs from 'fs';
const out='C:/Users/LenoVo/AppData/Local/Temp/claude/g--My-Drive-Agent/4ddfa9fe-eb68-4453-9d79-904df0f54822/scratchpad/nofive-home/';
fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({channel:'chrome'});
const errs=[];
for(const [w,h] of [[1440,900],[390,844]]){
  const ctx=await b.newContext({viewport:{width:w,height:h}});
  const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(w+' pageerror '+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(w+' console '+m.text())});
  await p.goto(pathToFileURL(process.cwd()+'/index/index.html').href);
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);
  await p.mouse.move(w/2,h/2);
  for(let i=0;i<400;i++){
    const y=await p.evaluate(()=>{const g=document.querySelector('[data-gallery]').getBoundingClientRect();return g.top+g.height/2-innerHeight/2});
    if(Math.abs(y)<40)break;
    await p.mouse.wheel(0,Math.sign(y)*Math.min(300,Math.abs(y)));
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(1200);
  const state=async()=>p.evaluate(()=>({n:document.querySelectorAll('[data-gal-item]').length,t:document.querySelector('[data-gal-title]').textContent,idx:[...document.querySelectorAll('[data-gal-item]')].map(x=>x.dataset.index+(x.classList.contains('is-active')?'*':'')).join(','),img:document.querySelector('[data-gal-img]').getAttribute('src')}));
  console.log(w,'initial',JSON.stringify(await state()));
  await p.screenshot({path:out+`home-${w}-7.png`});
  const items=await p.$$('[data-gal-item]');
  for(const [i,n] of [[1,14],[2,30]]){
    await items[i].click(); await p.waitForTimeout(1500);
    console.log(w,n,JSON.stringify(await state()));
    await p.screenshot({path:out+`home-${w}-${n}.png`});
  }
  await p.goto(pathToFileURL(process.cwd()+'/index/programmes.html').href);
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);
  const el=await p.$('[data-section="programme-lengths"]');
  for(let i=0;i<30;i++){await p.mouse.wheel(0,250);await p.waitForTimeout(50)}
  await p.evaluate(()=>window.scrollTo(0,0));
  await p.waitForTimeout(300);
  for(let i=0;i<40;i++){
    const y=await p.evaluate(()=>document.querySelector('[data-section="programme-lengths"] .block__heading').getBoundingClientRect().top-200);
    if(Math.abs(y)<40)break; await p.mouse.wheel(0,Math.sign(y)*Math.min(250,Math.abs(y)));await p.waitForTimeout(60);
  }
  await p.waitForTimeout(800);
  await p.screenshot({path:out+`prog-${w}.png`});
  await ctx.close();
}
console.log('ERRORS',JSON.stringify(errs));
await b.close();
