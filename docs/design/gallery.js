/* Mockup gallery behaviour: theme toggle, scale frames to fit, full-size lightbox.
   Not part of the product UI. Frames are static HTML; this script only scales them. */
(function(){
  var root=document.documentElement,out=document.getElementById('out');
  function fit(){
    var cs=getComputedStyle(out),cw=out.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    [].forEach.call(out.querySelectorAll('.g-fw'),function(el){
      var w=+el.dataset.w,h=+el.dataset.h,s=Math.min(+el.dataset.base,cw/w);
      el.style.width=Math.floor(w*s)+'px';el.style.height=Math.floor(h*s)+'px';el.firstElementChild.style.transform='scale('+s+')';
    });
  }
  function fillTok(){var cs=getComputedStyle(root);[].forEach.call(document.querySelectorAll('[data-tok]'),function(el){el.textContent=cs.getPropertyValue(el.dataset.tok).trim().toUpperCase()})}
  function cur(){var t=root.getAttribute('data-theme');return t||(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
  function syncT(){[].forEach.call(document.querySelectorAll('[data-t]'),function(b){b.setAttribute('aria-pressed',b.dataset.t===cur()?'true':'false')})}
  [].forEach.call(document.querySelectorAll('[data-t]'),function(b){b.addEventListener('click',function(){root.setAttribute('data-theme',b.dataset.t);syncT();fillTok()})});
  var lb=null;
  function openLb(fw){
    var w=+fw.dataset.w,h=+fw.dataset.h,s=Math.min(1,(window.innerWidth-32)/w),cap=fw.parentNode.querySelector('.g-cap');
    lb=document.createElement('div');lb.className='g-light';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
    lb.innerHTML='<div class="g-light-bar"><span>'+cap.querySelector('.sz').textContent+' · '+cap.querySelector('b').textContent+(s<1?' · '+Math.round(s*100)+'%':'')+'</span><button type="button" id="lb-close">Close</button></div>'+
      '<div class="g-fw" style="width:'+Math.floor(w*s)+'px;height:'+Math.floor(h*s)+'px">'+fw.innerHTML+'</div>';
    lb.querySelector('.fr').style.transform='scale('+s+')';
    document.body.appendChild(lb);document.body.style.overflow='hidden';
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.id==='lb-close')closeLb()});
    lb.querySelector('#lb-close').focus();
  }
  function closeLb(){if(lb){lb.remove();lb=null;document.body.style.overflow=''}}
  out.addEventListener('click',function(e){var fw=e.target.closest('.g-fw');if(fw&&!lb)openLb(fw)});
  out.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('g-fw')){e.preventDefault();openLb(e.target)}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLb()});
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(fit,120)});
  syncT();fit();fillTok();
})();
