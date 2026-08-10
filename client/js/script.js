document.addEventListener('DOMContentLoaded', () => {

  /* -------- Año dinámico en el footer -------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------- Tema claro / oscuro -------- */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('pv-theme', next); } catch (e) {}
    });
  }

  /* -------- Menú móvil -------- */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -------- Contenido de los modales del Blog --------
     Reemplaza estos textos por el contenido real de cada artículo,
     o cambia esto por una carga desde una API/JSON si el blog crece. */
  const blogContent = {
    'blog-1': {
      date: '01.07.2026',
      title: 'Título del artículo',
      body: 'Contenido completo del primer artículo del blog. Reemplaza este texto con el desarrollo real: contexto, hallazgos, metodología y conclusiones.'
    },
    'blog-2': {
      date: '18.06.2026',
      title: 'Título del artículo',
      body: 'Contenido completo del segundo artículo del blog. Reemplaza este texto con el desarrollo real.'
    },
    'blog-3': {
      date: '02.06.2026',
      title: 'Título del artículo',
      body: 'Contenido completo del tercer artículo del blog. Reemplaza este texto con el desarrollo real.'
    }
  };

  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');

  document.querySelectorAll('.link-more[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = blogContent[btn.dataset.modal];
      if (!data || !modalOverlay || !modalContent) return;
      modalContent.innerHTML = `<span class="mono">${data.date}</span><h2>${data.title}</h2><p>${data.body}</p>`;
      modalOverlay.classList.add('active');
    });
  });

  function closeModal() { if (modalOverlay) modalOverlay.classList.remove('active'); }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  /* -------- Modal de envío exitoso (formulario de contacto) -------- */
  const successModalOverlay = document.getElementById('successModalOverlay');
  const successModalClose = document.getElementById('successModalClose');
  const successModalOk = document.getElementById('successModalOk');

  function openSuccessModal() {
    if (successModalOverlay) successModalOverlay.classList.add('active');
  }
  function closeSuccessModal() {
    if (successModalOverlay) successModalOverlay.classList.remove('active');
  }
  if (successModalClose) successModalClose.addEventListener('click', closeSuccessModal);
  if (successModalOk) successModalOk.addEventListener('click', closeSuccessModal);
  if (successModalOverlay) {
    successModalOverlay.addEventListener('click', (e) => {
      if (e.target === successModalOverlay) closeSuccessModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSuccessModal();
    }
  });

  /* -------- Validación independiente por campo --------
     Cada campo se valida solo (en vivo, al escribir/salir del campo)
     y también todos juntos al intentar enviar el formulario. */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    const fieldValidators = {
      nombre: (value) => value.trim() !== '' || 'Ingrese su nombre o el de su empresa.',
      email: (value) => {
        if (value.trim() === '') return 'Ingrese su email.';
        const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        return valido || 'Ingrese un email válido (debe contener "@" y un dominio, ej: nombre@dominio.com).';
      },
      telefono: (value) => {
        if (value.trim() === '') return true; // opcional
        const soloValidos = /^[0-9+\-\s]+$/.test(value);
        if (!soloValidos) return 'El teléfono solo debe contener números.';
        const digitos = value.replace(/\D/g, '');
        return digitos.length >= 8 || 'Ingrese un teléfono válido (mínimo 8 dígitos).';
      },
      asunto: (value) => value.trim() !== '' || 'Ingrese un asunto.',
      mensaje: (value) => value.trim() !== '' || 'Escribe tu mensaje.'
    };

    function showError(input, message) {
      const wrapper = input.parentElement;
      const errorEl = document.getElementById('err-' + input.id);
      if (message === true || message === undefined) {
        wrapper.classList.remove('has-error');
        if (errorEl) errorEl.textContent = '';
        return true;
      }
      wrapper.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
      return false;
    }

    function validateField(input) {
      const validator = fieldValidators[input.name];
      if (!validator) return true;
      const result = validator(input.value);
      return showError(input, result === true ? true : result);
    }

    // El teléfono no deja escribir letras: filtra cualquier tecla que no
    // sea número, espacio, "+" o "-" apenas se ingresa.
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
      telefonoInput.addEventListener('input', () => {
        const limpio = telefonoInput.value.replace(/[^0-9+\-\s]/g, '');
        if (limpio !== telefonoInput.value) telefonoInput.value = limpio;
        validateField(telefonoInput);
      });
    }

    // Validación en vivo del resto de los campos: al escribir (si ya tenía
    // error) y al salir del campo.
    ['nombre', 'email', 'asunto', 'mensaje'].forEach((name) => {
      const input = contactForm.elements[name];
      if (!input) return;
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('has-error')) validateField(input);
      });
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let esValido = true;
      let primerCampoInvalido = null;
      Object.keys(fieldValidators).forEach((name) => {
        const input = contactForm.elements[name];
        if (!input) return;
        const ok = validateField(input);
        if (!ok) {
          esValido = false;
          if (!primerCampoInvalido) primerCampoInvalido = input;
        }
      });

      if (!esValido) {
        formStatus.textContent = 'Revise los campos marcados en rojo.';
        formStatus.className = 'form-status mono err';
        if (primerCampoInvalido) primerCampoInvalido.focus();
        return;
      }

      formStatus.textContent = 'Enviando…';
      formStatus.className = 'form-status mono';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm)
        });

        if (!response.ok) throw new Error('Error de red');

        formStatus.textContent = 'Mensaje enviado correctamente.';
        formStatus.className = 'form-status mono ok';
        contactForm.reset();
        contactForm.querySelectorAll('.has-error').forEach((el) => el.classList.remove('has-error'));
        openSuccessModal();
      } catch (err) {
        formStatus.textContent = 'No se pudo enviar el mensaje. Intente nuevamente o escríbenos por correo.';
        formStatus.className = 'form-status mono err';
      }
    });
  }

  /* -------- Animación de aparición al hacer scroll -------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Navegadores muy antiguos sin soporte: mostrar todo directamente.
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* -------- Formulario de Postulaciones -------- */
  const postulacionForm = document.getElementById('postulacionForm');
  const postulacionStatus = document.getElementById('postulacionStatus');

  if (postulacionForm) {
    const PESO_MAXIMO_CV = 4 * 1024 * 1024; // 4MB

    const postulacionValidators = {
      nombre: (value) => value.trim() !== '' || 'Ingrese su nombre completo.',
      email: (value) => {
        if (value.trim() === '') return 'Ingrese su email.';
        const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        return valido || 'Ingrese un email válido (ej: nombre@dominio.com).';
      },
      telefono: (value) => {
        if (value.trim() === '') return true; // opcional
        const soloValidos = /^[0-9+\-\s]+$/.test(value);
        if (!soloValidos) return 'El teléfono solo debe contener números.';
        const digitos = value.replace(/\D/g, '');
        return digitos.length >= 8 || 'Ingrese un teléfono válido (mínimo 8 dígitos).';
      }
    };

    function showFieldError(input, message) {
      const wrapper = input.parentElement;
      const errorEl = document.getElementById('err-' + input.id);
      if (message === true || message === undefined) {
        wrapper.classList.remove('has-error');
        if (errorEl) errorEl.textContent = '';
        return true;
      }
      wrapper.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
      return false;
    }

    function validatePostulacionField(input) {
      const validator = postulacionValidators[input.name];
      if (!validator) return true;
      const result = validator(input.value);
      return showFieldError(input, result === true ? true : result);
    }

    // Teléfono: filtra letras apenas se escriben.
    const pTelefono = document.getElementById('p-telefono');
    if (pTelefono) {
      pTelefono.addEventListener('input', () => {
        const limpio = pTelefono.value.replace(/[^0-9+\-\s]/g, '');
        if (limpio !== pTelefono.value) pTelefono.value = limpio;
        validatePostulacionField(pTelefono);
      });
    }

    ['nombre', 'email'].forEach((name) => {
      const input = postulacionForm.elements[name];
      if (!input) return;
      input.addEventListener('blur', () => validatePostulacionField(input));
      input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('has-error')) validatePostulacionField(input);
      });
    });

    // Validación del CV: debe existir, ser PDF y pesar 4MB o menos.
    const cvInput = document.getElementById('p-cv');
    const cvNameEl = document.getElementById('p-cv-name');

    function validateCV() {
      const file = cvInput.files && cvInput.files[0];
      if (cvNameEl) cvNameEl.textContent = file ? file.name : '';

      if (!file) return showFieldError(cvInput, 'Adjunta tu CV en PDF.');

      const esPDF = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      if (!esPDF) {
        cvInput.value = '';
        if (cvNameEl) cvNameEl.textContent = '';
        return showFieldError(cvInput, 'El archivo debe ser un PDF.');
      }

      if (file.size > PESO_MAXIMO_CV) {
        cvInput.value = '';
        if (cvNameEl) cvNameEl.textContent = '';
        return showFieldError(cvInput, 'El CV no debe pesar más de 4MB.');
      }

      return showFieldError(cvInput, true);
    }

    if (cvInput) cvInput.addEventListener('change', validateCV);

    /* -------- Modal de envío exitoso (postulaciones) -------- */
    const postulacionSuccessOverlay = document.getElementById('postulacionSuccessOverlay');
    const postulacionSuccessClose = document.getElementById('postulacionSuccessClose');
    const postulacionSuccessOk = document.getElementById('postulacionSuccessOk');

    function openPostulacionSuccessModal() {
      if (postulacionSuccessOverlay) postulacionSuccessOverlay.classList.add('active');
    }
    function closePostulacionSuccessModal() {
      if (postulacionSuccessOverlay) postulacionSuccessOverlay.classList.remove('active');
    }
    if (postulacionSuccessClose) postulacionSuccessClose.addEventListener('click', closePostulacionSuccessModal);
    if (postulacionSuccessOk) postulacionSuccessOk.addEventListener('click', closePostulacionSuccessModal);
    if (postulacionSuccessOverlay) {
      postulacionSuccessOverlay.addEventListener('click', (e) => {
        if (e.target === postulacionSuccessOverlay) closePostulacionSuccessModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePostulacionSuccessModal();
    });

    postulacionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let esValido = true;
      let primerCampoInvalido = null;

      Object.keys(postulacionValidators).forEach((name) => {
        const input = postulacionForm.elements[name];
        if (!input) return;
        const ok = validatePostulacionField(input);
        if (!ok) {
          esValido = false;
          if (!primerCampoInvalido) primerCampoInvalido = input;
        }
      });

      const cvOk = validateCV();
      if (!cvOk) {
        esValido = false;
        if (!primerCampoInvalido) primerCampoInvalido = cvInput;
      }

      if (!esValido) {
        postulacionStatus.textContent = 'Revise los campos marcados en rojo.';
        postulacionStatus.className = 'form-status mono err';
        if (primerCampoInvalido) primerCampoInvalido.focus();
        return;
      }

      postulacionStatus.textContent = 'Enviando…';
      postulacionStatus.className = 'form-status mono';

      try {
        const response = await fetch(postulacionForm.action, {
          method: 'POST',
          body: new FormData(postulacionForm)
        });

        if (!response.ok) throw new Error('Error de red');

        postulacionStatus.textContent = 'Postulación enviada correctamente.';
        postulacionStatus.className = 'form-status mono ok';
        postulacionForm.reset();
        if (cvNameEl) cvNameEl.textContent = '';
        postulacionForm.querySelectorAll('.has-error').forEach((el) => el.classList.remove('has-error'));
        openPostulacionSuccessModal();
      } catch (err) {
        postulacionStatus.textContent = 'No se pudo enviar la postulación. Intente nuevamente o escríbenos por correo.';
        postulacionStatus.className = 'form-status mono err';
      }
    });
  }

  /* -------- Carrusel de Merch --------
     El HTML solo tiene los productos escritos una vez; acá los
     clonamos para que el loop sea continuo, y controlamos el
     movimiento con JS (en vez de una animación CSS) para que también
     se pueda arrastrar con el dedo o el mouse. */
  const merchCarousel = document.querySelector('.merch-carousel');
  const merchTrack = document.querySelector('.merch-track');

  if (merchCarousel && merchTrack) {
    // 1) Duplicar las tarjetas para el loop infinito.
    const originales = Array.from(merchTrack.children);
    originales.forEach((card) => {
      const clon = card.cloneNode(true);
      clon.setAttribute('aria-hidden', 'true');
      clon.setAttribute('tabindex', '-1');
      merchTrack.appendChild(clon);
    });

    // 2) Animación + arrastre.
    const sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DURACION_VUELTA = 30; // segundos que tarda en dar una vuelta completa

    let anchoMitad = 0;
    let velocidad = 0; // se calcula en medir(), en px por milisegundo
    let posX = 0;
    let pausado = false;
    let arrastrando = false;
    let inicioX = 0;
    let posInicioArrastre = 0;
    let ultimoTimestamp = null;

    function medir() {
      anchoMitad = merchTrack.scrollWidth / 2;
      velocidad = anchoMitad / (DURACION_VUELTA * 1000);
    }
    medir();
    window.addEventListener('resize', medir);

    function normalizar(x) {
      if (anchoMitad <= 0) return 0;
      x = x % anchoMitad;
      if (x > 0) x -= anchoMitad;
      return x;
    }

    function aplicarPosicion() {
      merchTrack.style.transform = `translateX(${posX}px)`;
    }

    function frame(timestamp) {
      if (ultimoTimestamp === null) ultimoTimestamp = timestamp;
      const delta = timestamp - ultimoTimestamp;
      ultimoTimestamp = timestamp;

      if (!pausado && !arrastrando && !sinMovimiento) {
        posX = normalizar(posX - velocidad * delta);
        aplicarPosicion();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // Pausa al pasar el mouse o enfocar con teclado (igual que antes).
    merchCarousel.addEventListener('mouseenter', () => { pausado = true; });
    merchCarousel.addEventListener('mouseleave', () => { pausado = false; });
    merchCarousel.addEventListener('focusin', () => { pausado = true; });
    merchCarousel.addEventListener('focusout', () => { pausado = false; });

    // Arrastre con mouse y con el dedo (Pointer Events cubre ambos).
    let arrastreSignificativo = false;

    function empezarArrastre(clientX) {
      arrastrando = true;
      pausado = true;
      inicioX = clientX;
      posInicioArrastre = posX;
      arrastreSignificativo = false;
      merchTrack.classList.add('is-dragging');
    }
    function moverArrastre(clientX) {
      if (!arrastrando) return;
      const delta = clientX - inicioX;
      if (Math.abs(delta) > 6) arrastreSignificativo = true;
      posX = normalizar(posInicioArrastre + delta);
      aplicarPosicion();
    }
    function terminarArrastre() {
      if (!arrastrando) return;
      arrastrando = false;
      pausado = false;
      merchTrack.classList.remove('is-dragging');
    }

    // Si hubo arrastre real, cancela el click que sigue (para no abrir
    // el producto sin querer al soltar después de deslizar).
    merchTrack.addEventListener('click', (e) => {
      if (arrastreSignificativo) {
        e.preventDefault();
        e.stopPropagation();
        arrastreSignificativo = false;
      }
    }, true);

    merchTrack.addEventListener('pointerdown', (e) => {
      // Solo arranca con el botón principal (evita clic derecho, etc.)
      if (e.button !== undefined && e.button !== 0) return;
      empezarArrastre(e.clientX);
    });
    // Escuchamos en window (no con setPointerCapture) para que el arrastre
    // siga funcionando aunque el cursor salga de la tarjeta, sin que eso
    // interfiera con el clic normal de los links en escritorio.
    window.addEventListener('pointermove', (e) => {
      if (arrastrando) moverArrastre(e.clientX);
    });
    window.addEventListener('pointerup', terminarArrastre);
    window.addEventListener('pointercancel', terminarArrastre);

    // Evita que el navegador intente arrastrar las imágenes como archivo.
    merchTrack.querySelectorAll('img').forEach((img) => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });
  }

  /* -------- Tarjetas de Capacidades: tocar para ver el texto --------
     En celular no existe el ":hover" real (el dedo solo lo simula
     mientras sigue tocando), así que en dispositivos táctiles un toque
     agrega/saca una clase que hace lo mismo que el hover de escritorio.
     En dispositivos con mouse no se toca nada, sigue funcionando con
     hover como antes. */
  const esTactil = window.matchMedia && window.matchMedia('(hover: none)').matches;
  if (esTactil) {
    document.querySelectorAll('.capacity-card').forEach((card) => {
      card.addEventListener('click', () => {
        card.classList.toggle('is-active');
      });
    });
  }

});
