// ===== VELOCE MOTORS - script.js =====
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = window.innerWidth < 768;

  // ---------- Loader ----------
  const loader = document.getElementById('loader');
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    loader.classList.add('hidden');
    startShatter();
  };
  window.addEventListener('load', () => setTimeout(start, 600));
  setTimeout(start, 4000); // fallback if some asset is slow

  // ---------- Custom Cursor ----------
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let mx = 0, my = 0, fx = 0, fy = 0;
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    (function follow() {
      fx += (mx - fx) * 0.15; fy += (my - fy) * 0.15;
      follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();
    document.querySelectorAll('a, button, .gallery-item, .car-card').forEach(el => {
      el.addEventListener('mouseenter', () => follower.classList.add('active'));
      el.addEventListener('mouseleave', () => follower.classList.remove('active'));
    });
  }

  // ---------- Navbar ----------
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  }));

  // ---------- Shatter Intro ----------
  function startShatter() {
    const container = document.getElementById('shatterContainer');
    const img = document.getElementById('carImage');
    let ran = false;

    const finish = () => {
      container.classList.add('done');
      showHeroContent();
    };

    const run = () => {
      if (ran) return;
      ran = true;
      if (reduceMotion || isSmall || !img.naturalWidth) { finish(); return; }

      // Tiles are positioned inside the (position:absolute) container,
      // exactly over the image's rendered box.
      const cRect = container.getBoundingClientRect();
      const iRect = img.getBoundingClientRect();
      const left = iRect.left - cRect.left, top = iRect.top - cRect.top;
      const w = iRect.width, h = iRect.height;
      const cols = 10, rows = 6;
      const tw = w / cols, th = h / rows;
      const tiles = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const el = document.createElement('div');
          el.className = 'tile';
          Object.assign(el.style, {
            left: `${left + c * tw}px`, top: `${top + r * th}px`,
            width: `${Math.ceil(tw) + 1}px`, height: `${Math.ceil(th) + 1}px`,
            backgroundImage: `url("${img.currentSrc || img.src}")`,
            backgroundSize: `${w}px ${h}px`,
            backgroundPosition: `-${c * tw}px -${r * th}px`,
            opacity: '0'
          });
          const dx = (Math.random() - 0.5) * window.innerWidth * 1.4;
          const dy = (Math.random() - 0.5) * window.innerHeight * 1.4;
          const rot = (Math.random() - 0.5) * 720;
          el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.4)`;
          el.style.filter = 'blur(6px)';
          el.style.transitionDelay = `${(r + c) * 35}ms`;
          container.appendChild(el);
          tiles.push(el);
        }
      }

      // Force layout, then fly tiles back together
      container.offsetHeight;
      requestAnimationFrame(() => {
        tiles.forEach(t => {
          t.style.transform = 'translate(0,0) rotate(0) scale(1)';
          t.style.opacity = '1';
          t.style.filter = 'blur(0)';
        });
      });

      // Show the full image under tiles
      setTimeout(() => { img.style.transition = 'opacity .4s'; img.style.opacity = '1'; }, 2400);

      // Cleanup & show content
      setTimeout(() => {
        tiles.forEach(t => t.remove());
        setTimeout(finish, 600);
      }, 3000);
    };

    // Works whether the image is still loading or already cached
    if (img.complete && img.naturalWidth) run();
    else {
      img.addEventListener('load', run, { once: true });
      img.addEventListener('error', () => { ran = true; finish(); }, { once: true });
    }
  }

  function showHeroContent() {
    const headline = document.getElementById('headline');
    if (headline.dataset.done) return;
    headline.dataset.done = '1';
    const text = headline.textContent;
    headline.innerHTML = '';
    let i = 0;
    text.split(' ').forEach((word, w, arr) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      word.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        span.style.transitionDelay = `${i++ * 40}ms`;
        wordSpan.appendChild(span);
      });
      headline.appendChild(wordSpan);
      if (w < arr.length - 1) headline.appendChild(document.createTextNode(' '));
    });

    document.getElementById('heroContent').style.opacity = '1';

    setTimeout(() => {
      headline.querySelectorAll('.char').forEach(s => {
        s.style.opacity = '1';
        s.style.transform = 'translateY(0)';
      });
    }, 100);

    setTimeout(() => {
      const sub = document.querySelector('.subtext');
      sub.style.opacity = '1';
      sub.style.transform = 'translateY(0)';
    }, 800);

    setTimeout(() => {
      const btns = document.querySelector('.hero-buttons');
      btns.style.opacity = '1';
      btns.style.transform = 'translateY(0)';
    }, 1100);
  }

  // ---------- Scroll Reveal ----------
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ---------- Stats Counter ----------
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const num = entry.target.querySelector('.stat-number');
        const target = +num.dataset.target;
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            num.textContent = target;
            clearInterval(timer);
          } else {
            num.textContent = Math.floor(current);
          }
        }, 30);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat').forEach(el => statsObserver.observe(el));

  // ---------- Gallery Lightbox ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      lightboxImg.src = item.dataset.src;
      lightbox.classList.add('active');
    });
  });
  const closeLightbox = () => lightbox.classList.remove('active');
  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // ---------- Testimonials Carousel ----------
  const testimonials = document.querySelectorAll('.testimonial');
  let current = 0;
  if (testimonials.length > 1) {
    setInterval(() => {
      testimonials[current].classList.remove('active');
      current = (current + 1) % testimonials.length;
      testimonials[current].classList.add('active');
    }, 5000);
  }

  // ---------- Booking Form ----------
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');
  const dateInput = document.getElementById('date');
  dateInput.min = new Date().toISOString().split('T')[0];
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    success.classList.add('show');
  });

  // ---------- Parallax Gallery (on images, not the .reveal items) ----------
  if (!reduceMotion && !isSmall) {
    const galleryImgs = document.querySelectorAll('.gallery-item img');
    let ticking = false;
    const parallax = () => {
      galleryImgs.forEach((img, i) => {
        const rect = img.parentElement.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const speed = 20 + (i % 3) * 8; // px
        img.style.transform = `translateY(${(-offset * speed).toFixed(1)}px) scale(1.2)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }
});
