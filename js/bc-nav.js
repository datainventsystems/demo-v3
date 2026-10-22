/* ============================================================================
   DataInvent - TECHNOLOGY PAGES - section nav highlight (js/bc-nav.js)
   Highlights the .bc-jump-links link whose section is being read, the same way the solution pages do
   (js/solution.js). Works on every technology page: it reads the links' own #anchors, so a page that has
   fewer sections simply has fewer links to highlight.
   ============================================================================ */
(function(){
  'use strict';
  var nav=document.querySelector('.bc-product-nav');
  var links=[].slice.call(document.querySelectorAll('.bc-jump-links a'));
  if(!nav || !links.length) return;

  var sections=links.map(function(link){
    var h=link.getAttribute('href')||'';
    return { link:link, node: (h.charAt(0)==='#' && h.length>1) ? document.getElementById(h.slice(1)) : null };
  }).filter(function(x){ return x.node; });
  if(!sections.length) return;

  function headerH(){
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),10)||74;
  }

  function spy(){
    var probe=headerH()+nav.offsetHeight+24, current=null;
    sections.forEach(function(item){
      var r=item.node.getBoundingClientRect();
      if(r.top<=probe && r.bottom>probe) current=item;
    });
    if(!current){
      for(var i=sections.length-1;i>=0;i--){
        if(sections[i].node.getBoundingClientRect().top<=probe){ current=sections[i]; break; }
      }
    }
    links.forEach(function(l){ l.classList.remove('active'); l.removeAttribute('aria-current'); });
    if(current){ current.link.classList.add('active'); current.link.setAttribute('aria-current','true'); }
  }

  window.addEventListener('scroll', spy, {passive:true});
  window.addEventListener('resize', spy);
  window.addEventListener('load', spy);
  spy();
})();
