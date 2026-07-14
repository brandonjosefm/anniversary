/* ==========================================================================
   Anniversary — Premium Interactive Experience
   Vanilla JS + GSAP + Howler. No build step — runs directly on GitHub Pages.
   window.PRIZE_TYPE ('outfit' | 'mycar' | 'default') is set inline by each
   entry page (index.html / outfit/index.html / mycar/index.html) before
   this file loads, and is the ONLY thing that differs between the three.
   ========================================================================== */

(function(){
  'use strict';

  /* ------------------------------------------------------------------ */
  /* 1. Config                                                           */
  /* ------------------------------------------------------------------ */

  const PRIZES = {
    outfit: {
      emoji: '👗',
      title: 'Outfit Shopping',
      subtitle: '"Hoy la arquitecta diseña...\npero esta vez diseñaremos tu próximo look."',
      desc: 'Este vale puede canjearse por una tarde completa de shopping. Tú elegirás el outfit que más te guste.',
      cta: '❤️ Lo canjearé pronto'
    },
    mycar: {
      emoji: '🚗',
      title: 'Pimp My Car',
      subtitle: '"Porque hasta las mejores obras necesitan un acabado perfecto."',
      desc: 'Este vale puede canjearse por un detailing premium para consentir tu carro.',
      cta: '🚗 Lo quiero usar'
    },
    default: {
      emoji: '✨',
      title: 'Una sorpresa especial',
      subtitle: '"Este enlace todavía no tiene un premio asignado."',
      desc: 'Pídele a Brandon el código QR correcto para descubrir tu regalo.',
      cta: '❤️ Entendido'
    }
  };

  const SFX_PATHS = {
    click:    'assets/sounds/click.mp3',
    unlock:   'assets/sounds/unlock.mp3',
    scroll:   'assets/sounds/scroll.mp3',
    sparkle:  'assets/sounds/sparkle.mp3',
    confetti: 'assets/sounds/confetti.mp3'
  };
  const MUSIC_PATH = 'assets/sounds/music.mp3';

  /* ------------------------------------------------------------------ */
  /* 2. Utils                                                             */
  /* ------------------------------------------------------------------ */

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isLowPower = (() => {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const smallViewport = Math.min(window.innerWidth, window.innerHeight) < 420;
    const lowMemory = 'deviceMemory' in navigator && navigator.deviceMemory <= 4;
    const lowCores = 'hardwareConcurrency' in navigator && navigator.hardwareConcurrency <= 4;
    return prefersReducedMotion || (coarsePointer && (smallViewport || lowMemory || lowCores));
  })();

  // Mobile browsers change viewport height as chrome shows/hides — keep a
  // reliable full-height unit instead of relying on 100vh.
  function setViewportUnit(){
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  }
  setViewportUnit();
  window.addEventListener('resize', setViewportUnit);
  window.addEventListener('orientationchange', setViewportUnit);

  function vibrate(pattern){
    if('vibrate' in navigator){
      try{ navigator.vibrate(pattern); }catch(e){ /* unsupported / blocked */ }
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3. Audio manager (Howler)                                            */
  /* ------------------------------------------------------------------ */

  const AudioManager = (() => {
    let music = null;
    let sfx = {};
    let enabled = true;
    let started = false;
    const hasHowler = typeof Howler !== 'undefined';

    function init(){
      if(!hasHowler) return;
      music = new Howl({ src:[MUSIC_PATH], loop:true, volume:0, html5:true, onloaderror:()=>{} });
      Object.keys(SFX_PATHS).forEach(key=>{
        sfx[key] = new Howl({ src:[SFX_PATHS[key]], volume: key === 'confetti' ? 0.35 : 0.5, onloaderror:()=>{} });
      });
    }

    // Must be called from within a user gesture (tap) to satisfy mobile
    // autoplay policies — this is wired to the very first tap of the
    // experience, so from the visitor's perspective music "just starts".
    function start(){
      if(started || !hasHowler || !music) return;
      started = true;
      try{
        music.play();
        if(enabled) music.fade(0, 0.22, 1200);
      }catch(e){ /* playback blocked, fail silently */ }
    }

    function toggle(){
      enabled = !enabled;
      if(music && started){
        music.fade(music.volume(), enabled ? 0.22 : 0, 400);
      }
      return enabled;
    }

    function play(name){
      if(!enabled || !hasHowler || !sfx[name]) return;
      try{ sfx[name].play(); }catch(e){ /* ignore */ }
    }

    return { init, start, toggle, play, isEnabled: () => enabled };
  })();

  /* ------------------------------------------------------------------ */
  /* 4. Ambient particle field (canvas) — stars, fireflies, floating hearts */
  /* ------------------------------------------------------------------ */

  const ParticleField = (() => {
    let canvas, ctx, w, h, particles = [], raf;
    const COUNT = isLowPower ? 26 : 60;
    const GLYPHS = ['star', 'firefly'];

    function resize(){
      w = canvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
      h = canvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    function makeParticle(){
      const type = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      return {
        type,
        x: Math.random() * w,
        y: Math.random() * h,
        r: type === 'firefly' ? rand(1.2, 2.6) : rand(0.6, 1.6),
        baseAlpha: rand(0.15, 0.55),
        alpha: 0,
        phase: rand(0, Math.PI * 2),
        speed: rand(0.15, 0.4),
        drift: rand(-0.15, 0.15),
        twinkle: rand(0.6, 1.6)
      };
    }

    function tick(t){
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p=>{
        p.y -= p.speed;
        p.x += p.drift;
        if(p.y < -10) p.y = h + 10;
        if(p.x < -10) p.x = w + 10;
        if(p.x > w + 10) p.x = -10;
        p.alpha = p.baseAlpha * (0.55 + 0.45 * Math.sin(t / 900 * p.twinkle + p.phase));

        ctx.beginPath();
        const color = p.type === 'firefly' ? '201,163,94' : '248,244,236';
        ctx.fillStyle = `rgba(${color},${Math.max(p.alpha,0)})`;
        if(p.type === 'firefly'){
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          grad.addColorStop(0, `rgba(${color},${Math.max(p.alpha,0)})`);
          grad.addColorStop(1, 'rgba(201,163,94,0)');
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        } else {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    }

    function init(){
      canvas = $('#fx-canvas');
      if(!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      particles = Array.from({length: COUNT}, makeParticle);
      if(!prefersReducedMotion){
        raf = requestAnimationFrame(tick);
      } else {
        // Draw a single static frame instead of animating continuously.
        tick(0);
        cancelAnimationFrame(raf);
      }
    }

    return { init };
  })();

  /* ------------------------------------------------------------------ */
  /* 5. Confetti + light bursts                                          */
  /* ------------------------------------------------------------------ */

  const FX = (() => {
    let layer;
    const COLORS = ['#c9a35e', '#b9a6e6', '#f8f4ec'];

    function init(){ layer = $('.fx-layer'); }

    function confettiBurst(count){
      if(!layer) return;
      const n = count || (isLowPower ? 14 : 28);
      for(let i = 0; i < n; i++){
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = rand(15, 85) + 'vw';
        piece.style.background = COLORS[i % COLORS.length];
        layer.appendChild(piece);
        const rot = rand(-180, 180);
        gsap.fromTo(piece,
          { y: -20, opacity: 0, rotate: 0, scale: rand(0.6, 1.1) },
          {
            y: window.innerHeight * rand(0.5, 0.9),
            x: `+=${rand(-60, 60)}`,
            opacity: 0,
            rotate: rot,
            duration: rand(1.6, 2.6),
            ease: 'power1.out',
            delay: rand(0, 0.35),
            onStart: function(){ gsap.set(piece, { opacity: 0.95 }); },
            onComplete: () => piece.remove()
          }
        );
      }
    }

    function ringPulse(x, y){
      if(!layer) return;
      const ring = document.createElement('div');
      ring.className = 'burst-ring';
      ring.style.left = x + 'px';
      ring.style.top = y + 'px';
      layer.appendChild(ring);
      gsap.fromTo(ring,
        { opacity: 0.9, scale: 0.2 },
        { opacity: 0, scale: 14, duration: 1.1, ease: 'power2.out', onComplete: () => ring.remove() }
      );
    }

    return { init, confettiBurst, ringPulse };
  })();

  /* ------------------------------------------------------------------ */
  /* 6. Scene manager — drives the guided sequence                       */
  /* ------------------------------------------------------------------ */

  const Scenes = (() => {
    const els = {};
    let current = null;

    function cacheEls(){
      els.hero = $('[data-screen="hero"]');
      els.verify = $('[data-screen="verify"]');
      els.vault = $('[data-screen="vault"]');
      els.prize = $('[data-screen="prize"]');
      els.final = $('[data-screen="final"]');
      els.verifyText = $('.verify-text');
      els.progressFill = $('.progress-fill');
      els.vaultStage = $('.vault-stage');
      els.vaultLight = $('.vault-light');
      els.tube = $('.tube');
      els.blueprint = $('.blueprint');
      els.lightRays = $('.light-rays');
      els.vaultHint = $('.vault-hint');
      els.prizeEmoji = $('.prize-emoji');
      els.prizeTitle = $('.prize-title');
      els.prizeSubtitle = $('.prize-subtitle');
      els.prizeDesc = $('.prize-desc');
      els.prizeCta = $('.prize-cta');
      els.finalCard = $('.final-card');
    }

    function goTo(name, enterFn){
      const target = els[name];
      if(!target) return;
      const outgoing = current;
      current = target;

      if(outgoing && outgoing !== target){
        gsap.to(outgoing, {
          opacity: 0,
          scale: 0.97,
          filter: 'blur(10px)',
          duration: prefersReducedMotion ? 0.15 : 0.65,
          ease: 'power2.inOut',
          onComplete: () => { outgoing.classList.remove('active'); }
        });
      }

      target.classList.add('active');
      gsap.fromTo(target,
        { opacity: 0, scale: 1.02, filter: 'blur(10px)' },
        {
          opacity: 1, scale: 1, filter: 'blur(0px)',
          duration: prefersReducedMotion ? 0.2 : 0.8,
          ease: 'power2.out',
          delay: outgoing ? 0.28 : 0,
          onComplete: () => { if(enterFn) enterFn(); }
        }
      );
    }

    /* ---- Screen: hero ---- */
    function playHero(){
      const tl = gsap.timeline();
      tl.from('.heart-mark', { opacity:0, y:14, duration:.7, ease:'power2.out' })
        .from('.hero-title', { opacity:0, y:22, duration:.9, ease:'power2.out' }, '-=.4')
        .from('.hero-poem', { opacity:0, y:16, duration:.8, ease:'power2.out' }, '-=.5')
        .from('.hero-sub', { opacity:0, y:12, duration:.7, ease:'power2.out' }, '-=.5')
        .from('.cta-btn', { opacity:0, y:14, scale:.94, duration:.7, ease:'back.out(1.6)' }, '-=.4')
        .call(() => $('.cta-btn').classList.add('sheen'));
    }

    /* ---- Screen: verify ---- */
    function playVerify(){
      const messages = [
        'Verificando tu invitación...',
        'Preparando una sorpresa...',
        'Buscando tu regalo...'
      ];
      els.verifyText.textContent = messages[0];
      gsap.set(els.progressFill, { width: '0%' });

      const tl = gsap.timeline({ onComplete: () => goTo('vault', playVaultDescend) });
      tl.to(els.progressFill, { width: '38%', duration: 1.0, ease: 'power1.inOut' })
        .call(() => { els.verifyText.textContent = messages[1]; })
        .to(els.progressFill, { width: '72%', duration: 1.0, ease: 'power1.inOut' })
        .call(() => { els.verifyText.textContent = messages[2]; })
        .to(els.progressFill, { width: '100%', duration: 0.9, ease: 'power1.inOut' })
        .to({}, { duration: 0.4 });
    }

    /* ---- Screen: vault (descend -> ready -> open) ---- */
    function playVaultDescend(){
      gsap.set(els.tube, { y: -260, opacity: 0, rotateZ: -6 });
      gsap.set(els.vaultLight, { opacity: 0 });
      gsap.set(els.vaultHint, { opacity: 0, y: 10 });

      const tl = gsap.timeline({ onComplete: enableVaultTap });
      tl.to(els.vaultLight, { opacity: 1, duration: 0.8, ease: 'power2.out' })
        .to(els.tube, { y: 0, opacity: 1, rotateZ: 0, duration: 1.6, ease: 'power3.out' }, '-=.4')
        .to(els.vaultLight, { opacity: 0.4, duration: 0.6 }, '-=.3')
        .to(els.vaultHint, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=.2')
        .call(() => startTubeFloat());
    }

    function startTubeFloat(){
      if(prefersReducedMotion) return;
      gsap.to(els.tube, {
        y: '+=10',
        duration: 2.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    }

    function enableVaultTap(){
      els.tube.classList.add('is-tappable');
      const handler = () => {
        els.tube.removeEventListener('click', handler);
        els.tube.classList.remove('is-tappable');
        openVault();
      };
      els.tube.addEventListener('click', handler);
    }

    function openVault(){
      AudioManager.play('unlock');
      vibrate([16, 40, 16]);
      gsap.killTweensOf(els.tube);

      const rect = els.tube.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const tl = gsap.timeline({ onComplete: () => goTo('prize', playPrize) });
      tl.to(els.tube, { rotateZ: -3, duration: 0.08, ease: 'power1.inOut' })
        .to(els.tube, { rotateZ: 3, duration: 0.08, ease: 'power1.inOut' })
        .to(els.tube, { rotateZ: 0, duration: 0.12, ease: 'power1.inOut' })
        .call(() => { FX.ringPulse(cx, cy); })
        .to(els.lightRays, { opacity: 1, rotate: 40, duration: 1.4, ease: 'power2.out' }, '-=.05')
        .call(() => AudioManager.play('scroll'))
        .to(els.tube, { opacity: 0, scale: 0.9, duration: 0.5, ease: 'power1.in' }, '-=.9')
        .to(els.blueprint, { opacity: 1, scaleY: 1, duration: 1.3, ease: 'power3.out' }, '-=1.1')
        .call(() => { AudioManager.play('sparkle'); FX.confettiBurst(); vibrate(30); })
        .to(els.blueprint, { rotateZ: -1.1, duration: 0.18, ease: 'sine.inOut' })
        .to(els.blueprint, { rotateZ: 0.6, duration: 0.18, ease: 'sine.inOut' })
        .to(els.blueprint, { rotateZ: 0, duration: 0.18, ease: 'sine.inOut' })
        .to(els.lightRays, { opacity: 0, duration: 0.8, ease: 'power1.in' }, '-=.3')
        .to({}, { duration: 0.9 });
    }

    /* ---- Screen: prize ---- */
    function playPrize(){
      const data = PRIZES[window.PRIZE_TYPE] || PRIZES.default;
      els.prizeEmoji.textContent = data.emoji;
      els.prizeTitle.textContent = data.title;
      els.prizeSubtitle.textContent = data.subtitle;
      els.prizeDesc.textContent = data.desc;
      els.prizeCta.textContent = data.cta;
      els.prizeCta.classList.remove('is-saved');

      const tl = gsap.timeline();
      tl.from(els.prizeEmoji, { opacity:0, scale:.6, y:10, duration:.8, ease:'back.out(1.7)' })
        .from(els.prizeTitle, { opacity:0, y:14, duration:.6, ease:'power2.out' }, '-=.4')
        .from(els.prizeSubtitle, { opacity:0, y:12, duration:.6, ease:'power2.out' }, '-=.35')
        .from(els.prizeDesc, { opacity:0, y:10, duration:.6, ease:'power2.out' }, '-=.35')
        .from(els.prizeCta, { opacity:0, y:10, duration:.6, ease:'power2.out' }, '-=.3');

      if(!prefersReducedMotion){
        gsap.to(els.prizeEmoji, { y: '+=8', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
      }

      const ctaHandler = () => {
        els.prizeCta.removeEventListener('click', ctaHandler);
        els.prizeCta.classList.add('is-saved');
        els.prizeCta.textContent = '✓ Guardado';
        AudioManager.play('click');
        const rect = els.prizeCta.getBoundingClientRect();
        FX.ringPulse(rect.left + rect.width / 2, rect.top + rect.height / 2);
        FX.confettiBurst(12);
        gsap.delayedCall(1.4, () => goTo('final', playFinal));
      };
      els.prizeCta.addEventListener('click', ctaHandler);
    }

    /* ---- Screen: final ---- */
    function playFinal(){
      const tl = gsap.timeline();
      tl.from(els.finalCard, { opacity:0, y:26, scale:.96, duration:.9, ease:'power3.out' })
        .to('.final-eyebrow', { opacity:1, duration:.6, ease:'power2.out' }, '-=.3')
        .to($$('.final-msg'), { opacity:1, y:0, duration:.7, stagger:.25, ease:'power2.out' }, '-=.2')
        .to('.final-heart', { opacity:1, scale:1.15, duration:.5, ease:'back.out(2)' }, '-=.1')
        .to('.final-heart', { scale:1, duration:.3 })
        .to('.final-sign', { opacity:1, duration:.7, ease:'power2.out' }, '-=.2')
        .to('.final-outro', { opacity:1, duration:.8, ease:'power2.out' }, '+=.6')
        .call(() => { AudioManager.play('sparkle'); FX.confettiBurst(isLowPower ? 10 : 20); });

      // Quiet Easter egg: tapping the finished card gently replays the
      // closing confetti — a small reward for lingering.
      els.finalCard.addEventListener('click', () => {
        FX.confettiBurst(10);
        vibrate(12);
      });
    }

    function start(){
      cacheEls();
      current = els.hero;
      els.hero.classList.add('active');
      gsap.set(els.hero, { opacity: 1 });
      playHero();
    }

    function beginJourney(){
      goTo('verify', playVerify);
    }

    return { start, beginJourney };
  })();

  /* ------------------------------------------------------------------ */
  /* 7. Init                                                              */
  /* ------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
    ParticleField.init();
    FX.init();
    Scenes.start();

    const startBtn = $('#start-btn');
    const audioToggle = $('#audio-toggle');

    if(startBtn){
      startBtn.addEventListener('click', () => {
        AudioManager.start();
        vibrate(10);
        AudioManager.play('click');
        Scenes.beginJourney();
      }, { once: true });
    }

    if(audioToggle){
      audioToggle.classList.add('is-visible');
      audioToggle.addEventListener('click', () => {
        const on = AudioManager.toggle();
        audioToggle.classList.toggle('is-muted', !on);
        audioToggle.setAttribute('aria-label', on ? 'Silenciar música' : 'Activar música');
      });
    }
  });

})();
