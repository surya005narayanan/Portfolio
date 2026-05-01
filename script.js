/* ── Particle canvas ── */
(function initParticles() {
  const container = document.getElementById('hero-particles');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#8b5cf6', '#f59e0b', '#06b6d4', '#a78bfa'];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });
    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
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

/* ── Tilt effect on cards ── */
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
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
  const roles = ['AI Developer', 'ML Engineer', 'LLM Architect', 'Agent Builder'];
  const el = document.querySelector('.hero-sub');
  if (!el) return;
  // Only runs if you add a typed-role span; skip otherwise
})();
