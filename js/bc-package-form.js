/* ============================================================================
   DataInvent - Business Central package popup form (js/bc-package-form.js)
   Validates the DataInvent form in the popup and shows one thank-you message. Opening and closing the popup is done by the
   page's own script (js/ inline, id businessCentralInteractions); this file does not touch that.

   DEMO MODE (default): the form checks the fields and shows the thank-you, but sends NOTHING. That keeps this reference copy
   from creating test leads. To make this copy send real submissions to HubSpot, put the address into the form's
   data-endpoint attribute (id diPkgForm), for example
     https://api.hsforms.com/submissions/v3/integration/submit/PORTAL_ID/FORM_ID
   In the HubSpot version of the page this is already connected.
   Add ?di_debug=1 to the page address to see HubSpot's reason when a submission fails.
   ============================================================================ */
(function(){
  'use strict';
  var form=document.getElementById('diPkgForm');
  var modal=document.getElementById('packageInquiryModal');
  if(!form || !modal || form.getAttribute('data-bound')) return;
  form.setAttribute('data-bound','1');

  var dialog=modal.querySelector('.bc-package-dialog');
  var thanks=document.getElementById('diPkgThanks');
  var errBox=form.querySelector('.di-pkg-error');
  var submitBtn=form.querySelector('.di-pkg-submit');
  var submitTxt=form.querySelector('.di-pkg-submit-t');
  var idleText=submitTxt ? submitTxt.textContent : '';
  var errRequired=form.getAttribute('data-err-required')||'Please fill in this field.';
  var errEmail=form.getAttribute('data-err-email')||'Please enter a valid email address.';
  var errTech=form.getAttribute('data-err-tech')||'Please choose at least one technology.';
  var sendingText=form.getAttribute('data-sending')||'Sending...';
  var generalError=form.getAttribute('data-error')||'Something went wrong and your request was not sent. Please try again in a moment.';
  var debug=/[?&]di_debug=1(?:&|$)/.test(location.search);
  var sending=false;

  function pageUrl(){ return location.href.split('#')[0]; }
  function controls(){ return [].slice.call(form.querySelectorAll('input,textarea,select')); }
  function clearErrors(){
    [].slice.call(form.querySelectorAll('.di-pkg-err')).forEach(function(e){ e.textContent=''; });
    [].slice.call(form.querySelectorAll('.has-error')).forEach(function(e){ e.classList.remove('has-error'); });
    [].slice.call(form.querySelectorAll('[aria-invalid]')).forEach(function(e){ e.removeAttribute('aria-invalid'); });
    if(errBox){ errBox.hidden=true; errBox.textContent=''; }
  }
  function fail(box, msg, input){
    box.classList.add('has-error');
    var s=box.querySelector('.di-pkg-err'); if(s){ s.textContent=msg; }
    if(input){ input.setAttribute('aria-invalid','true'); }
  }
  function validate(){
    clearErrors();
    var ok=true, first=null;
    [].slice.call(form.querySelectorAll('.di-pkg-field')).forEach(function(box){
      var input=box.querySelector('input,textarea');
      if(!input || input.getAttribute('data-required')!=='1') return;
      var v=input.value.replace(/^\s+|\s+$/g,'');
      if(!v){ fail(box, errRequired, input); ok=false; first=first||input; }
      else if(input.type==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ fail(box, errEmail, input); ok=false; first=first||input; }
    });
    var group=form.querySelector('[data-tech-group]');
    if(group && !group.querySelector('input:checked')){ fail(group, errTech, null); ok=false; first=first||group.querySelector('input'); }
    if(first){ try{ first.focus(); }catch(e){} }
    return ok;
  }
  function cookie(name){
    var m=document.cookie.match(new RegExp('(?:^|; )'+name+'=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function build(){
    var seen={}, order=[];
    function put(n,v){ if(!(n in seen)){ order.push(n); seen[n]=v; } else { seen[n]+=';'+v; } }
    controls().forEach(function(el){
      var n=el.name;
      if(!n || n==='di_website' || el.disabled) return;
      if(el.type==='checkbox'){ if(el.checked){ put(n, el.value); } return; }
      var v = el.getAttribute('data-role')==='page-url' ? pageUrl() : el.value.replace(/^\s+|\s+$/g,'');
      if(v){ put(n, v); }
    });
    var ctx={ pageUri:pageUrl(), pageName:document.title };
    var hutk=cookie('hubspotutk'); if(hutk){ ctx.hutk=hutk; }
    return { fields:order.map(function(n){ return { objectTypeId:'0-1', name:n, value:seen[n] }; }), context:ctx };
  }
  function busy(on){
    sending=on;
    if(submitBtn){ submitBtn.disabled=on; }
    if(submitTxt){ submitTxt.textContent = on && sendingText ? sendingText : idleText; }
  }
  function resetForm(){
    if(dialog){ dialog.classList.remove('is-sent'); }
    if(thanks){ thanks.hidden=true; }
    form.hidden=false; clearErrors(); busy(false);
    controls().forEach(function(el){
      if(el.type==='checkbox' || el.type==='radio'){ el.checked=el.defaultChecked; }
      else { el.value=el.defaultValue; }
    });
  }
  function done(){
    busy(false); form.hidden=true;
    if(thanks){ thanks.hidden=false; }
    if(dialog){ dialog.classList.add('is-sent'); dialog.scrollTop=0; }
    if(thanks){ try{ thanks.focus(); }catch(e){} }
  }
  function problem(status, text){
    busy(false);
    try{ console.error('[DataInvent form] HubSpot did not accept the submission (status '+status+'):', text); }catch(e){}
    if(errBox){
      var msg=generalError;
      if(debug){ msg+=' [debug] status '+status+': '+String(text).slice(0,600); }
      errBox.textContent=msg; errBox.hidden=false;
    }
  }
  function submit(){
    if(sending) return;
    if(!validate()) return;
    var hp=form.querySelector('[name="di_website"]');
    if(hp && hp.value){ done(); return; }                 /* a bot filled the hidden trap field: pretend it worked */
    var endpoint=form.getAttribute('data-endpoint')||'';
    if(!endpoint){ done(); return; }                      /* demo mode: nothing is sent */
    if(!window.fetch){ problem(0,'fetch is not available in this browser'); return; }
    var payload=build();
    if(!payload.fields.length){ problem(0,'the form has no field names to send'); return; }
    busy(true);
    fetch(endpoint, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload) })
      .then(function(r){ return r.text().then(function(t){ if(r.ok){ done(); } else { problem(r.status, t); } }); })
      .catch(function(err){ problem(0, String(err)); });
  }
  if(submitBtn){ submitBtn.addEventListener('click', function(e){ e.preventDefault(); submit(); }); }
  form.addEventListener('keydown', function(e){          /* Enter in a single-line field sends the form */
    if(e.key==='Enter' && e.target && e.target.tagName==='INPUT' && e.target.type!=='checkbox' && e.target.type!=='button' && e.target.type!=='submit'){
      e.preventDefault(); submit();
    }
  });
  /* when the popup is opened again after a thank-you, start with a fresh form */
  if(window.MutationObserver){
    new MutationObserver(function(){
      if(modal.classList.contains('open') && dialog && dialog.classList.contains('is-sent')){
        resetForm();
        var first=form.querySelector('input'); if(first){ try{ first.focus(); }catch(e){} }
      }
    }).observe(modal, { attributes:true, attributeFilter:['class'] });
  }
})();
