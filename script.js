gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduceMotion){ document.body.classList.add('reduced-motion'); }

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
   STORY — "ONE CALL, THEN CHAOS" SCROLLYTELLING SEQUENCE
   ============================================================ */
const storyPin = document.querySelector('.story__pin');

if(storyPin && !reduceMotion){

  // Rotate arms around the shoulder point in absolute SVG coordinates,
  // regardless of the nested translate() transforms on parent groups.
  gsap.set('.char__arm--left',  { svgOrigin:'156 260' });
  gsap.set('.char__arm--right', { svgOrigin:'224 260' });

  const poses = {
    1: { left:0,    right:0,   glow:false },
    2: { left:-140, right:0,   glow:false },
    3: { left:0,    right:-45, glow:false },
    4: { left:-165, right:165, glow:true  }
  };

  const tickerValue = document.querySelector('[data-ticker-value]');
  const tickerTrend = document.querySelector('[data-ticker-trend]');
  const revenueObj  = { val:4180 };
  let currentStoryStage = 0;

  function burstConfetti(){
    const dots = gsap.utils.toArray('.story__confetti circle');
    gsap.fromTo(dots,
      { opacity:1, scale:0, x:0, y:0 },
      {
        opacity:0,
        scale:1,
        x:() => gsap.utils.random(-110, 110),
        y:() => gsap.utils.random(-120, 10),
        duration:1.2,
        stagger:0.025,
        ease:'power2.out',
        overwrite:true
      }
    );
  }

  function setStoryStage(n){
    if(n === currentStoryStage) return;
    currentStoryStage = n;
    const pose = poses[n];

    gsap.to('.story__bubble', { opacity:0, y:-6, duration:.3, overwrite:true });
    gsap.to(`.story__bubble[data-stage="${n}"]`, { opacity:1, y:0, duration:.45, delay:.18 });

    document.querySelectorAll('.story__steps li').forEach(li => {
      const step = Number(li.dataset.step);
      li.classList.toggle('is-active', step === n);
      li.classList.toggle('is-done', step < n);
    });

    gsap.to('.char__arm--left',  { rotation: pose.left,  duration:.6, ease:'power2.out' });
    gsap.to('.char__arm--right', { rotation: pose.right, duration:.6, ease:'power2.out' });

    gsap.to(['.char__body', '.char__head'], {
      stroke: pose.glow ? '#C6A15B' : '#5B5D63',
      fill:   pose.glow ? 'rgba(198,161,91,.12)' : '#1C1F24',
      duration:.6
    });

    gsap.to('.char__mouth--sad',     { opacity: n === 1 ? 1 : 0, duration:.35 });
    gsap.to('.char__mouth--neutral', { opacity: (n === 2 || n === 3) ? 1 : 0, duration:.35 });
    gsap.to('.char__mouth--happy',   { opacity: n === 4 ? 1 : 0, duration:.35 });

    gsap.to('.char__phone',    { opacity: n === 2 ? 1 : 0, duration:.35 });
    gsap.to('.char__contract', { opacity: n === 3 ? 1 : 0, duration:.35 });

    if(n === 3){
      gsap.to('.char__check', { strokeDashoffset:0, duration:.5, delay:.2 });
    } else if(n < 3){
      gsap.set('.char__check', { strokeDashoffset:60 });
    }

    if(n === 4){
      burstConfetti();
      gsap.to(revenueObj, {
        val:61400, duration:1.1, ease:'power2.out',
        onUpdate: () => { tickerValue.textContent = '$' + Math.round(revenueObj.val).toLocaleString(); }
      });
      tickerValue.classList.add('is-up');
      tickerTrend.textContent = '▲ +1,368% MoM';
      tickerTrend.classList.add('is-up');
    } else if(n === 3){
      tickerValue.textContent = 'PROCESSING…';
      tickerValue.classList.remove('is-up');
    } else if(n === 2){
      tickerTrend.textContent = 'status: calling Unfair…';
    } else if(n === 1){
      revenueObj.val = 4180;
      tickerValue.textContent = '$4,180';
      tickerTrend.textContent = '▼ 6% MoM';
      tickerValue.classList.remove('is-up');
      tickerTrend.classList.remove('is-up');
    }
  }

  setStoryStage(1);

  ScrollTrigger.create({
    trigger: storyPin,
    start:'top top',
    end:'+=3000',
    pin:true,
    scrub:0.5,
    onUpdate: self => {
      const p = self.progress;
      let n;
      if(p < 0.2)       n = 1;
      else if(p < 0.46) n = 2;
      else if(p < 0.72) n = 3;
      else              n = 4;
      setStoryStage(n);
    }
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
