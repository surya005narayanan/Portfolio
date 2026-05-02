/* ── Deep Space Canvas: Multi-layer parallax starfield + shooting comets ── */
(function initCosmicCanvas() {
  const canvas = document.getElementById('cosmos-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  let mouseX = -9999, mouseY = -9999;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Track mouse for star repulsion ── */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  /* ── Star layers (3 depths) ── */
  const STAR_COLORS = ['#ffffff', '#a78bfa', '#fbbf24', '#c4b5fd', '#fde68a', '#ddd6fe'];
  const layers = [
    { count: 200, speedMultiplier: 0.1,  sizeRange: [0.3, 0.8],  alphaRange: [0.15, 0.3] },  // Far — tiny, dim
    { count: 120, speedMultiplier: 0.3,  sizeRange: [0.6, 1.4],  alphaRange: [0.3, 0.55] },  // Mid
    { count: 60,  speedMultiplier: 0.6,  sizeRange: [1.0, 2.2],  alphaRange: [0.5, 0.85] },  // Near — bright, crisp
  ];

  const allStars = [];
  layers.forEach((layer, layerIdx) => {
    for (let i = 0; i < layer.count; i++) {
      allStars.push({
        x: Math.random() * 3000,
        y: Math.random() * 3000,
        baseR: layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]),
        vx: (Math.random() - 0.5) * 0.15 * layer.speedMultiplier,
        vy: (Math.random() - 0.5) * 0.15 * layer.speedMultiplier,
        alpha: layer.alphaRange[0] + Math.random() * (layer.alphaRange[1] - layer.alphaRange[0]),
        twinkleSpeed: 0.005 + Math.random() * 0.02,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        layer: layerIdx,
        speedMultiplier: layer.speedMultiplier,
      });
    }
  });

  /* ── Shooting comets ── */
  const comets = [];
  const COMET_INTERVAL = 3000; // ms between spawns
  let lastCometTime = 0;

  function spawnComet(time) {
    const startSide = Math.random();
    let sx, sy, angle;
    if (startSide < 0.5) {
      sx = Math.random() * W;
      sy = -20;
      angle = Math.PI * (0.15 + Math.random() * 0.35);
    } else {
      sx = W + 20;
      sy = Math.random() * H * 0.5;
      angle = Math.PI * (0.6 + Math.random() * 0.3);
    }
    const speed = 6 + Math.random() * 8;
    comets.push({
      x: sx, y: sy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: 0.008 + Math.random() * 0.006,
      length: 60 + Math.random() * 80,
      width: 1 + Math.random() * 1.5,
      spawnTime: time,
    });
  }

  /* ── Animation loop ── */
  let time = 0;
  function draw(timestamp) {
    time = timestamp || 0;
    ctx.clearRect(0, 0, W, H);
    const scrollY = window.scrollY;

    /* Draw stars with parallax scroll offset */
    allStars.forEach(star => {
      // Parallax: far stars move less with scroll
      const parallaxY = scrollY * star.speedMultiplier * 0.3;
      let drawX = ((star.x + star.vx * time * 0.01) % W + W) % W;
      let drawY = ((star.y + star.vy * time * 0.01 - parallaxY) % H + H) % H;

      // Mouse repulsion
      const dx = drawX - mouseX;
      const dy = drawY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repelRadius = 120;
      if (dist < repelRadius && dist > 0) {
        const force = (1 - dist / repelRadius) * 25 * star.speedMultiplier;
        drawX += (dx / dist) * force;
        drawY += (dy / dist) * force;
      }

      // Twinkle
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.alpha * (0.6 + 0.4 * twinkle);
      const r = star.baseR * (0.85 + 0.15 * twinkle);

      ctx.beginPath();
      ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fill();

      // Near stars get a subtle glow
      if (star.layer === 2 && alpha > 0.5) {
        ctx.beginPath();
        ctx.arc(drawX, drawY, r * 3, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, r * 3);
        grd.addColorStop(0, star.color);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.globalAlpha = alpha * 0.15;
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;

    /* Spawn comets */
    if (time - lastCometTime > COMET_INTERVAL + Math.random() * 2000) {
      spawnComet(time);
      lastCometTime = time;
    }

    /* Draw comets */
    for (let i = comets.length - 1; i >= 0; i--) {
      const c = comets[i];
      c.x += c.vx;
      c.y += c.vy;
      c.life -= c.decay;

      if (c.life <= 0 || c.x < -200 || c.x > W + 200 || c.y > H + 200) {
        comets.splice(i, 1);
        continue;
      }

      // Comet trail gradient (purple → gold)
      const tailX = c.x - (c.vx / Math.sqrt(c.vx * c.vx + c.vy * c.vy)) * c.length * c.life;
      const tailY = c.y - (c.vy / Math.sqrt(c.vx * c.vx + c.vy * c.vy)) * c.length * c.life;
      const grad = ctx.createLinearGradient(tailX, tailY, c.x, c.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, `rgba(139, 92, 246, ${c.life * 0.4})`);
      grad.addColorStop(1, `rgba(245, 158, 11, ${c.life * 0.9})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(c.x, c.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = c.width * c.life;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Bright head glow
      ctx.beginPath();
      ctx.arc(c.x, c.y, 2 * c.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 191, 36, ${c.life})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ── Navbar scroll & Parallax effect ── */
const navbar = document.getElementById('navbar');
const parallaxShapes = document.querySelectorAll('.parallax-shape');
const progressBar = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  // Parallax shapes
  parallaxShapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.15;
    shape.style.transform = `translateY(${scrollY * speed}px) ${shape.style.transform.replace(/translateY\([^)]+\)/g, '')}`;
  });

  // Scroll Progress Bar
  if (progressBar) {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / scrollTotal) * 100;
    progressBar.style.width = progress + '%';
  }
}, { passive: true });

/* ── Active nav link highlighting ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));

/* ── Hamburger menu ── */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  const open = navLinksEl.style.display === 'flex';
  navLinksEl.style.display = open ? 'none' : 'flex';
  navLinksEl.style.flexDirection = 'column';
  navLinksEl.style.position = 'absolute';
  navLinksEl.style.top = '70px';
  navLinksEl.style.left = '0';
  navLinksEl.style.right = '0';
  navLinksEl.style.background = 'rgba(6,4,15,0.97)';
  navLinksEl.style.padding = '1rem 1.5rem';
  navLinksEl.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
  navLinksEl.style.backdropFilter = 'blur(20px)';
  if (open) navLinksEl.style.display = 'none';
});
navLinksEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinksEl.style.display = 'none';
}));

/* ── Scroll-reveal fade-up ── */
const fadeEls = document.querySelectorAll('.fade-up');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
fadeEls.forEach(el => revealObs.observe(el));

/* ── Apply fade-up to all section children ── */
document.querySelectorAll('.section .glass-card, .section-alt .glass-card, .timeline-item, .project-card, .skill-bento-card').forEach((el, i) => {
  el.classList.add('fade-up');
  el.setAttribute('data-delay', (i % 4) + 1);
  revealObs.observe(el);
});

/* ── Skill bar animation ── */
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(bar => bar.classList.add('animate'));
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skill-bento-card').forEach(c => skillObs.observe(c));

/* ── Tilt effect & Spotlight Border on cards ── */
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Spotlight border coords
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    
    // 3D Parallax Tilt
    const tiltX = (x / rect.width - 0.5) * 10;
    const tiltY = (y / rect.height - 0.5) * 10;
    card.style.transform = `perspective(1000px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)';
  });
});

/* ── Magnetic buttons ── */
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.7}px, ${y * 0.7}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0px, 0px)';
  });
});

/* ── EmailJS initialisation ──
   ⚠️  Replace the three strings below with YOUR real IDs from emailjs.com
   ─────────────────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY = 'ZUjSxPet_ErjXLt9x';   // Account → API Keys
const EMAILJS_SERVICE_ID = 'service_rxgglrm';   // Email Services → Service ID
const EMAILJS_TEMPLATE_ID = 'template_8a2zco6';  // Email Templates → Template ID

emailjs.init(EMAILJS_PUBLIC_KEY);

/* ── Contact form ── */
function handleFormSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById('btn-send-message');
  const btnText = btn.querySelector('.btn-text');
  const success = document.getElementById('form-success');
  const form = e.target;

  // Loading state
  btnText.textContent = 'Sending…';
  btn.disabled = true;

  // Collect form values into a template params object.
  // These keys must match the {{variables}} in your EmailJS template.
  const templateParams = {
    from_name: form.name.value,
    from_email: form.email.value,
    subject: form.subject.value || '(No subject)',
    message: form.message.value,
    to_email: 'msuryanarayanan05@gmail.com',
  };

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      // Success
      success.textContent = '✅ Message sent! I\'ll reply faster than a GPU inference call.';
      success.style.color = '#34d399';
      success.classList.add('show');
      form.reset();
    })
    .catch((err) => {
      // Error — show a friendly message and log for debugging
      console.error('EmailJS error:', err);
      success.textContent = '❌ Oops! Something went wrong. Try emailing me directly at msuryanarayanan05@gmail.com';
      success.style.color = '#f87171';
      success.classList.add('show');
    })
    .finally(() => {
      btnText.textContent = 'Send It 🚀';
      btn.disabled = false;
      setTimeout(() => success.classList.remove('show'), 6000);
    });
}

/* ── Cursor glow ── */
const glow = document.createElement('div');
glow.style.cssText = `
  position:fixed;width:300px;height:300px;border-radius:50%;
  background:radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%);
  pointer-events:none;z-index:9998;
  transform:translate(-50%,-50%);transition:left 0.1s,top 0.1s;
`;
document.body.appendChild(glow);
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
}, { passive: true });

/* ── Nav link active style ── */
const style = document.createElement('style');
style.textContent = `.nav-link.active{color:#a78bfa!important}`;
document.head.appendChild(style);

/* ── Typed text effect for hero sub-role ── */
(function typedEffect() {
  const roles = ['AI Developer', 'LLM Architect', 'Agent Builder'];
  const el = document.getElementById('typewriter-text');
  if (!el) return;
  
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function type() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      el.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }
    
    let typeSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && charIndex === currentRole.length) {
      typeSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 500; // Pause before new word
    }
    
    setTimeout(type, typeSpeed);
  }
  
  setTimeout(type, 1000);
})();
