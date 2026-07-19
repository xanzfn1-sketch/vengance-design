gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   PAGE LOAD SEQUENCE
   ============================================================ */
function loadSequence(){
  const words = gsap.utils.toArray('[data-word]');
  const tl = gsap.timeline({ delay:.2 });

  tl.to('.nav', { opacity:1, y:0, duration:.6, ease:'power2.out' }, 0)
    .to('[data-anim="eyebrow"]', { opacity:1, duration:.6, ease:'power2.out' }, .1)
    .to(words, {
      opacity:1,
      y:0,
      rotate:0,
      duration:.9,
      ease:'power3.out',
      stagger:.07
    }, .25)
    .to('[data-anim="sub"]', { opacity:1, y:0, duration:.7, ease:'power2.out' }, '-=.5')
    .to('[data-anim="cta"]', { opacity:1, y:0, duration:.7, ease:'power2.out' }, '-=.55')
    .to('[data-faultline]', { scaleY:1, duration:1.4, ease:'power2.inOut' }, .3);
}

if(reduceMotion){
  gsap.set(['.nav','[data-anim="eyebrow"]','[data-word]','[data-anim="sub"]','[data-anim="cta"]'], { opacity:1, y:0, rotate:0 });
  gsap.set('[data-faultline]', { scaleY:1 });
} else {
  gsap.set('[data-word]', { y:26, rotate:4, transformOrigin:'left bottom' });
  gsap.set('.nav', { y:-16 });
  loadSequence();
}

/* ============================================================
   COUNT-UP STATS
   ============================================================ */
gsap.utils.toArray('[data-count]').forEach(el => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '%';
  const obj = { val:0 };
  gsap.to(obj, {
    val: target,
    duration: 1.6,
    delay: 1.1,
    ease:'power2.out',
    onUpdate: () => { el.textContent = obj.val.toFixed(target % 1 !== 0 ? 1 : 0) + suffix; }
  });
});

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
if(!reduceMotion){
  gsap.utils.toArray('[data-magnetic]').forEach(btn => {
    const xTo = gsap.quickTo(btn, 'x', { duration:.5, ease:'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration:.5, ease:'power3.out' });

    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const relX = e.clientX - r.left - r.width/2;
      const relY = e.clientY - r.top - r.height/2;
      xTo(relX * 0.35);
      yTo(relY * 0.5);
    });
    btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });
}

/* ============================================================
   SCROLL-TRIGGERED CARD REVEALS
   ============================================================ */
gsap.utils.toArray('[data-reveal]').forEach((card, i) => {
  gsap.to(card, {
    opacity:1,
    y:0,
    duration:.8,
    ease:'power3.out',
    delay: reduceMotion ? 0 : (i % 4) * 0.08,
    scrollTrigger:{
      trigger: card,
      start:'top 88%',
      toggleActions:'play none none none'
    }
  });
});

/* ============================================================
   TILT + GLOW CARDS
   ============================================================ */
if(!reduceMotion){
  gsap.utils.toArray('[data-tilt]').forEach(card => {
    const rotX = gsap.quickTo(card, 'rotateX', { duration:.4, ease:'power3.out' });
    const rotY = gsap.quickTo(card, 'rotateY', { duration:.4, ease:'power3.out' });

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;

      rotY((px - 0.5) * 14);
      rotX((0.5 - py) * 14);

      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      rotX(0); rotY(0);
    });
  });
}

/* ============================================================
   GROWTH CHART — BEFORE / AFTER, DRAWN AS YOU SCROLL
   ============================================================ */
const growthLine = document.querySelector('.growth__line');

if(growthLine){
  const growthArea = document.querySelector('.growth__area');
  const growthDot   = document.querySelector('.growth__dot');
  const growthCard  = document.querySelector('.growth__chart-card');
  const counterEl   = document.querySelector('[data-scroll-count]');
  const target      = counterEl ? parseFloat(counterEl.dataset.scrollCount) : 0;
  const suffix       = counterEl ? (counterEl.dataset.suffix || '') : '';
  const len = growthLine.getTotalLength();

  gsap.set(growthLine, { strokeDasharray: len, strokeDashoffset: reduceMotion ? 0 : len });

  if(reduceMotion){
    gsap.set(growthArea, { opacity:1 });
    gsap.set(growthDot,  { opacity:1 });
    gsap.set(growthDot,  { motionPath:{ path: growthLine, align:growthLine, alignOrigin:[0.5,0.5], start:1, end:1 } });
    if(counterEl) counterEl.textContent = '+' + target + suffix;
  } else {
    const counterObj = { val:0 };

    gsap.timeline({
      scrollTrigger:{
        trigger: growthCard,
        start:'top 75%',
        end:'bottom 40%',
        scrub:0.6
      }
    })
    .to(growthLine, { strokeDashoffset:0, ease:'none', duration:1 }, 0)
    .to(growthArea, { opacity:1, ease:'none', duration:1 }, 0)
    .to(growthDot,  { opacity:1, duration:.05 }, 0)
    .to(growthDot,  {
        motionPath:{ path: growthLine, align:growthLine, alignOrigin:[0.5,0.5] },
        ease:'none',
        duration:1
      }, 0)
    .to(counterObj, {
        val: target,
        ease:'none',
        duration:1,
        onUpdate: () => { if(counterEl) counterEl.textContent = '+' + Math.round(counterObj.val) + suffix; }
      }, 0);
  }
}

/* ============================================================
   NAV SCROLL STATE (subtle background tighten)
   ============================================================ */
ScrollTrigger.create({
  start: 60,
  onUpdate: self => {
    gsap.to('.nav', { backdropFilter: self.progress > 0 || window.scrollY > 40 ? 'blur(14px)' : 'blur(10px)', duration:.3 });
  }
});
