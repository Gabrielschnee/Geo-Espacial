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
