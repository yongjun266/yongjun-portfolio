const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Target Cursor: progressively enhanced for precise mouse pointers only.
// Native cursors remain available on touch devices, with reduced motion or if JS fails.
const cursorRoot=document.querySelector<HTMLElement>('.target-cursor');
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
if(cursorRoot&&finePointer.matches&&!reduceMotion.matches){
  const dot=cursorRoot.querySelector<HTMLElement>('.target-cursor-dot')!;
  const frame=cursorRoot.querySelector<HTMLElement>('.target-cursor-frame')!;
  const label=frame.querySelector<HTMLElement>('b')!;
  const targetSelector='a, button, summary, [data-video], [data-zoom]';
  let pointerX=innerWidth/2,pointerY=innerHeight/2;
  let frameX=pointerX-15,frameY=pointerY-15,frameW=30,frameH=30;
  let activeTarget:HTMLElement|null=null,visible=false,animationId=0;
  const targetLabel=(target:HTMLElement|null)=>{
    if(!target)return '';
    if(target.matches('[data-video],.video-cover,.video-expand'))return 'PLAY';
    if(target.matches('[data-zoom],.zoom-link'))return 'VIEW';
    return '';
  };
  const render=()=>{
    let nextX=pointerX-15,nextY=pointerY-15,nextW=30,nextH=30;
    if(activeTarget&&activeTarget.isConnected){
      const r=activeTarget.getBoundingClientRect();
      if(r.width>0&&r.height>0){nextX=r.left-5;nextY=r.top-5;nextW=r.width+10;nextH=r.height+10;}
    }
    const ease=activeTarget?.isConnected?.22:.3;
    frameX+=(nextX-frameX)*ease;frameY+=(nextY-frameY)*ease;
    frameW+=(nextW-frameW)*ease;frameH+=(nextH-frameH)*ease;
    dot.style.transform=`translate3d(${pointerX-3}px,${pointerY-3}px,0)`;
    frame.style.transform=`translate3d(${frameX}px,${frameY}px,0)`;
    frame.style.width=`${frameW}px`;frame.style.height=`${frameH}px`;
    cursorRoot.classList.toggle('is-targeting',Boolean(activeTarget?.isConnected));
    animationId=requestAnimationFrame(render);
  };
  document.documentElement.classList.add('target-cursor-ready');
  window.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse')return;
    pointerX=event.clientX;pointerY=event.clientY;
    const node=event.target instanceof Element?event.target.closest<HTMLElement>(targetSelector):null;
    activeTarget=node&&!node.closest('video')?node:null;
    const text=targetLabel(activeTarget);label.textContent=text;
    cursorRoot.classList.toggle('has-label',Boolean(text));
    if(!visible){visible=true;cursorRoot.classList.add('is-visible');}
  },{passive:true});
  document.addEventListener('mouseleave',()=>cursorRoot.classList.remove('is-visible'));
  document.addEventListener('mouseenter',()=>{if(visible)cursorRoot.classList.add('is-visible');});
  window.addEventListener('blur',()=>cursorRoot.classList.remove('is-visible'));
  render();
  window.addEventListener('pagehide',()=>cancelAnimationFrame(animationId),{once:true});
}

const videoModal=document.querySelector<HTMLDialogElement>('.video-modal');
if(videoModal){
  const player=videoModal.querySelector<HTMLVideoElement>('video')!;
  const error=videoModal.querySelector<HTMLElement>('.modal-video-error')!;
  let trigger:HTMLElement|null=null;
  document.querySelectorAll<HTMLAnchorElement>('[data-video]').forEach(link=>link.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();trigger=link;
    document.querySelectorAll<HTMLVideoElement>('video').forEach(v=>v.pause());
    error.hidden=true;player.hidden=false;
    videoModal.querySelector<HTMLElement>('[data-video-title]')!.textContent=link.dataset.title||'视频作品';
    videoModal.querySelector<HTMLAnchorElement>('[data-video-fallback]')!.href=link.href;
    player.poster=link.dataset.poster||'';player.src=link.href;player.setAttribute('aria-label',link.dataset.title||'视频作品');
    videoModal.showModal();
    player.play().catch(()=>{if(player.error)error.hidden=false;});
  }));
  player.addEventListener('error',()=>{if(player.getAttribute('src'))error.hidden=false;});
  videoModal.querySelector('[data-video-close]')?.addEventListener('click',()=>videoModal.close());
  videoModal.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();trigger?.focus({preventScroll:true});});
}

// Every image remains a normal link when scripts are unavailable.
const lightbox = document.querySelector<HTMLDialogElement>('.lightbox');
let lightboxTrigger: HTMLElement | null = null;
if (lightbox) {
  const image = lightbox.querySelector<HTMLImageElement>('img')!;
  const caption = lightbox.querySelector<HTMLElement>('.lightbox-caption')!;
  document.querySelectorAll<HTMLAnchorElement>('[data-zoom]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); lightboxTrigger = link;
    image.src = link.href;
    image.alt = link.querySelector('img')?.alt || link.dataset.caption || '作品大图';
    caption.textContent = link.dataset.caption || '';
    lightbox.showModal();
    lightbox.querySelector('.lightbox-body')!.scrollTop = 0;
  }));
  lightbox.querySelector('[data-close]')?.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', e => { if (e.target === lightbox) { const r=lightbox.getBoundingClientRect(); if (e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) lightbox.close(); } });
  lightbox.addEventListener('close', () => lightboxTrigger?.focus({preventScroll:true}));
}

let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) { const target=document.querySelector<HTMLElement>('.toast'); if(!target)return; target.textContent=message; target.classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>target.classList.remove('visible'),3200); }
document.querySelectorAll<HTMLElement>('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
  const value=button.dataset.copy!;
  try { await navigator.clipboard.writeText(value); toast('已复制到剪贴板'); }
  catch { toast(`复制未成功，请手动复制：${value}`); }
}));

document.querySelectorAll<HTMLVideoElement>('video').forEach(video=>{
  if(video.closest('.video-modal'))return;
  video.addEventListener('play',()=>document.querySelectorAll<HTMLVideoElement>('video').forEach(other=>{if(other!==video)other.pause();}));
  const showError=()=>{ const message=video.parentElement?.querySelector<HTMLElement>('.video-error'); if(message)message.hidden=false; video.hidden=true; };
  video.addEventListener('error',showError); video.querySelectorAll('source').forEach(s=>s.addEventListener('error',showError));
});

const art=document.querySelector<HTMLElement>('[data-parallax]');
if(art){
  const cards=art.querySelectorAll<HTMLElement>('[data-depth]');
  art.addEventListener('pointermove',event=>{if(reduceMotion.matches||event.pointerType!=='mouse'||window.innerWidth<850)return; const r=art.getBoundingClientRect(); const x=(event.clientX-r.left)/r.width-.5;const y=(event.clientY-r.top)/r.height-.5;cards.forEach(card=>{const d=Number(card.dataset.depth);card.style.translate=`${x*d*14}px ${y*d*12}px`;});});
  art.addEventListener('pointerleave',()=>cards.forEach(c=>c.style.translate='0px 0px'));
}

const strip=document.querySelector<HTMLElement>('[data-filmstrip]');
if(strip){
  const frames=Array.from(strip.querySelectorAll<HTMLElement>('.film-frame'));
  const prev=document.querySelector<HTMLButtonElement>('[data-film-prev]');
  const next=document.querySelector<HTMLButtonElement>('[data-film-next]');
  const count=document.querySelector<HTMLElement>('[data-film-count]');
  let current=0;
  const update=()=>{const width=frames[0]?.getBoundingClientRect().width||1;current=Math.min(frames.length-1,Math.max(0,Math.round(strip.scrollLeft/(width+10))));if(count)count.textContent=`${String(current+1).padStart(2,'0')} / ${String(frames.length).padStart(2,'0')}`;if(prev)prev.disabled=strip.scrollLeft<3;if(next)next.disabled=strip.scrollLeft>=strip.scrollWidth-strip.clientWidth-3;};
  const move=(dir:number)=>strip.scrollBy({left:dir*((frames[0]?.getBoundingClientRect().width||160)+10),behavior:reduceMotion.matches?'instant':'smooth'});
  prev?.addEventListener('click',()=>move(-1));next?.addEventListener('click',()=>move(1));
  strip.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
  strip.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
  let startX=0,startScroll=0,down=false,dragged=false;
  strip.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;down=true;dragged=false;startX=e.clientX;startScroll=strip.scrollLeft;});
  window.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-startX;if(Math.abs(dx)>6){dragged=true;strip.classList.add('dragging');strip.scrollLeft=startScroll-dx;}});
  window.addEventListener('pointerup',()=>{down=false;strip.classList.remove('dragging');});
  window.addEventListener('pointercancel',()=>{down=false;strip.classList.remove('dragging');});
  strip.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopPropagation();dragged=false;}},true);
  strip.addEventListener('dragstart',e=>e.preventDefault());
}

const stage=document.querySelector<HTMLElement>('[data-process]');
if(stage){
  const steps=Array.from(stage.querySelectorAll<HTMLElement>('[data-stage-step]'));
  const frames=stage.querySelectorAll<HTMLElement>('[data-stage-frame]');
  const tabs=stage.querySelectorAll<HTMLButtonElement>('[data-stage-tab]');
  let manualUntil=0;
  const select=(i:number)=>{frames.forEach((f,n)=>{f.classList.toggle('is-active',n===i);f.setAttribute('aria-hidden',String(n!==i));});tabs.forEach((t,n)=>t.setAttribute('aria-pressed',String(n===i)));};
  tabs.forEach((tab,i)=>tab.addEventListener('click',()=>{manualUntil=Date.now()+1000;select(i);steps[i]?.scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'center'});}));
  let ticking=false;
  const onScroll=()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;if(reduceMotion.matches||window.innerWidth<=650||Date.now()<manualUntil)return;const target=window.innerHeight*.45;let closest=0,distance=Infinity;steps.forEach((step,i)=>{const r=step.getBoundingClientRect();const d=Math.abs(r.top+r.height/2-target);if(d<distance){distance=d;closest=i;}});select(closest);});};
  window.addEventListener('scroll',onScroll,{passive:true});
}

function watchSections(sectionSelector:string,linkAttribute:string){
  const sections=Array.from(document.querySelectorAll<HTMLElement>(sectionSelector));
  if(!sections.length)return;
  const update=()=>{let id='';for(const section of sections){if(section.getBoundingClientRect().top<window.innerHeight*.4)id=section.id;}document.querySelectorAll<HTMLAnchorElement>(`[${linkAttribute}]`).forEach(link=>{const active=link.getAttribute(linkAttribute)===id;link.classList.toggle('is-active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});};
  const observer=new IntersectionObserver(update,{rootMargin:'-10% 0px -45% 0px',threshold:[0,.2,.5,1]});sections.forEach(s=>observer.observe(s));window.addEventListener('scroll',update,{passive:true});update();
}
watchSections('[data-section]','data-nav');watchSections('[data-case-section]','data-toc');
// Do not hide content in CSS: animation is only a progressive enhancement.
const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){if(!reduceMotion.matches)(e.target as HTMLElement).classList.add('reveal-animate');reveal.unobserve(e.target);}}),{threshold:.08});
document.querySelectorAll('.section-head,.case-card,.account-card,.workflow-grid,.about-copy').forEach(el=>reveal.observe(el));
