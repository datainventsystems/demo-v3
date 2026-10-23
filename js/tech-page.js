/* ============================================================================
   DataInvent - TECHNOLOGY PAGES (js/tech-page.js)
   Shared by the technology pages that follow the Business Central design. It does four things:
   1) capability tabs: clicking a tab shows its panel
   2) the package popup: opens from the "Get the package details" button, closes with the X, the backdrop, Esc or the
      thank-you "Close" button, locks page scroll while open and returns focus to the button
      (the form inside the popup is handled by js/bc-package-form.js)
   3) FAQ: opening one question closes the others
   4) success stories: the same rotating featured story + "UP NEXT" queue as the homepage (6 s, pauses on hover,
      respects reduced motion). The featured card has the id diStoryFeature, so js/main.js does not also drive it.
   ============================================================================ */
(function(){
  'use strict';

  /* ---------- 1) capability tabs ---------- */
  [].slice.call(document.querySelectorAll('section#capabilities')).forEach(function(root){
    if(root.getAttribute('data-bound')) return;
    root.setAttribute('data-bound','1');
    var tabs=[].slice.call(root.querySelectorAll('.bc-tab'));
    var panels=[].slice.call(root.querySelectorAll('.bc-cap'));
    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        tabs.forEach(function(t){ t.classList.remove('active'); });
        panels.forEach(function(p){ p.classList.remove('active'); });
        tab.classList.add('active');
        var panel=root.querySelector('#'+tab.getAttribute('data-id'));
        if(panel){ panel.classList.add('active'); }
      });
    });
  });

  /* ---------- 2) package popup ---------- */
  var modal=document.getElementById('packageInquiryModal');
  var opener=document.getElementById('openPackageInquiry');
  if(modal && opener && !modal.getAttribute('data-bound')){
    modal.setAttribute('data-bound','1');
    var dialog=modal.querySelector('.bc-package-dialog');
    var show=function(){
      modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
      var first=modal.querySelector('input'); var target=first||dialog;
      if(target){ try{ target.focus(); }catch(e){} }
    };
    var hide=function(){
      modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow='';
      try{ opener.focus(); }catch(e){}
    };
    opener.addEventListener('click', show);
    [].slice.call(modal.querySelectorAll('[data-close-package]')).forEach(function(b){ b.addEventListener('click', hide); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && modal.classList.contains('open')){ hide(); } });
  }

  /* ---------- 3) FAQ: one open at a time ---------- */
  var faq=[].slice.call(document.querySelectorAll('.bc-careers-faq details.faq-item'));
  faq.forEach(function(item){
    item.addEventListener('toggle', function(){
      if(!item.open) return;
      faq.forEach(function(other){ if(other!==item){ other.open=false; } });
    });
  });

  /* ---------- 4) success stories ---------- */
  var feat=document.getElementById('diStoryFeature');
  if(!feat || feat.getAttribute('data-bound')) return;
  feat.setAttribute('data-bound','1');
  var STORIES=[
  {
    "tag": "FINANCIAL SERVICES",
    "title": "BAO transformed financial close with Business Central",
    "quote": "DataInvent didn’t just implement Business Central — they helped us rethink how finance actually operates.",
    "who": "— CFO, BAO Group",
    "metrics": [
      [
        "-45%",
        "Close time"
      ],
      [
        "+38%",
        "Efficiency"
      ],
      [
        "$2.1M",
        "Saved"
      ]
    ]
  },
  {
    "tag": "PUBLIC SECTOR",
    "title": "PSRT modernised citizen services securely on Azure",
    "quote": "A secure, scalable foundation that finally let us move fast without compromising compliance.",
    "who": "— CIO, PSRT",
    "metrics": [
      [
        "100%",
        "Cloud native"
      ],
      [
        "−40%",
        "Incidents"
      ],
      [
        "3x",
        "Faster deploys"
      ]
    ]
  },
  {
    "tag": "PROFESSIONAL SERVICES",
    "title": "McCann automated workflows across operations",
    "quote": "The manual work that drained our teams simply disappeared — people now focus on clients, not admin.",
    "who": "— COO, McCann",
    "metrics": [
      [
        "+52%",
        "Throughput"
      ],
      [
        "−30%",
        "Manual work"
      ],
      [
        "12 wks",
        "To value"
      ]
    ]
  },
  {
    "tag": "MANUFACTURING",
    "title": "Meritech built a scalable Microsoft ecosystem",
    "quote": "One connected platform from shop floor to boardroom — we finally see the whole operation.",
    "who": "— VP Operations, Meritech",
    "metrics": [
      [
        "+41%",
        "Visibility"
      ],
      [
        "−22%",
        "Downtime"
      ],
      [
        "$1.4M",
        "Saved"
      ]
    ]
  },
  {
    "tag": "CONSTRUCTION",
    "title": "Ashford connected the field, office and finance",
    "quote": "Project profitability is no longer a guess — it’s live, accurate, and trusted.",
    "who": "— Finance Director, Ashford",
    "metrics": [
      [
        "+29%",
        "Margin clarity"
      ],
      [
        "−35%",
        "Reporting lag"
      ],
      [
        "5 wks",
        "Close cut"
      ]
    ]
  },
  {
    "tag": "FINANCIAL SERVICES",
    "title": "Bellmont Capital unified reporting on Fabric",
    "quote": "Drill from top-line P&L to a single transaction in seconds. That changed how the board decides.",
    "who": "— CFO, Bellmont Capital",
    "metrics": [
      [
        "94%",
        "Forecast acc."
      ],
      [
        "−48%",
        "Report time"
      ],
      [
        "1",
        "Source of truth"
      ]
    ]
  },
  {
    "tag": "PROFESSIONAL SERVICES",
    "title": "Vantage lifted billability with Copilot",
    "quote": "Governed AI adoption that our people actually trust — and the ROI showed up in one quarter.",
    "who": "— Managing Partner, Vantage",
    "metrics": [
      [
        "+18%",
        "Billability"
      ],
      [
        "+2.3x",
        "AI adoption"
      ],
      [
        "8 wks",
        "Payback"
      ]
    ]
  },
  {
    "tag": "PUBLIC SECTOR",
    "title": "Crown Housing modernised its legacy ERP",
    "quote": "The system that held us back for a decade became the platform that now powers our growth.",
    "who": "— IT Director, Crown Housing",
    "metrics": [
      [
        "100%",
        "Migrated"
      ],
      [
        "−44%",
        "Tech debt"
      ],
      [
        "14 wks",
        "Go-live"
      ]
    ]
  }
];
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  var IDX=0, timer=null, DUR=6000;
  var elTag=document.getElementById('sfTag'), elTitle=document.getElementById('sfTitle'), elQuote=document.getElementById('sfQuote'),
      elMetrics=document.getElementById('sfMetrics'), elDots=document.getElementById('storyDots'), elQueue=document.getElementById('storyQueue');

  function renderFeature(i, animate){
    var s=STORIES[i];
    function apply(){
      elTag.textContent='FEATURED \u2014 '+s.tag;
      elTitle.textContent=s.title;
      elQuote.innerHTML='\u201C'+esc(s.quote)+'\u201D<span class="who">'+esc(s.who)+'</span>';
      elMetrics.innerHTML=s.metrics.map(function(m){ return '<div class="m"><div class="v">'+esc(m[0])+'</div><div class="k">'+esc(m[1])+'</div></div>'; }).join('');
    }
    if(animate){
      feat.classList.add('swapping');
      setTimeout(function(){ apply(); feat.classList.remove('swapping'); }, 320);
    } else { apply(); }
  }
  function renderQueue(){
    var html='';
    for(var k=1;k<=3;k++){
      var j=(IDX+k)%STORIES.length, s=STORIES[j];
      html+='<div class="q-card" data-i="'+j+'"><div class="q-badge">0'+((j%9)+1)+'</div><div><div class="q-tag">'+esc(s.tag)+'</div><h4>'+esc(s.title)+'</h4><div class="q-metric">'+esc(s.metrics[0][0])+' '+esc(s.metrics[0][1])+' \u00B7 '+esc(s.metrics[1][0])+' '+esc(s.metrics[1][1])+'</div></div></div>';
    }
    elQueue.innerHTML=html;
    [].slice.call(elQueue.querySelectorAll('.q-card')).forEach(function(c){
      c.addEventListener('click', function(){ go(parseInt(c.getAttribute('data-i'),10), true); });
    });
  }
  function renderDots(){
    var html='';
    for(var i=0;i<STORIES.length;i++){
      html+='<button data-i="'+i+'" class="'+(i===IDX?'active':'')+'" aria-label="Story '+(i+1)+'"></button>';
    }
    elDots.innerHTML=html;
    [].slice.call(elDots.querySelectorAll('button')).forEach(function(b){
      if(b.classList.contains('active')){ b.style.setProperty('--dur',(DUR/1000)+'s'); }
      b.addEventListener('click', function(){ go(parseInt(b.getAttribute('data-i'),10), true); });
    });
  }
  function go(i, restart){
    IDX=((i%STORIES.length)+STORIES.length)%STORIES.length;
    renderFeature(IDX,true); renderQueue(); renderDots();
    if(restart){ start(); }
  }
  function next(){ go(IDX+1,false); start(); }
  function start(){
    stop();
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){ timer=setTimeout(next, DUR); }
  }
  function stop(){ if(timer){ clearTimeout(timer); timer=null; } }
  renderFeature(0,false); renderQueue(); renderDots(); start();
  var stage=feat.closest('.story-stage');
  if(stage){ stage.addEventListener('mouseenter', stop); stage.addEventListener('mouseleave', start); }
})();
