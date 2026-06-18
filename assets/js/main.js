/**
 * main.js
 * JavaScript principal du portfolio de Riham Kaddour Bakir
 * Web Sémantique – Sup Galilée / Université Sorbonne Paris Nord
 *
 * Fonctionnalités :
 *  1. Révélation des sections au scroll (IntersectionObserver)
 *  2. Navigation mobile (burger menu)
 *  3. Lien actif dans la nav selon la section visible
 *  4. Animation des cartes [data-anim="slide-in"]
 *  5. Feedback du bouton contact (prototype)
 *  6. Respect de prefers-reduced-motion
 */

(function () {
    'use strict';

    // ─── 1. RÉVÉLATION AU SCROLL ─────────────────────────────────────────────
    // Les éléments .reveal sont à opacity:0 en CSS.
    // L'IntersectionObserver ajoute la classe .revealed quand ils entrent dans
    // le viewport, déclenchant la transition CSS définie dans style.css.

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initReveal() {
        const revealEls = document.querySelectorAll('.reveal');

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            // Accessibilité : afficher immédiatement sans animation
            revealEls.forEach(el => el.classList.add('revealed'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target); // une seule fois
                    }
                });
            },
            { threshold: 0.08 } // se déclenche dès 8% visible
        );

        revealEls.forEach(el => observer.observe(el));
    }

    // ─── 2. ANIMATION DES CARTES [data-anim="slide-in"] ─────────────────────
    // Utilisé par les .highlight-card dans la section About.

    function initSlideIn() {
        const slideEls = document.querySelectorAll('[data-anim="slide-in"]');

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            slideEls.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        // Décalage en cascade pour chaque carte
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, i * 100);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        slideEls.forEach(el => observer.observe(el));
    }

    // ─── 3. NAVIGATION MOBILE (BURGER) ───────────────────────────────────────
    // Le CSS attend la classe .open sur .main-nav pour afficher le menu.
    // aria-expanded est mis à jour pour l'accessibilité.

    function initMobileNav() {
        const toggle = document.querySelector('.nav-toggle');
        const nav    = document.querySelector('.main-nav');
        const menu   = document.getElementById('nav-menu');

        if (!toggle || !nav || !menu) return;

        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Fermer le menu si on clique sur un lien nav
        menu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Fermer si on clique hors du menu
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target)) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ─── 4. LIEN ACTIF DANS LA NAV ───────────────────────────────────────────
    // Observe chaque section et marque le lien correspondant comme .active.

    function initActiveNav() {
        const sections  = document.querySelectorAll('section[id], div[id]');
        const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');

        if (!('IntersectionObserver' in window) || navLinks.length === 0) return;

        const sectionMap = {};
        sections.forEach(sec => {
            sectionMap[sec.id] = sec;
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navLinks.forEach(link => {
                            const href = link.getAttribute('href').replace('#', '');
                            link.classList.toggle('active', href === id);
                        });
                    }
                });
            },
            { rootMargin: '-40% 0px -50% 0px' }
        );

        sections.forEach(sec => observer.observe(sec));
    }

    // ─── 5. HEADER SCROLL ────────────────────────────────────────────────────
    // Ajoute la classe .scrolled au header pour déclencher l'ombre CSS.

    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        const onScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // état initial
    }

    // ─── 6. BOUTON CONTACT (PROTOTYPE) ───────────────────────────────────────
    // Affiche un feedback visuel car le formulaire est un prototype sans backend.

    function initContactForm() {
        const btn = document.getElementById('contact-submit');
        if (!btn) return;

        const lang = window.PORTFOLIO_LANG || 'fr';
        const messages = {
            fr: { ok: '✓ Message envoyé (prototype)', reset: 'Envoyer' },
            en: { ok: '✓ Message sent (prototype)',   reset: 'Send' },
            ar: { ok: '✓ تم الإرسال (نموذج تجريبي)', reset: 'إرسال' },
        };
        const msg = messages[lang] || messages.fr;

        btn.addEventListener('click', () => {
            btn.textContent = msg.ok;
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = msg.reset;
                btn.disabled = false;
            }, 3000);
        });
    }

    // ─── INIT ─────────────────────────────────────────────────────────────────
    // Attendre que le DOM soit prêt.

    function init() {
        initReveal();
        initSlideIn();
        initMobileNav();
        initActiveNav();
        initHeaderScroll();
        initContactForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
