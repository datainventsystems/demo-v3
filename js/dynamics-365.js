/* Dynamics 365 page: CRM / ERP explorer (built by build_dynamics_365_page.py) */
(function(){var r=document.querySelector('[data-d3-explorer]');if(!r)return;
r.addEventListener('click',function(e){var s=e.target.closest('[data-d3-side]');
if(s){var side=s.getAttribute('data-d3-side');r.querySelectorAll('[data-d3-side]').forEach(function(b){var on=b===s;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',on?'true':'false');});
r.querySelectorAll('.d3-side').forEach(function(p){p.classList.toggle('is-active',p.id==='d3-'+side);});return;}
var a=e.target.closest('[data-d3-app]');if(!a)return;var box=a.closest('.d3-side');
box.querySelectorAll('[data-d3-app]').forEach(function(b){var on=b===a;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',on?'true':'false');});
box.querySelectorAll('.d3-detail').forEach(function(d){d.classList.toggle('is-active',d.id===a.getAttribute('data-d3-app'));});});})();
