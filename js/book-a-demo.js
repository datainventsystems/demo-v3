/* ============================================================================
   DataInvent - BOOK A DEMO form (js/book-a-demo.js)
   1) pre-selects "Area of Interest" from the address (?interest=finance-erp ...)
   2) validates, then sends the answers to HubSpot's form API (no <form> tag on the page, so HubSpot does not record a second "non-HubSpot form")
   Settings live on the form element:  data-portal-id, data-region, data-form-id (empty = DEMO MODE: nothing is sent), data-thank-you (a page to go to
   after sending; empty = show the thank-you panel in the card).  Add  ?di_debug=1  to the address to see the reason on screen when HubSpot says no.
   ============================================================================ */
(function(){
  'use strict';
  var root=document.getElementById('demoForm');
  if(!root || root.getAttribute('data-bound')) return;
  root.setAttribute('data-bound','1');

  function attr(n){ return (root.getAttribute(n)||'').replace(/^\s+|\s+$/g,''); }
  var card=root.closest ? root.closest('.demo-card') : null;
  var thanks=document.getElementById('demoThanks');
  var btn=root.querySelector('.demo-submit');
  var formErr=root.querySelector('.form-err');
  var consent=root.querySelector('input[name="consent"]');
  var trap=root.querySelector('input[name="di_website"]');
  var portal=attr('data-portal-id'), formId=attr('data-form-id'), region=attr('data-region')||'na1', thankYou=attr('data-thank-you');
  var debug=/[?&]di_debug=1/.test(location.search);
  var api=(region && region!=='na1') ? 'https://api-'+region+'.hsforms.com' : 'https://api.hsforms.com';
  var endpoint=(portal && formId) ? api+'/submissions/v3/integration/submit/'+portal+'/'+formId : '';
  var sending=false;

  /* ---------- 1) Area of Interest from the address ---------- */
  var ALIASES={
    'finance-erp':'finance-erp','finance':'finance-erp','finance-and-erp':'finance-erp','finance-operations':'finance-erp','d365-finance-operations':'finance-erp',
    'crm-sales':'crm-sales','crm':'crm-sales',
    'ai-copilot':'ai-copilot','ai':'ai-copilot',
    'bi-analytics':'bi-analytics','bi':'bi-analytics',
    'modern-work':'modern-work',
    'managed-it':'managed-it','security':'managed-it',
    'business-central':'business-central',
    'dynamics-365-sales':'dynamics-365-sales',
    'copilot':'copilot','microsoft-copilot':'copilot',
    'power-platform':'power-platform','automation':'power-platform',
    'microsoft-365':'microsoft-365','m365':'microsoft-365',
    'azure-data':'azure-data','azure':'azure-data',
    'construction-cloud':'construction-cloud','civic-cloud':'civic-cloud'
  };
  function preselect(){
    var sel=root.querySelector('select[data-prop="area_of_interest"]');
    var m=location.search.match(/[?&]interest=([^&#]*)/);
    if(!sel || !m) return;
    var raw;
    try{ raw=decodeURIComponent(m[1].replace(/\+/g,' ')); }catch(e){ return; }
    raw=raw.replace(/^\s+|\s+$/g,'').toLowerCase().replace(/[\s_]+/g,'-');
    var v=Object.prototype.hasOwnProperty.call(ALIASES,raw) ? ALIASES[raw] : raw;
    for(var i=0;i<sel.options.length;i++){
      if(sel.options[i].value===v && !sel.options[i].disabled){ sel.value=v; return; }
    }
  }
  preselect();

  /* ---------- 2) validation ---------- */
  function fields(){ return [].slice.call(root.querySelectorAll('[data-prop]')); }
  function val(el){ return (el.value||'').replace(/^\s+|\s+$/g,''); }
  function holder(el){ return el.closest ? (el.closest('.consent') || el.closest('.field') || el.parentNode) : el.parentNode; }
  function clearOne(el){
    var h=holder(el), n=h && h.nextSibling;
    el.classList.remove('is-invalid'); el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby');
    if(h && h.classList) h.classList.remove('is-invalid');
    var e=root.querySelector('.field-err[data-for="'+(el.id||el.name)+'"]');
    if(e && e.parentNode) e.parentNode.removeChild(e);
  }
  function clearAll(){
    [].slice.call(root.querySelectorAll('.field-err')).forEach(function(e){ e.parentNode.removeChild(e); });
    [].slice.call(root.querySelectorAll('.is-invalid')).forEach(function(e){ e.classList.remove('is-invalid'); e.removeAttribute('aria-invalid'); e.removeAttribute('aria-describedby'); });
    if(formErr){ formErr.hidden=true; formErr.textContent=''; }
  }
  function showErr(el, msg){
    var h=holder(el), id='err-'+(el.id||el.name), box=document.createElement('div');
    box.className='field-err'; box.id=id; box.setAttribute('data-for', el.id||el.name); box.setAttribute('role','alert'); box.textContent=msg;
    el.classList.add('is-invalid'); el.setAttribute('aria-invalid','true'); el.setAttribute('aria-describedby', id);
    if(h && h.classList && h.classList.contains('consent')){ h.classList.add('is-invalid'); h.parentNode.insertBefore(box, h.nextSibling); }
    else { (h||el.parentNode).appendChild(box); }
  }
  function validate(){
    clearAll();
    var first=null;
    fields().forEach(function(el){
      var v=val(el), msg='';
      if(el.hasAttribute('required') && !v){ msg = el.tagName==='SELECT' ? 'Please choose an option.' : 'Please fill in this field.'; }
      else if(v && el.type==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){ msg='Please enter a valid email address.'; }
      else if(v && el.type==='tel' && (v.replace(/\D/g,'').length<7 || /[^0-9+()\-.\s]/.test(v))){ msg='Please enter a valid phone number.'; }
      if(msg){ showErr(el,msg); if(!first) first=el; }
    });
    if(consent && consent.hasAttribute('required') && !consent.checked){ showErr(consent,'Please tick the box to continue.'); if(!first) first=consent; }
    return first;
  }
  fields().concat(consent ? [consent] : []).forEach(function(el){
    var ev=(el.tagName==='SELECT' || el.type==='checkbox') ? 'change' : 'input';
    el.addEventListener(ev, function(){ clearOne(el); });
  });

  /* ---------- 3) sending ---------- */
  function areaValue(){ var s=root.querySelector('select[data-prop="area_of_interest"]'); return s ? s.value : ''; }
  function cookie(n){ var m=document.cookie.match(new RegExp('(?:^|;\\s*)'+n+'=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; }
  function payload(){
    var out=[], seen={};
    function add(name,value){ if(value!=='' && value!=null && !seen[name]){ seen[name]=1; out.push({objectTypeId:'0-1', name:name, value:value}); } }
    fields().forEach(function(el){
      var p=el.getAttribute('data-prop'), v=val(el);
      if(!v) return;
      if(p==='fullname'){ var parts=v.split(/\s+/); add('firstname', parts.shift()); add('lastname', parts.join(' ')); }
      else { add(p, v); }
    });
    var url=location.href.split('#')[0];
    add('inquiry_page_url', url);
    var ctx={pageUri:url, pageName:document.title}, hutk=cookie('hubspotutk');
    if(hutk) ctx.hutk=hutk;
    return {fields:out, context:ctx};
  }
  function setLoading(on){
    sending=on;
    if(btn){ btn.classList.toggle('is-loading', on); if(on) btn.setAttribute('aria-busy','true'); else btn.removeAttribute('aria-busy'); }
  }
  function fail(detail){
    setLoading(false);
    if(window.console && console.warn) console.warn('Book a Demo: '+detail);
    if(formErr){
      formErr.textContent='Sorry, something went wrong and your request was not sent. Please try again in a moment.'+(debug ? ' ['+detail+']' : '');
      formErr.hidden=false;
    }
  }
  function success(){
    setLoading(false);
    var a=areaValue();
    if(thankYou){ window.location.href=thankYou+(thankYou.indexOf('?')<0 ? '?' : '&')+(a ? 'interest='+encodeURIComponent(a) : ''); return; }
    if(card) card.classList.add('is-sent');
    if(thanks){
      thanks.hidden=false;
      try{ thanks.focus({preventScroll:true}); }catch(e){ thanks.focus(); }
      var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(thanks.scrollIntoView) thanks.scrollIntoView({block:'center', behavior: reduce ? 'auto' : 'smooth'});
    }
  }
  function submit(){
    if(sending) return;
    var bad=validate();
    if(bad){ try{ bad.focus(); }catch(e){} return; }
    if(trap && trap.value){ success(); return; }
    var body=payload();
    if(!endpoint){
      if(window.console && console.info) console.info('Book a Demo (demo mode): nothing was sent. Put the HubSpot Form ID in data-form-id to send for real.', body);
      success(); return;
    }
    setLoading(true);
    fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}).then(function(r){
      return r.text().then(function(t){
        if(r.ok){ success(); } else { fail('HubSpot did not accept the submission ('+r.status+'): '+String(t).slice(0,300)); }
      });
    }).catch(function(e){ fail('the submission could not be sent: '+e); });
  }
  if(btn) btn.addEventListener('click', function(e){ e.preventDefault(); submit(); });
  root.addEventListener('keydown', function(e){
    if(e.key==='Enter' && e.target && e.target.tagName==='INPUT' && e.target.type!=='checkbox' && e.target.type!=='button'){ e.preventDefault(); submit(); }
  });
})();
