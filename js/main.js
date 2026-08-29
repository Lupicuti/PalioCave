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

});
