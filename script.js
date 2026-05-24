/* ============================================================
   FoliOS — Landing Page JavaScript
   Funcionalidades: scroll animations, header sticky, formulario
   Formspree, upload simulado, navegación entre módulos
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
     1. HEADER — comportamiento al hacer scroll
  ────────────────────────────────────────────────────────── */
  const header = document.querySelector('.site-header');

  const handleHeaderScroll = () => {
    if (window.scrollY > 16) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();


  /* ──────────────────────────────────────────────────────────
     2. MENÚ MOBILE — toggle hamburguesa
  ────────────────────────────────────────────────────────── */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav  = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar al hacer click en un enlace mobile
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', false);
      });
    });
  }


  /* ──────────────────────────────────────────────────────────
     3. ANIMACIONES DE SCROLL — IntersectionObserver
  ────────────────────────────────────────────────────────── */
  const animatedElements = document.querySelectorAll('.fade-up, .fade-in');

  const observerOptions = {
    threshold:  0.10,
    rootMargin: '0px 0px -40px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => scrollObserver.observe(el));


  /* ──────────────────────────────────────────────────────────
     4. NAVEGACIÓN SUAVE — anclas del header y botones
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });


  /* ──────────────────────────────────────────────────────────
     5. TARJETAS DE MÓDULOS — navegar al formulario y pre-marcar
        el checkbox del módulo correspondiente
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.btn-explore-module').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const moduleValue = btn.dataset.module;

      // Pre-marcar el checkbox del módulo
      if (moduleValue) {
        const checkbox = document.querySelector(`input[name="modulo[]"][value="${moduleValue}"]`);
        if (checkbox && !checkbox.checked) {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      // Scroll al formulario
      const demoSection = document.querySelector('#section-demo');
      if (demoSection) {
        const headerHeight = header ? header.offsetHeight : 0;
        const pos = demoSection.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });


  /* ──────────────────────────────────────────────────────────
     6. FORMULARIO DEMO — validación + Formspree intacto
  ────────────────────────────────────────────────────────── */
  const demoForm    = document.querySelector('#demo-form');
  const formSuccess = document.querySelector('#form-success');

  // Marcar checkboxes visualmente
  document.querySelectorAll('.checkbox-item').forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    const updateState = () => {
      item.classList.toggle('checked', checkbox.checked);
    };

    updateState();
    checkbox.addEventListener('change', updateState);

    item.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        updateState();
      }
    });
  });

  // File input del formulario (PDF opcional) — reflejar estado en la etiqueta
  const informeInput = document.querySelector('#field-informe');
  const fileinputLabel = document.querySelector('#fileinput-label');
  const fileinputTitle = document.querySelector('#fileinput-title');
  const fileinputHint  = document.querySelector('#fileinput-hint');

  if (informeInput && fileinputLabel) {
    informeInput.addEventListener('change', () => {
      const file = informeInput.files && informeInput.files[0];
      if (file) {
        fileinputLabel.classList.add('has-file');
        if (fileinputTitle) fileinputTitle.textContent = file.name;
        if (fileinputHint)  fileinputHint.textContent  = `${(file.size / 1048576).toFixed(2)} MB · Listo para enviar`;
      } else {
        fileinputLabel.classList.remove('has-file');
        if (fileinputTitle) fileinputTitle.textContent = 'Adjuntar PDF';
        if (fileinputHint)  fileinputHint.textContent  = 'Solo archivos .pdf · Máx. 10 MB';
      }
    });
  }

  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      const nombre  = demoForm.querySelector('#field-nombre');
      const empresa = demoForm.querySelector('#field-empresa');
      const correo  = demoForm.querySelector('#field-correo');
      let valid = true;

      [nombre, empresa, correo].forEach(field => {
        if (!field) return;
        if (!field.value.trim()) {
          field.style.borderColor = '#ff453a';
          valid = false;
          field.addEventListener('input', () => {
            field.style.borderColor = '';
          }, { once: true });
        }
      });

      if (correo && correo.value && !/\S+@\S+\.\S+/.test(correo.value)) {
        correo.style.borderColor = '#ff453a';
        valid = false;
      }

      if (!valid) {
        e.preventDefault();

        const submitBtn = demoForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.style.animation = 'shake 0.4s ease';
          setTimeout(() => { submitBtn.style.animation = ''; }, 400);
        }
        return;
      }

      // Si todo está válido: NO usamos preventDefault.
      // El form se envía normalmente a Formspree (mkoebaqy).
    });
  }


  /* ──────────────────────────────────────────────────────────
     7. CONTADOR ANIMADO para las estadísticas
  ────────────────────────────────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');

  const animateCounter = (el) => {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 1800;
    const start    = performance.now();

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current  = target * easeOut(progress);
      const decimals = Number.isInteger(target) ? 0 : 1;

      el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

});


/* ──────────────────────────────────────────────────────────
   Keyframes adicionales para shake en validación
────────────────────────────────────────────────────────── */
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;
document.head.appendChild(style);
