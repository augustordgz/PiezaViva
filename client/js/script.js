document.addEventListener('DOMContentLoaded', () => {

  /* -------- Año dinámico en el footer -------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
      if (!data) return;
      modalContent.innerHTML = `<span class="mono">${data.date}</span><h2>${data.title}</h2><p>${data.body}</p>`;
      modalOverlay.classList.add('active');
    });
  });

  function closeModal() { modalOverlay.classList.remove('active'); }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* -------- Envío del formulario de contacto --------
     Envía los datos a php/contacto.php sin recargar la página. */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      formStatus.textContent = 'Enviando…';
      formStatus.className = 'form-status mono';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm)
        });

        if (!response.ok) throw new Error('Error de red');

        formStatus.textContent = 'Mensaje enviado correctamente. Te contactaremos a la brevedad.';
        formStatus.className = 'form-status mono ok';
        contactForm.reset();
      } catch (err) {
        formStatus.textContent = 'No se pudo enviar el mensaje. Intenta nuevamente o escríbenos por correo.';
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

});
