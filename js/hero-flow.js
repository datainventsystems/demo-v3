/* ============================================================================
   DataInvent — HERO MESH FIELD  (noise → signal)
   Homepage hero background. Mounts into #heroFlow.
   Rails terminate at the .oc outcome blocks and flare them on arrival.
   Replaces the old static heroNet() SVG. No dependencies.
   ============================================================================ */
(function heroMesh(){
  var host = document.getElementById('heroFlow');
  if(!host || !host.getContext) return;
  var ctx = host.getContext('2d',{alpha:true});
  if(!ctx) return;

  var ocEls = [].slice.call(document.querySelectorAll('.oc'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function token(n,f){
    var v=getComputedStyle(document.documentElement).getPropertyValue(n);
    return (v||'').trim()||f;
  }
  function hex(h){
    h=h.replace('#','');
    if(h.length===3) h=h.split('').map(function(c){return c+c;}).join('');
    var n=parseInt(h,16);
    return [(n>>16)&255,(n>>8)&255,n&255];
  }
  var C_OR=hex(token('--brand-orange','#E47B2B'));
  var C_LT=hex(token('--brand-orange-light','#F4A45C'));
  var C_DIM=[124,120,116];
  function mix(a,b,t){ return [a[0]+(b[0]-a[0])*t|0,a[1]+(b[1]-a[1])*t|0,a[2]+(b[2]-a[2])*t|0]; }
  function rgba(c,a){ return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'; }

  var CFG = {
    nodes:880, nodesMobile:280,
    x0:0.050,
    fx:0.505,
    fy:0.50,
    fanH:0.60,
    link:42, maxLinks:3,
    speed:0.00034, drift:12,
    railsSecondary:3,
    secSpread:0.20,
    pulses:14
  };

  var W=0,H=0,DPR=1;
  var N=[],PL=[],grid=null,cell=0,cols=0,rows=0;
  var TARGETS=[];
  var raf=null,running=false,tms=0;
  var flare=[0,0,0,0];

  function rand(a,b){ return a+Math.random()*(b-a); }
  function fanAt(u){ return H*CFG.fanH*Math.pow(1-u,0.55); }

  function makeNode(seed){
    return { u:seed?Math.random():0, v:rand(-1,1), ph:rand(0,6.2832),
             fq:rand(0.4,1.6), sp:rand(0.70,1.38), sz:rand(0.5,1.7),
             hot:Math.random()<0.08, x:0,y:0,a:0 };
  }
  function makePulse(){
    return { t:Math.random(), tgt:(Math.random()*4)|0, sp:rand(0.0020,0.0044),
             sz:rand(1.1,2.2), fired:false };
  }

  function measureTargets(){
    TARGETS.length=0;
    var hr=host.getBoundingClientRect();
    for(var i=0;i<ocEls.length;i++){
      var ico=ocEls[i].querySelector('.oc-ico');
      if(!ico) continue;
      var r=ico.getBoundingClientRect();
      if(!r.width) continue;                     /* hidden on mobile */
      TARGETS.push({ x:r.left-hr.left, y:r.top-hr.top+r.height/2 });
    }
  }

  function railPoint(tx,ty,s){
    var fxp=W*CFG.fx, fyp=H*CFG.fy;
    var run=Math.max(80,(tx-fxp));
    var x=fxp+run*s;
    var e;
    if(s<0.12){ e=0; }
    else if(s>0.90){ e=1; }
    else {
      var k=(s-0.12)/0.78;
      e=k<0.5 ? 2*k*k : 1-Math.pow(-2*k+2,2)/2;
    }
    return { x:x, y:fyp+(ty-fyp)*e };
  }

  function secondaryY(i,s){
    var fyp=H*CFG.fy, spread=H*CFG.secSpread;
    var denom = (CFG.railsSecondary>1) ? (CFG.railsSecondary-1) : 1;
    var end=fyp-spread+(spread*2)/denom*i;
    var e=s<0.26?(s/0.26):1;
    e=1-Math.pow(1-e,2.1);
    return fyp+(end-fyp)*e;
  }

  function place(n){
    var u=n.u;
    n.x=(CFG.x0+u*(CFG.fx-CFG.x0))*W;
    var half=fanAt(u);
    var wob=Math.sin(tms*0.00032*n.fq+n.ph)*CFG.drift*(1-u*0.70);
    n.y=H*CFG.fy+n.v*half+wob;
    n.a=0.09+0.76*Math.pow(u,1.25);
  }

  function buildGrid(){
    cell=CFG.link;
    cols=Math.ceil(W/cell)+1;
    rows=Math.ceil(H/cell)+1;
    var total=cols*rows;
    if(!grid||grid.length!==total){
      grid=new Array(total);
      for(var i=0;i<total;i++) grid[i]=[];
    } else {
      for(var j=0;j<total;j++) grid[j].length=0;
    }
    for(var k=0;k<N.length;k++){
      var n=N[k];
      var cx=(n.x/cell)|0, cy=(n.y/cell)|0;
      if(cx<0)cx=0; if(cx>=cols)cx=cols-1;
      if(cy<0)cy=0; if(cy>=rows)cy=rows-1;
      grid[cy*cols+cx].push(n);
    }
  }

  function drawMesh(){
    var r2=CFG.link*CFG.link;
    for(var i=0;i<N.length;i++){
      var a=N[i], cx=(a.x/cell)|0, cy=(a.y/cell)|0, drawn=0;
      for(var gy=cy-1;gy<=cy+1&&drawn<CFG.maxLinks;gy++){
        if(gy<0||gy>=rows) continue;
        for(var gx=cx-1;gx<=cx+1&&drawn<CFG.maxLinks;gx++){
          if(gx<0||gx>=cols) continue;
          var bk=grid[gy*cols+gx];
          for(var b=0;b<bk.length;b++){
            var m=bk[b];
            if(m===a||m.x<a.x) continue;
            var dx=m.x-a.x, dy=m.y-a.y, d2=dx*dx+dy*dy;
            if(d2>r2||d2<1) continue;
            var f=1-d2/r2;
            var u=(a.u+m.u)*0.5;
            ctx.strokeStyle=rgba(mix(C_DIM,C_OR,Math.pow(u,1.45)),(0.036+0.36*Math.pow(u,2))*f);
            ctx.lineWidth=0.72;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y);
            ctx.lineTo(m.x,m.y);
            ctx.stroke();
            if(++drawn>=CFG.maxLinks) break;
          }
        }
      }
    }
  }

  function drawNodes(){
    for(var i=0;i<N.length;i++){
      var n=N[i];
      var col=mix(C_DIM,C_OR,Math.pow(n.u,1.40));
      if(n.hot) col=mix(col,C_LT,0.62);
      var a=n.a*(n.hot?1.7:1);
      if(a>1) a=1;
      ctx.fillStyle=rgba(col,a);
      ctx.beginPath();
      ctx.arc(n.x,n.y,n.sz*(n.hot?1.55:1),0,6.2832);
      ctx.fill();
    }
  }

  function drawSecondary(){
    var fxp=W*CFG.fx, steps=22;
    var endX=W*0.86;
    for(var i=0;i<CFG.railsSecondary;i++){
      var g=ctx.createLinearGradient(fxp,0,endX,0);
      g.addColorStop(0,rgba(C_LT,0.20));
      g.addColorStop(0.55,rgba(C_OR,0.06));
      g.addColorStop(1,rgba(C_OR,0));
      ctx.strokeStyle=g; ctx.lineWidth=0.8;
      ctx.beginPath();
      for(var s=0;s<=steps;s++){
        var t=s/steps, x=fxp+(endX-fxp)*t, y=secondaryY(i,t);
        if(s===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
  }

  function drawRails(){
    var steps=34;
    for(var i=0;i<TARGETS.length;i++){
      var T=TARGETS[i];
      var g=ctx.createLinearGradient(W*CFG.fx,0,T.x,0);
      g.addColorStop(0,rgba(C_LT,0.76));
      g.addColorStop(0.45,rgba(C_OR,0.40));
      g.addColorStop(1,rgba(C_LT,0.60));
      ctx.strokeStyle=g; ctx.lineWidth=1.3;
      ctx.beginPath();
      for(var s=0;s<=steps;s++){
        var p=railPoint(T.x,T.y,s/steps);
        if(s===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
      }
      ctx.stroke();

      var fl=flare[i]||0;
      ctx.fillStyle=rgba([255,240,220],0.58+fl*0.42);
      ctx.beginPath();
      ctx.arc(T.x,T.y,2.0+fl*2.6,0,6.2832);
      ctx.fill();
      if(fl>0.01){
        var rg=ctx.createRadialGradient(T.x,T.y,0,T.x,T.y,30+fl*30);
        rg.addColorStop(0,rgba(C_LT,0.36*fl));
        rg.addColorStop(1,rgba(C_OR,0));
        ctx.fillStyle=rg;
        ctx.fillRect(T.x-64,T.y-64,128,128);
      }
    }
  }

  function drawPulses(){
    for(var i=0;i<PL.length;i++){
      var p=PL[i];
      var T=TARGETS[p.tgt];
      if(!T) continue;
      var a=railPoint(T.x,T.y,p.t);
      var b=railPoint(T.x,T.y,Math.max(0,p.t-0.085));
      var g=ctx.createLinearGradient(b.x,b.y,a.x,a.y);
      g.addColorStop(0,rgba(C_OR,0));
      g.addColorStop(1,rgba(C_LT,0.92));
      ctx.strokeStyle=g; ctx.lineWidth=1.9;
      ctx.beginPath();
      ctx.moveTo(b.x,b.y);
      ctx.lineTo(a.x,a.y);
      ctx.stroke();
      ctx.fillStyle='rgba(255,242,224,0.96)';
      ctx.beginPath();
      ctx.arc(a.x,a.y,p.sz,0,6.2832);
      ctx.fill();
    }
  }

  function drawCore(){
    var fxp=W*CFG.fx, fyp=H*CFG.fy, r=Math.min(W,H)*0.23;
    var g=ctx.createRadialGradient(fxp,fyp,0,fxp,fyp,r);
    g.addColorStop(0,'rgba(255,248,236,0.92)');
    g.addColorStop(0.05,'rgba(255,216,170,0.46)');
    g.addColorStop(0.22,rgba(C_OR,0.16));
    g.addColorStop(1,rgba(C_OR,0));
    ctx.fillStyle=g;
    ctx.fillRect(fxp-r,fyp-r,r*2,r*2);

    var s=ctx.createLinearGradient(0,fyp-H*0.20,0,fyp+H*0.20);
    s.addColorStop(0,rgba(C_OR,0));
    s.addColorStop(0.30,rgba(C_LT,0.16));
    s.addColorStop(0.5,'rgba(255,246,232,0.62)');
    s.addColorStop(0.70,rgba(C_LT,0.16));
    s.addColorStop(1,rgba(C_OR,0));
    ctx.fillStyle=s;
    ctx.fillRect(fxp-0.8,fyp-H*0.20,1.6,H*0.40);
  }

  function step(dt){
    tms+=dt*16.667;
    for(var i=0;i<N.length;i++){
      var n=N[i];
      n.u+=CFG.speed*n.sp*dt;
      if(n.u>1){ n.u=0; n.v=rand(-1,1); n.ph=rand(0,6.2832); n.hot=Math.random()<0.08; }
      place(n);
    }
    for(var j=0;j<PL.length;j++){
      var p=PL[j];
      p.t+=p.sp*dt;
      if(p.t>=1&&!p.fired){
        p.fired=true;
        flare[p.tgt]=1;
        var el=ocEls[p.tgt];
        if(el){
          el.classList.add('pulse');
          (function(e){ setTimeout(function(){ e.classList.remove('pulse'); },560); })(el);
        }
      }
      if(p.t>1.03){
        p.t=0; p.fired=false;
        p.tgt=(Math.random()*Math.max(1,TARGETS.length))|0;
        p.sp=rand(0.0020,0.0044);
      }
    }
    for(var f=0;f<flare.length;f++){ flare[f]*=Math.pow(0.935,dt); if(flare[f]<0.002) flare[f]=0; }
  }

  function render(){
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    buildGrid();
    drawMesh();
    drawNodes();
    drawSecondary();
    drawRails();
    drawPulses();
    drawCore();
    ctx.globalCompositeOperation='source-over';
  }

  var last=0;
  function frame(now){
    if(!running) return;
    var dt=last?Math.min((now-last)/16.667,3):1;
    last=now;
    step(dt); render();
    raf=requestAnimationFrame(frame);
  }
  function start(){ if(running||reduced) return; running=true; last=0; raf=requestAnimationFrame(frame); }
  function stop(){ running=false; if(raf) cancelAnimationFrame(raf); raf=null; }

  function resize(){
    var r=host.getBoundingClientRect();
    W=Math.max(1,r.width); H=Math.max(1,r.height);
    DPR=Math.min(window.devicePixelRatio||1,2);
    host.width=Math.round(W*DPR); host.height=Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);

    var mobile=W<1100;
    var target=mobile?CFG.nodesMobile:CFG.nodes;
    CFG.link=mobile?32:42;
    CFG.maxLinks=mobile?2:3;
    CFG.railsSecondary=mobile?2:3;

    while(N.length<target) N.push(makeNode(true));
    if(N.length>target) N.length=target;
    var pc=mobile?8:CFG.pulses;
    while(PL.length<pc) PL.push(makePulse());
    if(PL.length>pc) PL.length=pc;

    measureTargets();
    if(!TARGETS.length){
      for(var i=0;i<4;i++) TARGETS.push({ x:W*0.93, y:H*(0.28+i*0.145) });
    }
    for(var k=0;k<N.length;k++) place(N[k]);
    if(reduced) render();
  }

  var rt=null;
  window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(resize,160); });
  document.addEventListener('visibilitychange',function(){ document.hidden?stop():start(); });

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){ e.isIntersecting?start():stop(); });
    },{threshold:0.02}).observe(host);
  } else start();

  ocEls.forEach(function(el,i){
    setTimeout(function(){ el.classList.add('in'); }, 560+i*180);
  });

  resize();
  if(reduced){ render(); } else { start(); }
})();
