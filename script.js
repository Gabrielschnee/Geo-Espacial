    const heroVideoA = document.querySelector('#sceneA');
    const heroVideoB = document.querySelector('#sceneB');
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sceneFiles = ['assets/rural-aerial.mp4', 'assets/fields-aerial.mp4', 'assets/corn-aerial.mp4'];
    const sceneDots = [...document.querySelectorAll('.scene-dots span')];
    let currentScene = 0;
    let activeVideo = heroVideoA;
    let loadingVideo = heroVideoB;
    let sceneTimer;

    function scheduleScene() {
      if (!motionPreference.matches) sceneTimer = window.setTimeout(showNextScene, 8000);
    }

    function showNextScene() {
      if (motionPreference.matches) return;
      const nextScene = (currentScene + 1) % sceneFiles.length;
      loadingVideo.src = sceneFiles[nextScene];
      loadingVideo.load();
      loadingVideo.oncanplay = async () => {
        loadingVideo.oncanplay = null;
        try {
          await loadingVideo.play();
          const previousVideo = activeVideo;
          loadingVideo.classList.add('is-active');
          previousVideo.classList.remove('is-active');
          currentScene = nextScene;
          sceneDots.forEach((dot, index) => dot.classList.toggle('active', index === currentScene));
          document.querySelector('.scene-dots').setAttribute('aria-label', `Cena ${currentScene + 1} de ${sceneFiles.length}`);
          activeVideo = loadingVideo;
          loadingVideo = previousVideo;
          window.setTimeout(() => {
            previousVideo.pause();
            previousVideo.removeAttribute('src');
            previousVideo.querySelector('source')?.removeAttribute('src');
            previousVideo.load();
          }, 1400);
          scheduleScene();
        } catch {
          scheduleScene();
        }
      };
      loadingVideo.onerror = scheduleScene;
    }

    if (motionPreference.matches) {
      heroVideoA.pause();
    } else {
      scheduleScene();
    }
    motionPreference.addEventListener('change', () => {
      window.clearTimeout(sceneTimer);
      if (motionPreference.matches) {
        heroVideoA.pause();
        heroVideoB.pause();
      } else {
        activeVideo.play().catch(() => {});
        scheduleScene();
      }
    });

    const revealTargets = document.querySelectorAll(
      '.intro > *, .feature > *, .services-title, .service, .specialties-intro > *, .specialty, .equipment-intro > *, .equipment-feature, .equipment-item, .equipment-note, .contact > *, .footer > *'
    );

    if (!motionPreference.matches && 'IntersectionObserver' in window) {
      document.querySelectorAll('.service, .specialty, .equipment-item').forEach((item, index) => {
        item.style.setProperty('--reveal-delay', `${(index % 4) * 90}ms`);
      });

      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

      revealTargets.forEach(target => {
        target.classList.add('scroll-reveal');
        revealObserver.observe(target);
      });
    }

    const equipmentTrack = document.querySelector('#equipmentTrack');
    if (equipmentTrack) {
      const equipmentSlides = [...equipmentTrack.querySelectorAll('.equipment-slide')];
      const equipmentDots = [...document.querySelectorAll('.equipment-dot')];
      let activeEquipment = 0;

      function goToEquipment(index) {
        activeEquipment = (index + equipmentSlides.length) % equipmentSlides.length;
        equipmentTrack.scrollTo({ left: equipmentSlides[activeEquipment].offsetLeft - equipmentTrack.offsetLeft, behavior: 'smooth' });
        updateEquipmentControls();
      }

      function updateEquipmentControls() {
        equipmentDots.forEach((dot, index) => {
          const isActive = index === activeEquipment;
          dot.classList.toggle('is-active', isActive);
          if (isActive) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
      }

      equipmentTrack.addEventListener('scroll', () => {
        const trackCenter = equipmentTrack.scrollLeft + equipmentTrack.clientWidth / 2;
        activeEquipment = equipmentSlides.reduce((closest, slide, index) => {
          const slideCenter = slide.offsetLeft - equipmentTrack.offsetLeft + slide.offsetWidth / 2;
          const bestDistance = Math.abs(equipmentSlides[closest].offsetLeft - equipmentTrack.offsetLeft + equipmentSlides[closest].offsetWidth / 2 - trackCenter);
          return Math.abs(slideCenter - trackCenter) < bestDistance ? index : closest;
        }, 0);
        updateEquipmentControls();
      }, { passive: true });

      document.querySelector('.equipment-prev')?.addEventListener('click', () => goToEquipment(activeEquipment - 1));
      document.querySelector('.equipment-next')?.addEventListener('click', () => goToEquipment(activeEquipment + 1));
      equipmentDots.forEach((dot, index) => dot.addEventListener('click', () => goToEquipment(index)));
      equipmentTrack.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); goToEquipment(activeEquipment + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); goToEquipment(activeEquipment - 1); }
      });

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.setInterval(() => {
          if (!document.hidden) goToEquipment(activeEquipment + 1);
        }, 3000);
      }
    }
