/* ============================================================================
   DataInvent — SHARED BEHAVIOURS (js/main.js) — used on EVERY page
   ============================================================================ */
(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.logoFailed = function(){ var nb=document.getElementById('navBrand'); if(nb) nb.classList.add('logo-failed'); };

  var nav = document.getElementById('nav');
  var solidNav = nav && nav.classList.contains('nav--solid');
  function onScroll(){ if(nav && !solidNav){ nav.classList.toggle('scrolled', window.scrollY > 60); } }
  window.addEventListener('scroll', onScroll); onScroll();

  var items = document.querySelectorAll('.nav-item[data-menu]');
  function anyOpen(){ return Array.prototype.some.call(items, function(i){ return i.classList.contains('open'); }); }
  items.forEach(function(item){
    var t;
    item.addEventListener('mouseenter', function(){ clearTimeout(t); items.forEach(function(o){ if(o!==item) o.classList.remove('open'); }); item.classList.add('open'); if(nav) nav.classList.add('menu-open'); });
    item.addEventListener('mouseleave', function(){ t=setTimeout(function(){ item.classList.remove('open'); if(!anyOpen() && nav) nav.classList.remove('menu-open'); }, 130); });
    var link = item.querySelector('.nav-link');
    if(link){ link.addEventListener('click', function(e){ e.preventDefault(); var was=item.classList.contains('open'); items.forEach(function(o){ o.classList.remove('open'); }); if(!was){ item.classList.add('open'); if(nav) nav.classList.add('menu-open'); } else if(!anyOpen() && nav){ nav.classList.remove('menu-open'); } }); }
  });
  document.addEventListener('click', function(e){ if(!e.target.closest('.nav-item')){ items.forEach(function(o){ o.classList.remove('open'); }); if(nav && !anyOpen()) nav.classList.remove('menu-open'); } });

  var burger=document.getElementById('burger'), mobile=document.getElementById('mobile'), mClose=document.getElementById('mClose');
  if(burger && mobile){ burger.addEventListener('click', function(){ mobile.classList.add('open'); document.body.style.overflow='hidden'; }); }
  if(mClose && mobile){ mClose.addEventListener('click', function(){ mobile.classList.remove('open'); document.body.style.overflow=''; }); }
  document.querySelectorAll('.m-acc-head').forEach(function(h){ if(h.classList.contains('plain')) return; h.addEventListener('click', function(){ h.parentNode.classList.toggle('open'); }); });
  if(mobile){ mobile.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ mobile.classList.remove('open'); document.body.style.overflow=''; }); }); }

  var bar=document.getElementById('scrollProgress');
  function updBar(){ if(!bar) return; var h=document.documentElement, st=h.scrollTop||document.body.scrollTop, sh=h.scrollHeight-h.clientHeight; bar.style.width=(sh>0?(st/sh*100):0)+'%'; }
  window.addEventListener('scroll', updBar); updBar();

  var bt=document.getElementById('backTop');
  if(bt){ bt.addEventListener('click', function(e){ e.preventDefault(); window.scrollTo({ top:0, behavior: reduced?'auto':'smooth' }); }); }

  document.querySelectorAll('.faq-item .faq-q').forEach(function(q){
    q.addEventListener('click', function(){
      var item=q.parentNode; var isOpen=item.classList.contains('open');
      var list=item.closest('.faq-list');
      if(list){ list.querySelectorAll('.faq-item.open').forEach(function(o){ if(o!==item) o.classList.remove('open'); }); }
      item.classList.toggle('open', !isOpen);
    });
  });

  window.selTech = function(tech, el){
    document.querySelectorAll('.tech-tab').forEach(function(t){ t.classList.remove('active'); });
    if(el) el.classList.add('active');
    document.querySelectorAll('.tech-panel').forEach(function(p){ p.classList.remove('active'); });
    var panel=document.getElementById('p-'+tech); if(panel) panel.classList.add('active');
    var bg=document.getElementById('techBg'); if(bg){ bg.className='ts-bg show bg-'+tech; }
  };

  window.selShift = function(key, el){
    document.querySelectorAll('.shift-tab').forEach(function(t){ t.classList.remove('active'); });
    if(el) el.classList.add('active');
    document.querySelectorAll('.shift-panel').forEach(function(p){ p.classList.remove('active'); });
    var panel=document.getElementById('s-'+key); if(panel) panel.classList.add('active');
  };

  /* ---- Book-a-Demo form (client-side; routes to thank-you on submit) ---- */
  var demoForm = document.getElementById('demoForm');
  if(demoForm){
    demoForm.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = demoForm.querySelector('.demo-submit');
      if(btn){ btn.classList.add('is-loading'); btn.setAttribute('disabled','disabled'); }
      setTimeout(function(){ window.location.href = 'thank-you.html'; }, 600);
    });
  }

  var revealSel = '.reveal,.reveal-up,.reveal-scale,.reveal-left,.reveal-right';
  var revealEls = document.querySelectorAll(revealSel);
  if(reduced){ revealEls.forEach(function(el){ el.classList.add('in'); }); }
  else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold:0.12, rootMargin:'0px 0px -6% 0px' });
    revealEls.forEach(function(el){ if(!el.closest('[data-stagger]')) io.observe(el); });
    document.querySelectorAll('[data-stagger]').forEach(function(group){
      var kids=group.querySelectorAll(revealSel);
      var gio=new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ kids.forEach(function(x,i){ setTimeout(function(){ x.classList.add('in'); }, i*90); }); gio.unobserve(e.target); } }); }, { threshold:0.1 });
      gio.observe(group);
    });
  } else { revealEls.forEach(function(el){ el.classList.add('in'); }); }

  (function(){
    var feat=document.getElementById('storyFeature'); if(!feat) return;
    var STORIES = [
      { tag:'FINANCIAL SERVICES', title:'BAO transformed financial close with Business Central', quote:'DataInvent didn\u2019t just implement Business Central \u2014 they helped us rethink how finance actually operates.', who:'\u2014 CFO, BAO Group', metrics:[['-45%','Close time'],['+38%','Efficiency'],['\u00A32.1M','Saved']] },
      { tag:'PUBLIC SECTOR', title:'PSRT modernised citizen services securely on Azure', quote:'A secure, scalable foundation that finally let us move fast without compromising compliance.', who:'\u2014 CIO, PSRT', metrics:[['100%','Cloud native'],['\u221240%','Incidents'],['3x','Faster deploys']] },
      { tag:'PROFESSIONAL SERVICES', title:'McCann automated workflows across operations', quote:'The manual work that drained our teams simply disappeared \u2014 people now focus on clients, not admin.', who:'\u2014 COO, McCann', metrics:[['+52%','Throughput'],['\u221230%','Manual work'],['12 wks','To value']] },
      { tag:'MANUFACTURING', title:'Meritech built a scalable Microsoft ecosystem', quote:'One connected platform from shop floor to boardroom \u2014 we finally see the whole operation.', who:'\u2014 VP Operations, Meritech', metrics:[['+41%','Visibility'],['\u221222%','Downtime'],['\u00A31.4M','Saved']] },
      { tag:'CONSTRUCTION', title:'Ashford connected the field, office and finance', quote:'Project profitability is no longer a guess \u2014 it\u2019s live, accurate, and trusted.', who:'\u2014 Finance Director, Ashford', metrics:[['+29%','Margin clarity'],['\u221235%','Reporting lag'],['5 wks','Close cut']] },
      { tag:'FINANCIAL SERVICES', title:'Bellmont Capital unified reporting on Fabric', quote:'Drill from top-line P&L to a single transaction in seconds. That changed how the board decides.', who:'\u2014 CFO, Bellmont Capital', metrics:[['94%','Forecast acc.'],['\u221248%','Report time'],['1','Source of truth']] },
      { tag:'PROFESSIONAL SERVICES', title:'Vantage lifted billability with Copilot', quote:'Governed AI adoption that our people actually trust \u2014 and the ROI showed up in one quarter.', who:'\u2014 Managing Partner, Vantage', metrics:[['+18%','Billability'],['+2.3x','AI adoption'],['8 wks','Payback']] },
      { tag:'PUBLIC SECTOR', title:'Crown Housing modernised its legacy ERP', quote:'The system that held us back for a decade became the platform that now powers our growth.', who:'\u2014 IT Director, Crown Housing', metrics:[['100%','Migrated'],['\u221244%','Tech debt'],['14 wks','Go-live']] }
    ];
    var IDX=0, timer=null, DUR=6000;
    var elTag=document.getElementById('sfTag'), elTitle=document.getElementById('sfTitle'), elQuote=document.getElementById('sfQuote'), elMetrics=document.getElementById('sfMetrics'), elDots=document.getElementById('storyDots'), elQueue=document.getElementById('storyQueue');
    function renderFeature(i, animate){ var s=STORIES[i];
      function apply(){ elTag.textContent='FEATURED \u2014 '+s.tag; elTitle.textContent=s.title; elQuote.innerHTML='\u201C'+s.quote+'\u201D<span class="who">'+s.who+'</span>'; elMetrics.innerHTML=s.metrics.map(function(m){ return '<div class="m"><div class="v">'+m[0]+'</div><div class="k">'+m[1]+'</div></div>'; }).join(''); }
      if(animate){ feat.classList.add('swapping'); setTimeout(function(){ apply(); feat.classList.remove('swapping'); }, 320); } else { apply(); }
    }
    function renderQueue(){ if(!elQueue) return; var html=''; for(var k=1;k<=3;k++){ var j=(IDX+k)%STORIES.length, s=STORIES[j]; html+='<div class="q-card" data-i="'+j+'"><div class="q-badge">0'+((j%9)+1)+'</div><div><div class="q-tag">'+s.tag+'</div><h4>'+s.title+'</h4><div class="q-metric">'+s.metrics[0][0]+' '+s.metrics[0][1]+' \u00B7 '+s.metrics[1][0]+' '+s.metrics[1][1]+'</div></div></div>'; } elQueue.innerHTML=html; elQueue.querySelectorAll('.q-card').forEach(function(c){ c.addEventListener('click', function(){ go(parseInt(c.getAttribute('data-i'),10), true); }); }); }
    function renderDots(){ if(!elDots) return; var html=''; for(var i=0;i<STORIES.length;i++){ html+='<button data-i="'+i+'" class="'+(i===IDX?'active':'')+'" aria-label="Story '+(i+1)+'"></button>'; } elDots.innerHTML=html; elDots.querySelectorAll('button').forEach(function(b){ if(b.classList.contains('active')) b.style.setProperty('--dur',(DUR/1000)+'s'); b.addEventListener('click', function(){ go(parseInt(b.getAttribute('data-i'),10), true); }); }); }
    function go(i, restart){ IDX=((i%STORIES.length)+STORIES.length)%STORIES.length; renderFeature(IDX,true); renderQueue(); renderDots(); if(restart){ start(); } }
    function next(){ go(IDX+1,false); start(); }
    function start(){ stop(); if(!reduced){ timer=setTimeout(next, DUR); } }
    function stop(){ if(timer){ clearTimeout(timer); timer=null; } }
    renderFeature(0,false); renderQueue(); renderDots(); start();
    var stage=feat.closest('.story-stage'); if(stage){ stage.addEventListener('mouseenter', stop); stage.addEventListener('mouseleave', start); }
  })();

  var hasGSAP = (typeof window.gsap !== 'undefined');
  var fine = window.matchMedia('(pointer:fine)').matches;
  if(hasGSAP && fine && !reduced){
    document.querySelectorAll('.magnetic').forEach(function(btn){
      var s=0.35;
      btn.addEventListener('mousemove', function(e){ var r=btn.getBoundingClientRect(); var mx=e.clientX-(r.left+r.width/2), my=e.clientY-(r.top+r.height/2); gsap.to(btn,{ x:mx*s, y:my*s, duration:0.4, ease:'power3.out' }); });
      btn.addEventListener('mouseleave', function(){ gsap.to(btn,{ x:0, y:0, duration:0.5, ease:'elastic.out(1,0.4)' }); });
    });
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      var max=6;
      card.addEventListener('mousemove', function(e){ var r=card.getBoundingClientRect(); var px=(e.clientX-r.left)/r.width-0.5, py=(e.clientY-r.top)/r.height-0.5; gsap.to(card,{ rotationY:px*max, rotationX:-py*max, transformPerspective:900, transformOrigin:'center', duration:0.4, ease:'power2.out' }); });
      card.addEventListener('mouseenter', function(){ gsap.to(card,{ y:-6, duration:0.4, ease:'power2.out' }); });
      card.addEventListener('mouseleave', function(){ gsap.to(card,{ rotationY:0, rotationX:0, y:0, duration:0.6, ease:'power3.out' }); });
    });
    document.querySelectorAll('.glow-host').forEach(function(host){
      var glow=host.querySelector('[data-cursor-glow]'); if(!glow) return;
      host.addEventListener('mousemove', function(e){ var r=host.getBoundingClientRect(); gsap.to(glow,{ left:(e.clientX-r.left)+'px', top:(e.clientY-r.top)+'px', duration:0.5, ease:'power2.out' }); });
    });
  } else if(fine && !reduced){
    document.querySelectorAll('.glow-host').forEach(function(host){
      var glow=host.querySelector('[data-cursor-glow]'); if(!glow) return;
      host.addEventListener('mousemove', function(e){ var r=host.getBoundingClientRect(); glow.style.left=(e.clientX-r.left)+'px'; glow.style.top=(e.clientY-r.top)+'px'; });
    });
  }
})();
