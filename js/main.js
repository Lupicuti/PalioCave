/* ============================================================
   main.js — Shared interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* --- Sticky Header --- */
    const header = document.querySelector('.site-header');
    if (header) {
        const onScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* --- Mobile drawer --- */
    const toggle   = document.getElementById('nav-toggle');
    const drawer   = document.getElementById('mobile-drawer');
    const closeBtn = document.getElementById('drawer-close');
    if (toggle && drawer) {
        toggle.addEventListener('click', () => {
            drawer.classList.add('open');
            document.body.style.overflow = 'hidden';
            closeBtn?.focus();
        });
        const closeDrawer = () => {
            drawer.classList.remove('open');
            document.body.style.overflow = '';
            toggle?.focus();
        };
        closeBtn?.addEventListener('click', closeDrawer);
        drawer.addEventListener('click', e => {
            if (e.target === drawer) closeDrawer();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
        });
    }

    /* --- Hero parallax (subtle) --- */
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            heroBg.style.transform = `scale(1.05) translateY(${y * 0.25}px)`;
        }, { passive: true });
    }

    /* --- Scroll reveal --- */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in-view');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => io.observe(el));
    }

    /* --- Mobile sticky bar --- */
    const stickyBar = document.querySelector('.sticky-bar');
    if (stickyBar) {
        window.addEventListener('scroll', () => {
            stickyBar.classList.toggle('visible', window.scrollY > 350);
        }, { passive: true });
    }

    /* --- Active nav link --- */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a, .mobile-drawer a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            a.classList.add('active');
        }
    });

    /* --------------------------------------------------------
       Gallery Photo Slider
    -------------------------------------------------------- */
    const slides      = document.querySelectorAll('.gallery-slide');
    const dots        = document.querySelectorAll('.gallery-dot');
    const prevBtn     = document.getElementById('galleryPrev');
    const nextBtn     = document.getElementById('galleryNext');
    const progressBar = document.getElementById('galleryProgress');

    if (slides.length > 0) {
        const DURATION = 3500;
        let current = 0;
        let timer   = null;
        let paused  = false;

        function goTo(idx) {
            slides[current].classList.remove('active');
            if (dots[current]) { dots[current].classList.remove('active'); dots[current].setAttribute('aria-selected', 'false'); }

            current = (idx + slides.length) % slides.length;

            slides[current].classList.add('active');
            if (dots[current]) { dots[current].classList.add('active'); dots[current].setAttribute('aria-selected', 'true'); }

            resetProgress();
        }

        function resetProgress() {
            if (!progressBar) return;
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            void progressBar.offsetWidth;
            progressBar.style.transition = `width ${DURATION}ms linear`;
            progressBar.style.width = '100%';
        }

        function startAutoplay() {
            stopAutoplay();
            timer = setInterval(() => { if (!paused) goTo(current + 1); }, DURATION);
            resetProgress();
        }

        function stopAutoplay() {
            clearInterval(timer);
            if (progressBar) {
                progressBar.style.transition = 'none';
                const computed = getComputedStyle(progressBar).width;
                const parent   = progressBar.parentElement?.offsetWidth || 1;
                progressBar.style.width = (parseFloat(computed) / parent * 100) + '%';
            }
        }

        prevBtn?.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
        nextBtn?.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

        dots.forEach(dot => {
            dot.addEventListener('click', () => { goTo(parseInt(dot.dataset.index, 10)); startAutoplay(); });
        });

        const sliderSection = document.getElementById('gallery-slider');
        sliderSection?.addEventListener('mouseenter', () => { paused = true;  stopAutoplay(); });
        sliderSection?.addEventListener('mouseleave', () => { paused = false; startAutoplay(); });

        let touchStartX = 0;
        sliderSection?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        sliderSection?.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(dx) > 40) { goTo(dx < 0 ? current + 1 : current - 1); startAutoplay(); }
        }, { passive: true });

        sliderSection?.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft')  { goTo(current - 1); startAutoplay(); }
            if (e.key === 'ArrowRight') { goTo(current + 1); startAutoplay(); }
        });

        startAutoplay();
    }

    /* --------------------------------------------------------
       FAQ Modal (Overlay in sovraimpressione)
    -------------------------------------------------------- */
    const faqModal   = document.getElementById('faq-modal');
    const openFaqBtns = document.querySelectorAll('[data-open-faq], a[href="#faq-modal"], a[href="#faq-cena"]');
    const closeFaqBtns = document.querySelectorAll('[data-close-faq], .modal-close-btn');

    if (faqModal) {
        const openModal = (e) => {
            if (e) e.preventDefault();
            faqModal.classList.add('open');
            faqModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            const firstFocusable = faqModal.querySelector('button, [href], details');
            firstFocusable?.focus();
        };

        const closeModal = () => {
            faqModal.classList.remove('open');
            faqModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        openFaqBtns.forEach(btn => btn.addEventListener('click', openModal));
        closeFaqBtns.forEach(btn => btn.addEventListener('click', closeModal));

        faqModal.addEventListener('click', (e) => {
            if (e.target === faqModal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && faqModal.classList.contains('open')) {
                closeModal();
            }
        });

        // Check if URL contains #faq-modal or #faq-cena on page load
        if (window.location.hash === '#faq-modal' || window.location.hash === '#faq-cena') {
            openModal();
        }
    }

});

