/* ============================================================================
   DataInvent - SOLUTION PAGES (js/solution.js)
   Used by every solution page. Two behaviours:
   1) the local nav ("Value / Capabilities / ...") highlights the section being read
   2) only one FAQ question stays open at a time
   Tab switching (selTech / selShift) and the success-story rotator live in js/main.js.
   ============================================================================ */
(function(){
  'use strict';
  var faq=[].slice.call(document.querySelectorAll('.solution-faq details.faq-item'));
  faq.forEach(function(item){
    item.addEventListener('toggle',function(){
      if(!item.open) return;
      faq.forEach(function(other){ if(other!==item) other.open=false; });
    });
  });
  var nav=document.querySelector('.solution-local-nav');
  var links=[].slice.call(document.querySelectorAll('.solution-local-links a'));
  var sections=links.map(function(link){
    return { link:link, node:document.querySelector(link.getAttribute('href')) };
  }).filter(function(x){ return x.node; });
  if(!sections.length) return;
  function spy(){
    var navH=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),10)||74;
    var probe=navH+(nav?nav.offsetHeight:0)+24, current=null;
    sections.forEach(function(item){
      var r=item.node.getBoundingClientRect();
      if(r.top<=probe && r.bottom>probe) current=item;
    });
    if(!current){
      for(var i=sections.length-1;i>=0;i--){
        if(sections[i].node.getBoundingClientRect().top<=probe){ current=sections[i]; break; }
      }
    }
    links.forEach(function(link){ link.classList.remove('active'); link.removeAttribute('aria-current'); });
    if(current){ current.link.classList.add('active'); current.link.setAttribute('aria-current','true'); }
  }
  window.addEventListener('scroll',spy,{passive:true});
  window.addEventListener('resize',spy);
  spy();
})();
