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
   STORY — VERTICAL PHONE EXPERIENCE, WITH SPOKEN NARRATION
   ============================================================ */
const phoneFrame = document.querySelector('[data-phone-frame]');

if(phoneFrame){

  // Rotate arms around the shoulder point in absolute SVG coordinates,
  // regardless of the nested translate() transforms on parent groups.
  gsap.set('.boy__arm--left',  { svgOrigin:'130 240' });
  gsap.set('.boy__arm--right', { svgOrigin:'190 240' });

  const checkPath = document.querySelector('.scene__check');
  const checkLen  = checkPath ? checkPath.getTotalLength() : 1;
  gsap.set(checkPath, { strokeDasharray:checkLen, strokeDashoffset:checkLen });

  const scenes = [
    { caption:'I wish my business could grow.',  duration:4200 },
    { caption:'Then I found Unfair.',             duration:3600 },
    { caption:'One call. One decision.',          duration:3600 },
    { caption:"Now we can't keep up with orders.",duration:4200 },
    { caption:'This is what unfair feels like.',  duration:999999 }
  ];

  const armPoses = {
    1:{ left:0,    right:0   },
    2:{ left:-40,  right:0   },
    3:{ left:0,    right:-75 },
    4:{ left:-150, right:150 },
    5:{ left:0,    right:0   }
  };

  const captionEl = document.querySelector('[data-caption]');
  const ctaEl     = document.querySelector('[data-story-cta]');
  const playBtn   = document.querySelector('[data-play-btn]');
  const muteBtn   = document.querySelector('[data-mute-btn]');
  const tapZone   = document.querySelector('[data-tap-zone]');
  const segs      = gsap.utils.toArray('[data-seg]');

  let currentScene = 0;
  let hasStarted   = false;
  let muted        = false;
  let timerId      = null;

  function speak(text){
    if(muted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = 0.98;
    utter.pitch = 1.05;
    window.speechSynthesis.speak(utter);
  }

  function burstSceneConfetti(){
    if(reduceMotion) return;
    const dots = gsap.utils.toArray('.scene__confetti circle');
    gsap.fromTo(dots,
      { opacity:1, scale:0, x:0, y:0 },
      {
        opacity:0, scale:1,
        x:() => gsap.utils.random(-90, 90),
        y:() => gsap.utils.random(-100, 10),
        duration:1.1, stagger:0.03, ease:'power2.out', overwrite:true
      }
    );
  }

  function updateProgress(n){
    segs.forEach((seg, i) => {
      const step = i + 1;
      const fill = seg.querySelector('.seg__fill');
      seg.classList.toggle('is-done', step < n);
      if(step === n){
        gsap.set(fill, { width:'0%' });
        gsap.to(fill, { width:'100%', duration:scenes[n-1].duration / 1000, ease:'none' });
      } else if(step > n){
        gsap.set(fill, { width:'0%' });
      }
    });
  }

  function goToScene(n){
    n = Math.max(1, Math.min(5, n));
    if(n === currentScene) return;
    currentScene = n;
    clearTimeout(timerId);

    gsap.to('.scene-prop', { opacity:0, duration:.3, overwrite:true });
    gsap.to(`.scene-prop[data-scene="${n}"]`, { opacity:1, duration:.4, delay:.15 });

    gsap.to('[data-boy]', { opacity: n === 5 ? 0 : 1, duration:.4 });

    gsap.to('.boy__arm--left',  { rotation:armPoses[n].left,  duration:.5, ease:'power2.out' });
    gsap.to('.boy__arm--right', { rotation:armPoses[n].right, duration:.5, ease:'power2.out' });

    gsap.to('.boy__mouth--sad',     { opacity: n === 1 ? 1 : 0, duration:.3 });
    gsap.to('.boy__mouth--neutral', { opacity: n === 2 ? 1 : 0, duration:.3 });
    gsap.to('.boy__mouth--happy',   { opacity: n >= 3 ? 1 : 0, duration:.3 });

    if(n === 3){
      gsap.to(checkPath, { strokeDashoffset:0, duration:.5, delay:.3 });
    } else if(n < 3){
      gsap.set(checkPath, { strokeDashoffset:checkLen });
    }

    if(n === 4){ burstSceneConfetti(); }

    captionEl.textContent = scenes[n-1].caption;
    ctaEl.classList.toggle('is-visible', n === 5);

    updateProgress(n);
    speak(scenes[n-1].caption);

    if(n < 5){
      timerId = setTimeout(() => goToScene(n + 1), scenes[n-1].duration);
    }
  }

  playBtn.addEventListener('click', e => {
    e.stopPropagation();
    hasStarted = true;
    playBtn.classList.add('is-hidden');
    goToScene(1);
  });

  tapZone.addEventListener('click', e => {
    if(!hasStarted) return;
    if(e.target.closest('[data-mute-btn]') || e.target.closest('[data-story-cta]') || e.target.closest('[data-play-btn]')) return;
    const rect  = tapZone.getBoundingClientRect();
    const relX  = (e.clientX - rect.left) / rect.width;
    goToScene(relX < 0.35 ? currentScene - 1 : currentScene + 1);
  });

  muteBtn.addEventListener('click', e => {
    e.stopPropagation();
    muted = !muted;
    muteBtn.classList.toggle('is-muted', muted);
    muteBtn.setAttribute('aria-pressed', String(muted));
    if(muted){ window.speechSynthesis && window.speechSynthesis.cancel(); }
    else if(hasStarted){ speak(scenes[currentScene-1].caption); }
  });

  ctaEl.addEventListener('click', e => { e.stopPropagation(); });
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
