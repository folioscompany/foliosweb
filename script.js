/* ============================================================
   FoliOS — Landing Page JavaScript
   Funcionalidades: scroll animations, header, formulario,
   upload simulado, navegación entre módulos
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
     1. HEADER — comportamiento al hacer scroll
  ────────────────────────────────────────────────────────── */
  const header = document.querySelector('.site-header');

  const handleHeaderScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });


  /* ──────────────────────────────────────────────────────────
     2. MENÚ MOBILE — toggle hamburguesa
  ────────────────────────────────────────────────────────── */
  const menuToggle  = document.querySelector('.menu-toggle');
  const mobileNav   = document.querySelector('.mobile-nav');

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
    threshold:  0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Dejar de observar una vez que ya animó
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
     5. TARJETAS DE MÓDULOS — navegar a la sección de upload
        con el módulo preseleccionado
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.btn-explore-module').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const moduleValue = btn.dataset.module;

      // Seleccionar ese módulo en el selector de upload
      const uploadSelect = document.querySelector('#upload-module-select');
      if (uploadSelect && moduleValue) {
        uploadSelect.value = moduleValue;
        // Disparar change para actualizar UI si es necesario
        uploadSelect.dispatchEvent(new Event('change'));
      }

      // Desplazar a la sección de upload
      const uploadSection = document.querySelector('#section-upload');
      if (uploadSection) {
        const headerHeight = header ? header.offsetHeight : 0;
        const pos = uploadSection.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });


  /* ──────────────────────────────────────────────────────────
     6. FORMULARIO DEMO — validación y mensaje de éxito
  ────────────────────────────────────────────────────────── */
  const demoForm    = document.querySelector('#demo-form');
  const formSuccess = document.querySelector('#form-success');

  // Marcar checkboxes visualmente al hacer click
  document.querySelectorAll('.checkbox-item').forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    const updateState = () => {
      item.classList.toggle('checked', checkbox.checked);
    };

    // Inicializar estado
    updateState();
    checkbox.addEventListener('change', updateState);
    // Permitir click en toda la tarjeta
    item.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        updateState();
      }
    });
  });

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

    // Si todo está válido, NO usamos preventDefault.
    // El formulario se envía normalmente a Formspree.
  });
}


  /* ──────────────────────────────────────────────────────────
     7. UPLOAD SIMULADO — drag & drop y selector de archivos
  ────────────────────────────────────────────────────────── */
  const uploadArea     = document.querySelector('#upload-area');
  const fileInput      = document.querySelector('#file-input');
  const fileList       = document.querySelector('#file-list');
  const fileListItems  = document.querySelector('#file-list-items');
  const btnSelectFiles = document.querySelector('#btn-select-files');
  const btnSimProcess  = document.querySelector('#btn-sim-process');

  // Extensiones con iconos visuales
  const fileIcons = {
    pdf:  '📄',
    xlsx: '📊',
    xls:  '📊',
    csv:  '📋',
    docx: '📝',
    doc:  '📝',
    png:  '🖼️',
    jpg:  '🖼️',
    jpeg: '🖼️',
    zip:  '🗜️',
    default: '📁'
  };

  // Formatear tamaño de archivo
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Agregar archivos a la lista visual
  const addFilesToList = (files) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      const icon = fileIcons[ext] || fileIcons.default;

      const item = document.createElement('div');
      item.classList.add('file-item');
      item.innerHTML = `
        <span class="file-icon">${icon}</span>
        <span class="file-name">${escapeHtml(file.name)}</span>
        <span class="file-size">${formatSize(file.size)}</span>
        <span class="file-badge">Listo</span>
      `;

      fileListItems.appendChild(item);
    });

    fileList.classList.add('show');
    if (btnSimProcess) btnSimProcess.style.display = 'inline-flex';
  };

  // Seguridad: escapar HTML en nombres de archivo
  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  };

  // Abrir selector al hacer click en el botón
  if (btnSelectFiles && fileInput) {
    btnSelectFiles.addEventListener('click', () => fileInput.click());
  }

  // Abrir selector al hacer click en el área (pero no en el botón)
  if (uploadArea) {
    uploadArea.addEventListener('click', (e) => {
      if (e.target.closest('#btn-select-files')) return;
      fileInput && fileInput.click();
    });
  }

  // Seleccionar archivos mediante input
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      addFilesToList(fileInput.files);
      // Reset para permitir seleccionar el mismo archivo de nuevo
      fileInput.value = '';
    });
  }

  // Drag & Drop events
  if (uploadArea) {
    ['dragenter', 'dragover'].forEach(evt => {
      uploadArea.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('dragging');
      });
    });

    ['dragleave', 'dragend'].forEach(evt => {
      uploadArea.addEventListener(evt, (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
      });
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('dragging');

      const droppedFiles = e.dataTransfer.files;
      addFilesToList(droppedFiles);
    });
  }

  // Botón de procesar (simulado)
  if (btnSimProcess) {
    btnSimProcess.addEventListener('click', () => {
      btnSimProcess.textContent = 'Procesando...';
      btnSimProcess.disabled = true;
      btnSimProcess.style.opacity = '0.7';

      setTimeout(() => {
        // Marcar todos los items como procesados
        document.querySelectorAll('#file-list-items .file-badge').forEach(badge => {
          badge.textContent = '✓ Procesado';
          badge.style.background = 'var(--color-accent-pale)';
          badge.style.color = 'var(--color-accent)';
        });

        btnSimProcess.textContent = '✓ Procesado (simulación)';
        btnSimProcess.style.opacity = '0.5';
      }, 1800);
    });
  }


  /* ──────────────────────────────────────────────────────────
     8. CONTADOR ANIMADO para las estadísticas narrativas
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
   Keyframes adicionales vía CSS-in-JS para shake y fadeInUp
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
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
