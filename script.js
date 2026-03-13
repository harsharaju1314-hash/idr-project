'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const isMobile = () => window.innerWidth <= 768;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Custom cursor */
if (!isMobile()) {
  const dot  = document.createElement('div'); dot.id  = 'cursor-dot';
  const ring = document.createElement('div'); ring.id = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function animCursor() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animCursor);
  })();

  const hoverEls = 'a, button, .service-card, .community-card, .acard, .tag-badge, input, select, textarea, .nav-link';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* Canvas background — animated node network */
const heroSection = $('.hero-section');
if (heroSection && !prefersReducedMotion) {
  const canvas = document.createElement('canvas');
  canvas.id = 'heroCanvas';
  heroSection.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let nodes = [];
  const NODE_COUNT = isMobile() ? 28 : 55;
  const MAX_DIST   = isMobile() ? 100 : 160;
  const ORANGE     = [255, 107, 53];

  function resize() {
    canvas.width  = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  1 + Math.random() * 2,
    });
  }

  let mouseX = -999, mouseY = -999;
  heroSection.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });
  heroSection.addEventListener('mouseleave', () => { mouseX = -999; mouseY = -999; });

  function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      const dx = n.x - mouseX, dy = n.y - mouseY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        n.vx += (dx / dist) * 0.04;
        n.vy += (dy / dist) * 0.04;
        const speed = Math.sqrt(n.vx*n.vx + n.vy*n.vy);
        if (speed > 1.5) { n.vx = (n.vx/speed)*1.5; n.vy = (n.vy/speed)*1.5; }
      }
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i+1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${ORANGE.join(',')},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${ORANGE.join(',')},0.55)`;
      ctx.fill();
    });
    requestAnimationFrame(drawCanvas);
  }
  drawCanvas();
}

/* Floating particles */
const particleContainer = $('#heroParticles');
if (particleContainer) {
  function spawnParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    const drift = (Math.random() - 0.5) * 120;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${75 + Math.random() * 25}%;
      width: ${1.5 + Math.random() * 3.5}px;
      height: ${1.5 + Math.random() * 3.5}px;
      --drift: ${drift}px;
      animation-duration: ${7 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 3}s;
    `;
    particleContainer.appendChild(p);
    setTimeout(() => p.remove(), 22000);
  }
  for (let i = 0; i < 20; i++) setTimeout(spawnParticle, i * 180);
  setInterval(spawnParticle, 700);
}

/* Sticky nav + mobile menu */
const header    = $('#header');
const navToggle = $('#navToggle');
const navLinks  = $('#navLinks');
const navLinkEls= $$('.nav-link');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinkEls.forEach(l => {
  l.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});
document.addEventListener('click', e => {
  if (!header.contains(e.target) && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

const sectionEls = $$('section[id]');
if (sectionEls.length) {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinkEls.forEach(l => l.classList.remove('active'));
        const a = $(`a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.35 }).observe(...sectionEls);
}

/* Typing effect */
const phrases = ['Digital Risk', 'Cyber Resilience', 'AI Governance', 'Tech Risk'];
const typedEl = $('#typedText');
let pi = 0, ci = 0, del = false;

function type() {
  if (!typedEl) return;
  const cur = phrases[pi];
  if (!del) {
    typedEl.textContent = cur.slice(0, ++ci);
    if (ci === cur.length) { del = true; return setTimeout(type, 2600); }
    setTimeout(type, 72);
  } else {
    typedEl.textContent = cur.slice(0, --ci);
    if (ci === 0) { del = false; pi = (pi+1) % phrases.length; return setTimeout(type, 420); }
    setTimeout(type, 40);
  }
}
setTimeout(type, 900);

/* Scroll reveal */
const animObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = $$('[data-animate]', entry.target.closest('section') || entry.target.parentElement);
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 120);
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
$$('[data-animate]').forEach(el => animObserver.observe(el));

/* Stats counter */
function animCount(el, target, dur = 2000) {
  const start = performance.now();
  const tick  = now => {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(ease * target);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const heroStats = $('.hero-stats');
if (heroStats) {
  let counted = false;
  const runCounters = () => {
    if (counted) return;
    counted = true;
    $$('.stat-num', heroStats).forEach(el => animCount(el, +el.dataset.target));
  };
  new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) runCounters(); });
  }, { threshold: 0.2 }).observe(heroStats);
  // Fallback: run after 1.5s if observer hasn't fired
  setTimeout(runCounters, 1500);
}

/* Pipeline lines + traveling dot */
const pipelineWrapper = $('.pipeline-wrapper');
if (pipelineWrapper) {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$('.step-line-animate').forEach((line, i) => {
          setTimeout(() => {
            line.style.transform = 'scaleX(1)';
            setTimeout(() => {
              const dot = document.createElement('div');
              dot.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);width:8px;height:8px;border-radius:50%;background:var(--orange);box-shadow:0 0 14px var(--orange);';
              line.parentElement.appendChild(dot);
              dot.animate([
                { left: '0%', opacity: 0 },
                { left: '5%', opacity: 1 },
                { left: '95%', opacity: 1 },
                { left: '100%', opacity: 0 },
              ], { duration: 1200, fill: 'forwards' });
              setTimeout(() => dot.remove(), 1500);
            }, 200);
          }, i * 320 + 200);
        });
      }
    });
  }, { threshold: 0.35 }).observe(pipelineWrapper);
}

/* ── Canvas 3D Cube ── */
(function initCube() {
  const canvas = document.getElementById('cubeCanvas');
  if (!canvas) return;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width  = w * DPR;
    canvas.height = h * DPR;
  }
  resize();
  window.addEventListener('resize', resize);

  const ctx = canvas.getContext('2d');
  const O   = [255, 107, 53]; 

  // faces defined by vertices (winding order doesn't matter much if we aren't culling, but painter's algorithm fixes overlap)
  const FACES = [
    { v:[0,1,2,3], fill:0.04, edge:0.4 }, // back
    { v:[4,5,6,7], fill:0.12, edge:0.9 }, // front
    { v:[0,4,7,3], fill:0.08, edge:0.6 }, // left
    { v:[1,5,6,2], fill:0.15, edge:0.8 }, // right
    { v:[3,2,6,7], fill:0.20, edge:1.0 }, // top (relative)
    { v:[0,1,5,4], fill:0.06, edge:0.5 }, // bottom (relative)
  ];

  function rotX(v, a) {
    const c=Math.cos(a),s=Math.sin(a);
    return [v[0], v[1]*c-v[2]*s, v[1]*s+v[2]*c];
  }
  function rotY(v, a) {
    const c=Math.cos(a),s=Math.sin(a);
    return [v[0]*c+v[2]*s, v[1], -v[0]*s+v[2]*c];
  }
  function rotZ(v, a) {
    const c=Math.cos(a),s=Math.sin(a);
    return [v[0]*c-v[1]*s, v[0]*s+v[1]*c, v[2]];
  }
  function project(v, fov, cx, cy) {
    const z = v[2] + fov;
    const scale = fov / z;
    return [v[0]*scale + cx, v[1]*scale + cy, v[2]];
  }

  let angleY = 0, angleX = 0, angleZ = 0; 
  let targetX = 0.4, targetY = -0.5;
  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  function draw() {
    const W = canvas.width, H = canvas.height;
    if (W === 0 || H === 0) {
      requestAnimationFrame(draw);
      return;
    }

    try {
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const S = (W / DPR) * 0.30; 
      const FOV = W * 1.5;

      const V = [
        [-S,-S,-S],[S,-S,-S],[S,S,-S],[-S,S,-S],
        [-S,-S, S],[S,-S, S],[S,S, S],[-S,S, S]
      ];

      targetY += (angleY + mx * 0.8 - targetY) * 0.04;
      targetX += (angleX + my * 0.5 - targetX) * 0.04;
      angleY  += 0.005; 
      angleX  += 0.002;
      angleZ  += 0.001;

      const rv = V.map(v => {
        let r = rotX(v, targetX + 0.3);
        r = rotY(r, targetY);
        return rotZ(r, angleZ);
      });

      const pv = rv.map(v => project(v, FOV, cx, cy));

      const sorted = FACES.map((f) => {
        const avgZ = f.v.reduce((s, vi) => s + rv[vi][2], 0) / 4;
        return { f, avgZ };
      }).sort((a,b) => b.avgZ - a.avgZ); 

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(0.1, S * 1.2), 0, Math.PI*2);
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(0.1, S * 1.2));
      grd.addColorStop(0, `rgba(${O}, 0.25)`);
      grd.addColorStop(1, `rgba(${O}, 0)`);
      ctx.fillStyle = grd;
      ctx.fill();

      const r1 = Math.max(0.1, S * 2.2), r2 = Math.max(0.1, S * 2.8);
      ctx.save();
      ctx.translate(cx, cy);
      
      ctx.rotate(targetY * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, r1, r1 * 0.3, 0.2, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(${O}, 0.2)`;
      ctx.lineWidth = 1.5 * DPR;
      ctx.stroke();

      ctx.rotate(-targetY * 0.8);
      ctx.setLineDash([8*DPR, 12*DPR]);
      ctx.beginPath();
      ctx.ellipse(0, 0, r2, r2 * 0.2, -0.4, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(${O}, 0.15)`;
      ctx.stroke();
      
      ctx.restore();

      sorted.forEach(({ f, avgZ }) => {
        const pts = f.v.map(vi => pv[vi]);
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.closePath();
        
        const depthRatio = Math.max(0, Math.min(1, (avgZ + S) / (2 * S)));
        const baseAlpha = Number(f.fill);
        const dynamicFill = baseAlpha + (0.15 * (1 - depthRatio));
        
        ctx.fillStyle   = `rgba(${O}, ${dynamicFill})`;
        ctx.strokeStyle = `rgba(${O}, ${f.edge * (1.2 - depthRatio * 0.6)})`;
        ctx.lineWidth   = (0.5 + (1.5 * (1 - depthRatio))) * DPR; 
        
        ctx.fill();
        ctx.stroke();
      });
    } catch(err) {
      console.error(err);
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* Magnetic buttons */
if (!isMobile() && !prefersReducedMotion) {
  $$('.btn, .nav-link.nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2))  * 0.28;
      const dy = (e.clientY - (r.top  + r.height/2)) * 0.28;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s ease';
      setTimeout(() => btn.style.transition = '', 400);
    });
  });
}

/* Card spotlight */
$$('.service-card, .community-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
  });
});

/* Service card 3D tilt */
if (!isMobile() && !prefersReducedMotion) {
  $$('.service-card').forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange     = 'transform';
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `translateY(-10px) rotateX(${-y*7}deg) rotateY(${x*7}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s ease, box-shadow 0.35s ease, border-color 0.35s ease';
      card.style.transform  = '';
      setTimeout(() => card.style.transition = '', 550);
    });
  });
}

/* About cards entrance */
$$('.acard').forEach(c => {
  c.style.opacity   = '0';
  c.style.transform = 'translateX(36px)';
  c.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});
const aboutVisual = $('.about-visual');
if (aboutVisual) {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$('.acard', e.target).forEach((c, i) =>
          setTimeout(() => { c.style.opacity='1'; c.style.transform='translateX(0)'; }, i*180));
      }
    });
  }, { threshold: 0.2 }).observe(aboutVisual);
}

/* Section headers fade in */
$$('.section-header').forEach(h => {
  h.style.opacity   = '0';
  h.style.transform = 'translateY(30px)';
  h.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      entries[0].target.style.opacity   = '1';
      entries[0].target.style.transform = 'translateY(0)';
    }
  }, { threshold: 0.2 }).observe(h);
});

/* Logo hover effect */
const logoAbbr = $('.logo-abbr');
if (logoAbbr) {
  const chars = 'IDR!@#$%&*';
  let timer;
  $('.nav-logo').addEventListener('mouseenter', () => {
    let flips = 0;
    timer = setInterval(() => {
      if (flips++ > 6) { logoAbbr.textContent = 'IDR'; clearInterval(timer); return; }
      logoAbbr.textContent = chars[Math.floor(Math.random()*chars.length)]
        + chars[Math.floor(Math.random()*chars.length)]
        + chars[Math.floor(Math.random()*chars.length)];
    }, 55);
  });
  $('.nav-logo').addEventListener('mouseleave', () => { clearInterval(timer); logoAbbr.textContent = 'IDR'; });
}

/* Smooth scroll */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  });
});

/* Contact form */
const form      = $('#contactForm');
const formOk    = $('#formSuccess');
const submitBtn = $('#submitBtn');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const valid = f.value.trim() !== '';
      f.style.borderColor = valid ? '' : 'rgba(255,80,80,0.6)';
      f.style.boxShadow   = valid ? '' : '0 0 0 3px rgba(255,80,80,0.1)';
      if (!valid) ok = false;
    });
    if (!ok) return;
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Submitting…';
    await new Promise(r => setTimeout(r, 1300));
    form.reset();
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Register Interest';
    formOk.classList.add('visible');
    setTimeout(() => formOk.classList.remove('visible'), 5500);
  });
  $$('[required]', form).forEach(f => {
    f.addEventListener('input', () => {
      if (f.value.trim()) { f.style.borderColor = ''; f.style.boxShadow = ''; }
    });
  });
}

/* Footer year */
const yr = $('.footer-reg');
if (yr) yr.innerHTML = yr.innerHTML.replace(/\d{4}/, new Date().getFullYear());
