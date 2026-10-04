/**
 * main.js — version statique avec annotations RDFa
 *
 * Rôle :
 * - Charger portfolio.xml (source de vérité multilingue)
 * - Gérer la langue (fr / en / ar) et la direction (LTR / RTL)
 * - Générer les sections HTML dynamiquement, avec leurs attributs RDFa
 * - Construire le rapport interactif du hero (style Power BI) à partir des
 *   compétences du XML
 *
 * Règle : aucun texte visible n'est écrit en dur. Les contenus viennent du XML,
 * les textes d'interface du dictionnaire `labels` ci-dessous.
 */
(function () {
  'use strict';

  const SUPPORTED = ['fr', 'en', 'ar'];

  function readLang() {
    try {
      const saved = localStorage.getItem('portfolioLang');
      return SUPPORTED.indexOf(saved) !== -1 ? saved : 'fr';
    } catch (e) {
      return 'fr';
    }
  }

  const state = {
    lang: readLang(),
    xml: null,
    cat: null,            // catégorie sélectionnée dans le rapport du hero
    skillsData: null,
    introPlayed: false
  };

  /* =====================================================================
     TEXTES D'INTERFACE (fr / en / ar)
     ===================================================================== */
  const labels = {
    fr: {
      dir: 'ltr',
      nav: { services: 'Services', cases: 'Réalisations', about: 'À propos', education: 'Formation', experience: 'Expérience', skills: 'Compétences', projects: 'Projets', contact: 'Contact' },
      cta: { cases: 'Voir mes réalisations', contact: 'Me contacter' },
      aria: { skip: 'Aller au contenu principal', home: 'Accueil', menuOpen: 'Ouvrir le menu', menuClose: 'Fermer le menu', nav: 'Navigation principale', lang: 'Choix de langue', keySkills: 'Compétences clés', footerNav: 'Navigation du pied de page', projectFilters: 'Filtrer les projets' },
      hero: { chipQuality: 'Data Quality', chipAutomation: 'Automatisation', status: 'En alternance chez GRDF', school: 'Sup Galilée' },
      report: { title: 'Mes compétences en un coup d’œil', hint: 'Cliquez sur une catégorie pour filtrer le rapport.', filter: 'Catégorie', all: 'Toutes', clear: 'Effacer le filtre', kpiSkills: 'compétences', kpiCats: 'catégories', kpiLevel: 'niveau moyen', barsAll: 'Niveau moyen par catégorie', barsOne: 'Niveau par compétence', donut: 'Répartition des compétences par catégorie' },
      about: { web: ['Web', 'HTML CSS JS XML'], data: ['Data', 'SQL Power BI'], systems: ['Systèmes', 'Réseaux & outils'], multi: ['Multilingue', 'FR / EN / AR'], codeTitle: 'Mon profil en JSON-LD', codeNote: 'Le même vocabulaire schema.org que les annotations RDFa de cette page.' },
      services: { deliverable: 'Livrable attendu' },
      cases: { role: 'Expérience professionnelle', tech: 'Technologies utilisées', skills: 'Compétences mobilisées', cta: 'Discuter de ce projet' },
      exp: { missions: 'Missions' },
      filter: { all: 'Tous', web: 'Web', mobile: 'Mobile', algorithm: 'Algo', desktop: 'Desktop' },
      footer: { built: 'Réalisé avec HTML, CSS, JavaScript, XML et RDFa.', rights: 'Tous droits réservés.', academic: 'Portfolio Web Sémantique – Sup Galilée / Université Sorbonne Paris Nord' },
      error: 'Erreur : impossible de charger ou d’analyser portfolio.xml.'
    },
    en: {
      dir: 'ltr',
      nav: { services: 'Services', cases: 'Work', about: 'About', education: 'Education', experience: 'Experience', skills: 'Skills', projects: 'Projects', contact: 'Contact' },
      cta: { cases: 'See my work', contact: 'Contact me' },
      aria: { skip: 'Skip to main content', home: 'Home', menuOpen: 'Open menu', menuClose: 'Close menu', nav: 'Main navigation', lang: 'Language', keySkills: 'Key skills', footerNav: 'Footer navigation', projectFilters: 'Filter projects' },
      hero: { chipQuality: 'Data Quality', chipAutomation: 'Automation', status: 'Apprenticeship at GRDF', school: 'Sup Galilée' },
      report: { title: 'My skills at a glance', hint: 'Click a category to filter the report.', filter: 'Category', all: 'All', clear: 'Clear filter', kpiSkills: 'skills', kpiCats: 'categories', kpiLevel: 'average level', barsAll: 'Average level by category', barsOne: 'Level by skill', donut: 'Skills split by category' },
      about: { web: ['Web', 'HTML CSS JS XML'], data: ['Data', 'SQL Power BI'], systems: ['Systems', 'Networks & tools'], multi: ['Multilingual', 'FR / EN / AR'], codeTitle: 'My profile as JSON-LD', codeNote: 'The same schema.org vocabulary as this page’s RDFa annotations.' },
      services: { deliverable: 'Expected deliverable' },
      cases: { role: 'Professional experience', tech: 'Technologies used', skills: 'Skills applied', cta: 'Discuss this project' },
      exp: { missions: 'Key responsibilities' },
      filter: { all: 'All', web: 'Web', mobile: 'Mobile', algorithm: 'Algorithms', desktop: 'Desktop' },
      footer: { built: 'Built with HTML, CSS, JavaScript, XML and RDFa.', rights: 'All rights reserved.', academic: 'Semantic Web portfolio – Sup Galilée / Université Sorbonne Paris Nord' },
      error: 'Error: portfolio.xml could not be loaded or parsed.'
    },
    ar: {
      dir: 'rtl',
      nav: { services: 'الخدمات', cases: 'الإنجازات', about: 'من أنا', education: 'التكوين', experience: 'التجربة', skills: 'المهارات', projects: 'المشاريع', contact: 'التواصل' },
      cta: { cases: 'عرض إنجازاتي', contact: 'تواصل معي' },
      aria: { skip: 'انتقل إلى المحتوى الرئيسي', home: 'الرئيسية', menuOpen: 'فتح القائمة', menuClose: 'إغلاق القائمة', nav: 'التنقل الرئيسي', lang: 'اختيار اللغة', keySkills: 'المهارات الأساسية', footerNav: 'التنقل في أسفل الصفحة', projectFilters: 'تصفية المشاريع' },
      hero: { chipQuality: 'جودة البيانات', chipAutomation: 'الأتمتة', status: 'تدريب متناوب في GRDF', school: 'Sup Galilée' },
      report: { title: 'مهاراتي في لمحة', hint: 'اضغط على فئة لتصفية التقرير.', filter: 'الفئة', all: 'الكل', clear: 'إزالة التصفية', kpiSkills: 'مهارة', kpiCats: 'فئات', kpiLevel: 'المستوى المتوسط', barsAll: 'المستوى المتوسط لكل فئة', barsOne: 'المستوى لكل مهارة', donut: 'توزيع المهارات حسب الفئة' },
      about: { web: ['الويب', 'HTML CSS JS XML'], data: ['البيانات', 'SQL Power BI'], systems: ['الأنظمة', 'الشبكات والأدوات'], multi: ['متعدد اللغات', 'FR / EN / AR'], codeTitle: 'ملفي بصيغة JSON-LD', codeNote: 'مفردات schema.org نفسها المستخدمة في توصيفات RDFa لهذه الصفحة.' },
      services: { deliverable: 'المخرج المتوقع' },
      cases: { role: 'تجربة مهنية', tech: 'التقنيات المستخدمة', skills: 'المهارات المستخدمة', cta: 'لنناقش هذا المشروع' },
      exp: { missions: 'المهام' },
      filter: { all: 'الكل', web: 'ويب', mobile: 'جوال', algorithm: 'خوارزميات', desktop: 'سطح المكتب' },
      footer: { built: 'مُنجز بـ HTML وCSS وJavaScript وXML وRDFa.', rights: 'جميع الحقوق محفوظة.', academic: 'ملف الويب الدلالي – Sup Galilée / جامعة سوربون باريس نور' },
      error: 'خطأ: تعذّر تحميل portfolio.xml أو تحليله.'
    }
  };

  /* =====================================================================
     OUTILS
     ===================================================================== */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function text(node, fallback = '') {
    return node ? node.textContent.trim() : fallback;
  }

  function attr(node, name, fallback = '') {
    return node ? (node.getAttribute(name) || fallback) : fallback;
  }

  /** Traduction d'un enfant `path > translation[lang]`, avec repli sur le français puis l'anglais. */
  function t(parent, path, lang = state.lang) {
    if (!parent) return '';
    const pick = function (l) {
      return text(parent.querySelector(`${path} > translation[lang="${l}"]`));
    };
    return pick(lang) || pick('fr') || pick('en');
  }

  function contentLang(parent, path, lang = state.lang) {
    if (!parent) return '';
    return text(parent.querySelector(`${path}[lang="${lang}"]`)) ||
           text(parent.querySelector(`${path}[lang="fr"]`));
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  /** Nom d'un élément `skill` ou `tech` dans la langue courante (attributs name_en / name_ar). */
  function localName(node) {
    const fallback = node.hasAttribute('name') ? attr(node, 'name') : text(node);
    return attr(node, 'name_' + state.lang) || fallback;
  }

  /* Couleurs : palette des visuels Power BI */
  const STEP_COLORS = ['sky', 'teal', 'yellow', 'coral', 'purple', 'orange'];
  const SERVICE_COLORS = ['teal', 'yellow', 'coral', 'purple'];
  const CASE_COLORS = ['teal', 'yellow', 'coral'];
  const EDU_COLORS = ['teal', 'yellow', 'coral'];
  const CAT_COLORS = {
    'cat-languages': 'teal',
    'cat-data': 'yellow',
    'cat-frameworks': 'coral',
    'cat-web': 'sky',
    'cat-soft': 'purple',
    'cat-languages-human': 'orange'
  };
  const CAT_FALLBACK = ['teal', 'yellow', 'coral', 'sky', 'purple', 'orange'];
  const TYPE_COLORS = { web: 'teal', mobile: 'coral', algorithm: 'purple', desktop: 'yellow' };
  const TECH_COLORS = {
    'power bi': 'yellow', 'dax': 'yellow', 'power query': 'teal', 'power automate': 'purple',
    'excel': 'teal', 'excel vba': 'teal', 'python': 'sky', 'sql': 'orange', 'mysql': 'orange',
    'data quality': 'coral', 'react.js': 'sky', 'flutter': 'sky', 'firebase': 'orange',
    'laravel': 'coral', 'php': 'purple', 'java': 'coral', 'c': 'sky', 'figma': 'purple',
    'git': 'coral', 'netbeans ide': 'orange'
  };
  function techColor(name) {
    return 'var(--c-' + (TECH_COLORS[String(name).toLowerCase()] || 'charcoal') + ')';
  }

  /* ---------- Icônes SVG homogènes (trait 1.7, 24x24, currentColor) ---------- */
  const ICONS = {
    sources: '<path d="M4 4h6l3 3v5H4z"/><ellipse cx="17" cy="15" rx="4" ry="1.7"/><path d="M13 15v4.5c0 1 1.8 1.7 4 1.7s4-.7 4-1.7V15M7 15v3.5h3"/>',
    integration: '<path d="M12 3 3 8l9 5 9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    model: '<ellipse cx="12" cy="5" rx="5" ry="2"/><path d="M7 5v4c0 1.1 2.2 2 5 2s5-.9 5-2V5M12 11v3M5 18v-3.5h14V18"/><rect x="3" y="18" width="4" height="3" rx=".8"/><rect x="10" y="18" width="4" height="3" rx=".8"/><rect x="17" y="18" width="4" height="3" rx=".8"/>',
    reporting: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7.5 17v-4M12 17V8M16.5 17v-6"/>',
    refresh: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.5 1.1.5 2.1h6c0-1 0-1.7.5-2.1A6 6 0 0 0 12 3z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'
  };
  function svg(name) {
    return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || ICONS.gear) + '</svg>';
  }

  function chip(name, label, extra) {
    return `<li class="chip" style="--dot:${techColor(name)}"><span class="chip-dot" aria-hidden="true"></span><span${extra || ''}>${esc(label)}</span></li>`;
  }

  /* =====================================================================
     INITIALISATION
     ===================================================================== */
  let started = false;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    if (started) return;   // les écouteurs d'événements ne doivent être posés qu'une fois
    started = true;
    $('#year').textContent = new Date().getFullYear();
    initMenu();
    initLanguageButtons();
    initReport();
    initServiceLinks();
    initProjectFilters();
    initActiveNav();

    try {
      const response = await fetch('portfolio.xml');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const xmlText = await response.text();
      state.xml = new DOMParser().parseFromString(xmlText, 'application/xml');

      if (state.xml.querySelector('parsererror')) {
        throw new Error('portfolio.xml contient une erreur XML.');
      }

      renderAll();

      if (location.hash.length > 1) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) target.scrollIntoView();
      }
    } catch (error) {
      console.error(error);
      applyLabels();
      $('#dynamic-content').innerHTML = `
        <section class="section">
          <div class="container">
            <p class="load-error" role="alert">${esc(labels[state.lang].error)}</p>
          </div>
        </section>`;
    }
  }

  function initMenu() {
    const button = $('.nav-toggle');
    const nav = $('#main-nav');
    if (!button || !nav) return;

    function setOpen(open) {
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', labels[state.lang].aria[open ? 'menuClose' : 'menuOpen']);
      nav.classList.toggle('open', open);
    }

    button.addEventListener('click', function () {
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        button.focus();
      }
    });
  }

  function initLanguageButtons() {
    $$('.lang-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        state.lang = button.dataset.lang;
        try { localStorage.setItem('portfolioLang', state.lang); } catch (e) { /* stockage indisponible */ }
        if (state.xml) renderAll(); else applyLabels();
      });
    });
  }

  function applyLabels() {
    const current = labels[state.lang];
    document.documentElement.lang = state.lang;
    document.documentElement.dir = current.dir;

    function lookup(path) {
      let value = current;
      path.split('.').forEach(function (segment) { value = value && value[segment]; });
      return typeof value === 'string' ? value : '';
    }

    $$('[data-i18n]').forEach(function (element) {
      const value = lookup(element.dataset.i18n);
      if (value) element.textContent = value;
    });
    $$('[data-i18n-aria]').forEach(function (element) {
      const value = lookup(element.dataset.i18nAria);
      if (value) element.setAttribute('aria-label', value);
    });

    const toggle = $('.nav-toggle');
    if (toggle) {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-label', current.aria[open ? 'menuClose' : 'menuOpen']);
    }

    const dcLang = $('meta[property="dc:language"]');
    if (dcLang) dcLang.setAttribute('content', state.lang);

    $$('.lang-btn').forEach(function (button) {
      const active = button.dataset.lang === state.lang;
      button.classList.toggle('lang-btn--active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function renderAll() {
    applyLabels();

    const root = state.xml.querySelector('portfolio');
    const meta = root.querySelector('meta');
    const identity = root.querySelector('identity');

    document.title = t(meta, 'siteTitle') || 'Portfolio – Riham Kaddour Bakir';

    const description = t(meta, 'siteDescription');
    const metaDesc = $('meta[name="description"]');
    if (metaDesc && description) metaDesc.setAttribute('content', description);
    const dcDesc = $('meta[property="dc:description"]');
    if (dcDesc && description) dcDesc.setAttribute('content', description);
    const dcTitle = $('meta[property="dc:title"]');
    if (dcTitle) dcTitle.setAttribute('content', document.title);

    renderHero(identity);

    state.skillsData = collectSkills(root.querySelector('skills'));
    renderReport();

    $('#dynamic-content').innerHTML = [
      renderServices(root.querySelector('services')),
      renderCases(root.querySelector('cases')),
      renderAbout(root.querySelector('about'), identity, root.querySelector('experience'), root.querySelector('education')),
      renderEducation(root.querySelector('education')),
      renderExperience(root.querySelector('experience')),
      renderSkills(root.querySelector('skills')),
      renderProjects(root.querySelector('projects')),
      renderContact(root.querySelector('contact'), identity)
    ].join('');

    updateActiveNav();
  }

  /* =====================================================================
     HERO
     ===================================================================== */
  function renderHero(identity) {
    const fullName = text(identity.querySelector('fullName'), 'Riham Kaddour Bakir');
    const parts = fullName.split(' ');
    $('#hero-firstname').textContent = parts.shift() || fullName;
    $('#hero-lastname').textContent = parts.join(' ');
    $('#hero-title').textContent = t(identity, 'title');
    $('#hero-tagline').textContent = t(identity, 'tagline');

    const current = labels[state.lang];
    const location = t(identity, 'location');
    $('#hero-meta').innerHTML = [current.hero.status, current.hero.school, location]
      .filter(Boolean)
      .map(function (item) { return `<li>${esc(item)}</li>`; })
      .join('');

    ensureMeta('#home', 'schema:email', text(identity.querySelector('email')));
    ensureMeta('#home', 'schema:telephone', text(identity.querySelector('phone')));
    ensureMeta('#home', 'schema:address', t(identity, 'location', 'fr'));
    ensureMeta('#home', 'schema:url', text(identity.querySelector('portfolio_url')));
  }

  function ensureMeta(rootSelector, property, content) {
    if (!content) return;
    const root = $(rootSelector);
    if (!root) return;

    let meta = root.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      root.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  /* =====================================================================
     RAPPORT INTERACTIF DU HERO (style Power BI, filtrage croisé)
     Les données viennent des compétences du XML.
     ===================================================================== */
  const LEVELS = { beginner: 25, intermediate: 55, advanced: 80, expert: 100 };

  function levelPercent(skill) {
    const exact = parseInt(attr(skill, 'pct'), 10);
    if (exact > 0 && exact <= 100) return exact;
    return LEVELS[attr(skill, 'level', 'intermediate')] || 50;
  }

  function collectSkills(skills) {
    return $$('category', skills).map(function (category, index) {
      const id = attr(category, 'id');
      const list = $$('skill', category).map(function (skill) {
        return { name: localName(skill), pct: levelPercent(skill) };
      });
      return {
        id: id,
        name: t(category, 'categoryName'),
        color: CAT_COLORS[id] || CAT_FALLBACK[index % CAT_FALLBACK.length],
        skills: list,
        avg: Math.round(list.reduce(function (sum, s) { return sum + s.pct; }, 0) / (list.length || 1))
      };
    });
  }

  function initReport() {
    const host = $('#hero-report');
    if (!host) return;

    host.addEventListener('click', function (event) {
      if (event.target.closest('[data-clear]')) {
        const previous = state.cat;
        state.cat = null;
        renderReport('.bar-row[data-cat="' + previous + '"]');
        return;
      }
      const target = event.target.closest('[data-cat]');
      if (!target) return;
      const id = target.dataset.cat;
      state.cat = state.cat === id ? null : id;
      renderReport(state.cat ? '[data-clear]' : '.bar-row[data-cat="' + id + '"]');
    });
  }

  function renderReport(focusSelector) {
    const host = $('#hero-report');
    const data = state.skillsData;
    if (!host || !data || !data.length) return;

    const L = labels[state.lang].report;
    const selected = data.find(function (c) { return c.id === state.cat; }) || null;
    if (!selected) state.cat = null;

    const total = data.reduce(function (n, c) { return n + c.skills.length; }, 0);
    const pool = selected ? selected.skills : [].concat.apply([], data.map(function (c) { return c.skills; }));
    const kSkills = pool.length;
    const kCats = selected ? 1 : data.length;
    const kLevel = Math.round(pool.reduce(function (sum, s) { return sum + s.pct; }, 0) / (pool.length || 1));

    /* Anneau : une portion par catégorie (stroke-dasharray sur un cercle de circonférence 100) */
    const GAP = 0.8;
    let cumulative = 0;
    const segments = data.map(function (c, i) {
      const share = c.skills.length / total * 100;
      const html = `<circle class="seg${selected && selected.id === c.id ? ' is-selected' : ''}" data-cat="${esc(c.id)}"
          cx="21" cy="21" r="15.9155" fill="none" stroke-width="6"
          style="--seg:var(--c-${c.color});--len:${(share - GAP).toFixed(2)};--rest:${(100 - share + GAP).toFixed(2)};--off:${(25 - cumulative).toFixed(2)};--i:${i}"><title>${esc(c.name)} · ${c.skills.length}</title></circle>`;
      cumulative += share;
      return html;
    }).join('');

    const centerText = selected
      ? `<text class="donut-center" x="21" y="21" text-anchor="middle" dominant-baseline="central">${Math.round(selected.skills.length / total * 100)}%</text>`
      : '';

    /* Barres : niveau moyen par catégorie, ou niveau de chaque compétence si une catégorie est choisie */
    let rows;
    if (selected) {
      rows = selected.skills.map(function (s) {
        return `<li class="bar-row bar-row--static" style="--bar:var(--c-${selected.color});--w:${s.pct}%">
          <span class="bar-label">${esc(s.name)}</span>
          <span class="bar-track"><span class="bar-fill"></span></span>
          <span class="bar-val">${s.pct}%</span>
        </li>`;
      }).join('');
    } else {
      rows = data.map(function (c) {
        return `<li><button class="bar-row" type="button" data-cat="${esc(c.id)}" aria-pressed="false" style="--bar:var(--c-${c.color});--w:${c.avg}%">
          <span class="bar-label">${esc(c.name)}</span>
          <span class="bar-track"><span class="bar-fill"></span></span>
          <span class="bar-val">${c.avg}%</span>
        </button></li>`;
      }).join('');
    }

    const filter = selected
      ? `<button class="report-filter is-active" type="button" data-clear>
           <span>${esc(L.filter)} : ${esc(selected.name)}</span>
           <span class="filter-x" aria-hidden="true">×</span>
           <span class="sr-only">${esc(L.clear)}</span>
         </button>`
      : `<span class="report-filter">${esc(L.filter)} : ${esc(L.all)}</span>`;

    host.innerHTML = `
      <section class="report" aria-labelledby="report-title"${selected ? ' data-selected' : ''}>
        <div class="report-head">
          <h2 class="report-title" id="report-title">${esc(L.title)}</h2>
          ${filter}
        </div>

        <div class="report-kpis">
          <div class="kpi" style="--kpi:var(--c-teal)"><span class="kpi-value">${kSkills}</span><span class="kpi-label">${esc(L.kpiSkills)}</span></div>
          <div class="kpi" style="--kpi:var(--c-yellow)"><span class="kpi-value">${kCats}</span><span class="kpi-label">${esc(L.kpiCats)}</span></div>
          <div class="kpi" style="--kpi:var(--c-coral)"><span class="kpi-value">${kLevel}%</span><span class="kpi-label">${esc(L.kpiLevel)}</span></div>
        </div>

        <div class="report-visuals">
          <div class="visual visual-donut">
            <svg class="donut" viewBox="0 0 42 42" role="img" aria-label="${esc(L.donut)}">${segments}${centerText}</svg>
          </div>
          <div class="visual visual-bars">
            <h3 class="visual-title">${esc(selected ? L.barsOne + ' · ' + selected.name : L.barsAll)}</h3>
            <ul class="bars">${rows}</ul>
          </div>
        </div>

        <p class="report-hint">${esc(L.hint)}</p>
      </section>`;

    /* Animation d'entrée jouée une seule fois ; ensuite seules les barres s'animent après un clic. */
    const section = $('.report', host);
    if (!state.introPlayed) {
      section.classList.add('is-intro');
      state.introPlayed = true;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        section.classList.remove('is-intro');
        $('.bars', section).classList.add('is-on');
      });
    });

    if (focusSelector) {
      const focusTarget = $(focusSelector, host);
      if (focusTarget) focusTarget.focus();
    }
  }

  /* =====================================================================
     SERVICES : chaîne de la donnée + 4 services
     ===================================================================== */
  function renderServices(sv) {
    if (!sv) return '';
    const L = labels[state.lang].services;

    const steps = $$('step', sv).map(function (s, i) {
      return `<li class="pipe-step c-${STEP_COLORS[i % STEP_COLORS.length]}" data-step="${esc(attr(s, 'id'))}">
        <span class="pipe-node">${svg(attr(s, 'icon'))}</span>
        <span class="pipe-label">${esc(t(s, 'label'))}</span>
      </li>`;
    }).join('');

    const cards = $$('service', sv).map(function (s, i) {
      const tags = $$('tag', s).map(function (g) { return chip(text(g), text(g)); }).join('');
      return `
        <article class="service-card c-${SERVICE_COLORS[i % SERVICE_COLORS.length]}" id="${esc(attr(s, 'id'))}" data-covers="${esc(attr(s, 'covers'))}" tabindex="0" vocab="https://schema.org/" typeof="Service">
          <span class="card-icon">${svg(attr(s, 'icon'))}</span>
          <h3 class="service-title" property="name">${esc(t(s, 'title'))}</h3>
          <p class="service-problem">${esc(t(s, 'problem'))}</p>
          <p class="service-action" property="description">${esc(t(s, 'action'))}</p>
          <p class="service-deliv"><strong>${esc(L.deliverable)}</strong><span>${esc(t(s, 'deliverable'))}</span></p>
          <ul class="tech-stack">${tags}</ul>
        </article>`;
    }).join('');

    return `
      <section id="services" class="section section--white" vocab="https://schema.org/">
        <div class="container">
          <div class="section-head">
            <h2 class="section-title">${esc(t(sv, 'sectionTitle'))}</h2>
            <p class="section-intro">${esc(t(sv, 'sectionIntro'))}</p>
          </div>
          <ol class="pipeline">${steps}</ol>
          <div class="services-grid">${cards}</div>
        </div>
      </section>`;
  }

  /** Au survol d'un service, les étapes de la chaîne qu'il couvre s'allument. */
  function initServiceLinks() {
    const root = $('#dynamic-content');
    if (!root) return;

    function light(card) {
      const pipeline = $('.pipeline', root);
      if (!pipeline) return;
      const ids = card ? (card.dataset.covers || '').split(/\s+/).filter(Boolean) : [];
      $$('.pipe-step', pipeline).forEach(function (step) {
        step.classList.toggle('is-lit', ids.indexOf(step.dataset.step) !== -1);
      });
      pipeline.classList.toggle('has-lit', ids.length > 0);
    }

    root.addEventListener('mouseover', function (event) {
      const card = event.target.closest('.service-card');
      if (card) light(card);
    });
    root.addEventListener('mouseout', function (event) {
      if (event.target.closest('.service-card')) light(null);
    });
    root.addEventListener('focusin', function (event) {
      const card = event.target.closest('.service-card');
      if (card) light(card);
    });
    root.addEventListener('focusout', function (event) {
      if (event.target.closest('.service-card')) light(null);
    });
  }

  /* =====================================================================
     RÉALISATIONS (cartes façon éditeur de code)
     ===================================================================== */
  function renderCases(cs) {
    if (!cs) return '';
    const L = labels[state.lang].cases;

    const cards = $$('caseItem', cs).map(function (c, i) {
      const names = $$('tech', c).map(localName);
      const stack = names.map(function (name, j) {
        return `<span class="tk-str">"${esc(name)}"</span>${j < names.length - 1 ? '<span class="tk-punct">, </span>' : ''}`;
      }).join('');

      let comps = $$('comp[lang="' + state.lang + '"]', c);
      if (!comps.length) comps = $$('comp[lang="fr"]', c);
      const list = comps.map(function (g) { return `<li>${esc(text(g))}</li>`; }).join('');

      return `
        <article class="case-card c-${CASE_COLORS[i % CASE_COLORS.length]}" id="${esc(attr(c, 'id'))}" vocab="https://schema.org/" typeof="CreativeWork">
          <div class="case-head"><span class="card-icon">${svg(attr(c, 'icon'))}</span><span class="case-role">${esc(L.role)}</span></div>
          <h3 class="case-title" property="name">${esc(t(c, 'caseTitle'))}</h3>
          <p class="case-desc" property="description">${esc(t(c, 'caseDesc'))}</p>
          <p class="case-label">${esc(L.tech)}</p>
          <p class="case-stack" dir="ltr" aria-label="${esc(names.join(', '))}"><span class="tk-key">stack</span><span class="tk-punct"> = [ </span>${stack}<span class="tk-punct"> ]</span></p>
          <p class="case-label">${esc(L.skills)}</p>
          <ul class="case-skills">${list}</ul>
          <a class="case-link" href="#contact">${esc(L.cta)}</a>
        </article>`;
    }).join('');

    return `
      <section id="cases" class="section section--code" vocab="https://schema.org/">
        <div class="container">
          <div class="section-head">
            <h2 class="section-title">${esc(t(cs, 'sectionTitle'))}</h2>
            <p class="section-intro">${esc(t(cs, 'sectionIntro'))}</p>
          </div>
          <div class="cases-grid">${cards}</div>
        </div>
      </section>`;
  }

  /* =====================================================================
     À PROPOS (avec un bloc JSON-LD coloré façon éditeur)
     ===================================================================== */
  function jsonLd(identity, experience, education) {
    const company = text(experience.querySelector('position company')).split(' – ')[0];
    const school = t(education.querySelector('degree'), 'institution').split(' – ')[0];
    const str = function (s) { return `<span class="tk-str">"${esc(s)}"</span>`; };
    const key = function (s) { return `<span class="tk-key">"${esc(s)}"</span>`; };
    const punct = function (s) { return `<span class="tk-punct">${s}</span>`; };
    const row = function (k, v, last) { return '  ' + key(k) + punct(': ') + v + (last ? '' : punct(',')); };

    return [
      punct('{'),
      row('@context', str('https://schema.org')),
      row('@type', str('Person')),
      row('name', str(text(identity.querySelector('fullName')))),
      row('jobTitle', str(t(identity, 'title'))),
      row('worksFor', str(company)),
      row('alumniOf', str(school)),
      row('email', str(text(identity.querySelector('email')))),
      '  ' + key('sameAs') + punct(': [') ,
      '    ' + str(attr(identity.querySelector('linkedin'), 'url')) + punct(','),
      '    ' + str(attr(identity.querySelector('github'), 'url')),
      '  ' + punct(']'),
      punct('}')
    ].join('\n');
  }

  function renderAbout(about, identity, experience, education) {
    const L = labels[state.lang].about;
    const fullName = text(identity.querySelector('fullName'));
    const location = t(identity, 'location');
    const email = text(identity.querySelector('email'));
    const phone = text(identity.querySelector('phone'));

    const tiles = [
      ['teal', 'code', L.web],
      ['yellow', 'reporting', L.data],
      ['coral', 'gear', L.systems],
      ['sky', 'globe', L.multi]
    ].map(function (tile) {
      return `
        <div class="highlight-card c-${tile[0]}" typeof="DefinedTerm">
          <span class="highlight-icon">${svg(tile[1])}</span>
          <strong property="name">${esc(tile[2][0])}</strong>
          <span property="description">${esc(tile[2][1])}</span>
        </div>`;
    }).join('');

    return `
      <section id="about" class="section" vocab="https://schema.org/" typeof="Person" about="#riham">
        <div class="container about-grid">
          <div class="about-text">
            <h2 class="section-title">${esc(t(about, 'sectionTitle'))}</h2>
            <p class="about-paragraph" property="description">${esc(contentLang(about, 'content'))}</p>

            <dl class="about-info">
              <div><dt>${svg('pin')}</dt><dd property="address">${esc(location)}</dd></div>
              <div><dt>${svg('mail')}</dt><dd><a href="mailto:${esc(email)}" property="email">${esc(email)}</a></dd></div>
              <div><dt>${svg('phone')}</dt><dd><a class="ltr-iso" href="tel:${esc(phone.replace(/\s/g, ''))}" property="telephone">${esc(phone)}</a></dd></div>
            </dl>

            <meta property="name" content="${esc(fullName)}">

            <div class="about-highlights">${tiles}</div>
          </div>

          <figure class="code-card">
            <figcaption class="code-title">${esc(L.codeTitle)}</figcaption>
            <pre class="code-body" dir="ltr" tabindex="0" aria-label="${esc(L.codeTitle)}"><code>${jsonLd(identity, experience, education)}</code></pre>
            <p class="code-note">${esc(L.codeNote)}</p>
          </figure>
        </div>
      </section>`;
  }

  /* =====================================================================
     FORMATION
     ===================================================================== */
  function renderEducation(education) {
    const items = $$('degree', education).map(function (degree, i) {
      return `
        <li class="timeline-item c-${EDU_COLORS[i % EDU_COLORS.length]}" id="${esc(attr(degree, 'id'))}" typeof="EducationalOccupationalCredential">
          <div class="timeline-marker" aria-hidden="true"></div>
          <div class="timeline-content">
            <time class="timeline-period ltr-iso" property="dateCreated">${esc(text(degree.querySelector('period')))}</time>
            <h3 class="timeline-diploma" property="name">${esc(t(degree, 'diploma'))}</h3>
            <p class="timeline-institution" property="recognizedBy">${esc(t(degree, 'institution'))}</p>
            <p class="timeline-location" property="spatial">${esc(t(degree, 'location_edu'))}</p>
            <p class="timeline-desc" property="description">${esc(t(degree, 'description'))}</p>
          </div>
        </li>`;
    }).join('');

    return `
      <section id="education" class="section section--white" vocab="https://schema.org/">
        <div class="container">
          <div class="section-head">
            <h2 class="section-title">${esc(t(education, 'sectionTitle'))}</h2>
          </div>
          <ol class="timeline">${items}</ol>
        </div>
      </section>`;
  }

  /* =====================================================================
     EXPÉRIENCE
     ===================================================================== */
  function renderExperience(experience) {
    const current = labels[state.lang];

    const cards = $$('position', experience).map(function (position) {
      let list = $$(`missions[lang="${state.lang}"] mission`, position);
      if (!list.length) list = $$('missions[lang="fr"] mission', position);
      const missions = list.map(function (mission) {
        return `<li class="exp-mission" property="description">${esc(text(mission))}</li>`;
      }).join('');

      return `
        <article class="experience-card" id="${esc(attr(position, 'id'))}" vocab="https://schema.org/" typeof="OrganizationRole">
          <div class="exp-header">
            <div class="exp-company-block">
              <h3 class="exp-role" property="roleName">${esc(t(position, 'role'))}</h3>
              <p class="exp-company" property="memberOf">${esc(text(position.querySelector('company')))}</p>
            </div>
            <div class="exp-meta">
              <span class="exp-period ltr-iso" property="startDate">${esc(t(position, 'period_exp'))}</span>
              <span class="exp-location" property="location">${esc(t(position, 'location_exp'))}</span>
              <span class="exp-contract" property="description">${esc(t(position, 'contract'))}</span>
            </div>
          </div>
          <ul class="exp-missions" aria-label="${esc(current.exp.missions)}">
            ${missions}
          </ul>
        </article>`;
    }).join('');

    return `
      <section id="experience" class="section" vocab="https://schema.org/">
        <div class="container">
          <div class="section-head">
            <h2 class="section-title">${esc(t(experience, 'sectionTitle'))}</h2>
          </div>
          ${cards}
        </div>
      </section>`;
  }

  /* =====================================================================
     COMPÉTENCES
     ===================================================================== */
  function renderSkills(skills) {
    const iconFor = { 'cat-languages': 'code', 'cat-data': 'reporting', 'cat-frameworks': 'gear', 'cat-web': 'globe', 'cat-soft': 'bulb', 'cat-languages-human': 'globe' };

    const categories = $$('category', skills).map(function (category, index) {
      const id = attr(category, 'id');
      const color = CAT_COLORS[id] || CAT_FALLBACK[index % CAT_FALLBACK.length];

      const list = $$('skill', category).map(function (skill) {
        const level = attr(skill, 'level', 'intermediate');
        const percent = levelPercent(skill);
        const name = localName(skill);

        return `
          <li class="skill-item" data-level="${esc(level)}" data-pct="${percent}" typeof="DefinedTerm">
            <span class="skill-name" property="name">${esc(name)}</span>
            <meta property="description" content="${esc(level)}">
            <meta property="knowledgeLevel" content="${percent}%">
            <span class="skill-pct" aria-hidden="true">${percent}%</span>
            <div class="skill-bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(name)}">
              <div class="skill-bar-fill" style="width:${percent}%"></div>
            </div>
          </li>`;
      }).join('');

      return `
        <div class="skill-category c-${color}" data-category-id="${esc(id)}" typeof="ItemList">
          <h3 class="skill-category-title" property="name">
            <span class="skill-icon" aria-hidden="true">${svg(iconFor[id])}</span>
            ${esc(t(category, 'categoryName'))}
          </h3>
          <ul class="skill-list">${list}</ul>
        </div>`;
    }).join('');

    return `
      <section id="skills" class="section section--white" vocab="https://schema.org/">
        <div class="container">
          <div class="section-head">
            <h2 class="section-title">${esc(t(skills, 'sectionTitle'))}</h2>
          </div>
          <div class="skills-grid">${categories}</div>
        </div>
      </section>`;
  }

  /* =====================================================================
     PROJETS
     ===================================================================== */
  function renderProjects(projects) {
    const current = labels[state.lang];

    const filters = `
      <div class="project-filters" role="group" aria-label="${esc(current.aria.projectFilters)}">
        <button class="filter-btn active" data-filter="all" type="button" aria-pressed="true">${esc(current.filter.all)}</button>
        <button class="filter-btn" data-filter="web" type="button" aria-pressed="false">${esc(current.filter.web)}</button>
        <button class="filter-btn" data-filter="mobile" type="button" aria-pressed="false">${esc(current.filter.mobile)}</button>
        <button class="filter-btn" data-filter="algorithm" type="button" aria-pressed="false">${esc(current.filter.algorithm)}</button>
        <button class="filter-btn" data-filter="desktop" type="button" aria-pressed="false">${esc(current.filter.desktop)}</button>
      </div>`;

    const cards = $$('project', projects).map(function (project) {
      const type = attr(project, 'type');
      const color = TYPE_COLORS[type] || 'charcoal';
      const techs = $$('techStack tech', project).map(function (tech) {
        return chip(text(tech), localName(tech), ' property="programmingLanguage"');
      }).join('');

      let linkHtml = '';
      const projectLink = project.querySelector('projectLink');
      if (projectLink) {
        const url = attr(projectLink, 'url');
        const label = attr(projectLink, 'label') || url;
        linkHtml = `
          <a class="project-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer" property="codeRepository">${esc(label)}</a>`;
      }

      return `
        <article class="project-card c-${color}" data-type="${esc(type)}" id="${esc(attr(project, 'id'))}" vocab="https://schema.org/" typeof="SoftwareSourceCode">
          <span class="type-tag">${esc((current.filter[type]) || type)}</span>
          <h3 class="project-title" property="name">${esc(t(project, 'projectTitle'))}</h3>
          <p class="project-period ltr-iso" property="dateCreated">${esc(t(project, 'period_proj'))}</p>
          <p class="project-desc" property="description">${esc(t(project, 'projectDesc'))}</p>
          <ul class="tech-stack" aria-label="${esc(current.cases.tech)}">${techs}</ul>
          ${linkHtml}
        </article>`;
    }).join('');

    return `
      <section id="projects" class="section" vocab="https://schema.org/">
        <div class="container">
          <div class="section-head">
            <h2 class="section-title">${esc(t(projects, 'sectionTitle'))}</h2>
          </div>
          ${filters}
          <div class="projects-grid">${cards}</div>
        </div>
      </section>`;
  }

  function initProjectFilters() {
    const root = $('#dynamic-content');
    if (!root) return;

    root.addEventListener('click', function (event) {
      const button = event.target.closest('.filter-btn');
      if (!button) return;

      $$('.filter-btn', root).forEach(function (btn) {
        const on = btn === button;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
      });

      const filter = button.dataset.filter;
      $$('.project-card', root).forEach(function (card) {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.type !== filter);
      });
    });
  }

  /* =====================================================================
     CONTACT
     ===================================================================== */
  function renderContact(contact, identity) {
    const email = text(identity.querySelector('email'));
    const phone = text(identity.querySelector('phone'));
    const linkedin = identity.querySelector('linkedin');
    const github = identity.querySelector('github');

    return `
      <section id="contact" class="section section--contact" vocab="https://schema.org/" typeof="Person" about="#riham">
        <div class="container contact-grid">
          <div class="contact-text">
            <h2 class="section-title">${esc(t(contact, 'sectionTitle'))}</h2>
            <p class="contact-intro">${esc(t(contact, 'contactIntro'))}</p>
          </div>
          <div class="contact-links">
            <a class="contact-link-item" href="mailto:${esc(email)}" property="email">
              <span class="contact-icon">${svg('mail')}</span>
              <span>${esc(email)}</span>
            </a>
            <a class="contact-link-item" href="tel:${esc(phone.replace(/\s/g, ''))}" property="telephone">
              <span class="contact-icon">${svg('phone')}</span>
              <span class="ltr-iso">${esc(phone)}</span>
            </a>
            <a class="contact-link-item" href="${esc(attr(linkedin, 'url'))}" target="_blank" rel="noopener noreferrer" property="sameAs">
              <span class="contact-icon">${svg('link')}</span>
              <span>LinkedIn · ${esc(attr(linkedin, 'label'))}</span>
            </a>
            <a class="contact-link-item" href="${esc(attr(github, 'url'))}" target="_blank" rel="noopener noreferrer" property="sameAs">
              <span class="contact-icon">${svg('code')}</span>
              <span>GitHub · ${esc(attr(github, 'label'))}</span>
            </a>
          </div>
        </div>
      </section>`;
  }

  /* =====================================================================
     NAVIGATION : lien actif au défilement
     ===================================================================== */
  function updateActiveNav() {
    const sections = $$('main section[id]');
    const navLinks = $$('.nav-link');
    if (!sections.length || !navLinks.length) return;

    let currentId = '';
    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 140 && rect.bottom >= 140) currentId = section.id;
    });

    navLinks.forEach(function (link) {
      const target = link.getAttribute('href').replace('#', '');
      const active = target === currentId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
  }

  function initActiveNav() {
    window.addEventListener('scroll', updateActiveNav, { passive: true });
  }
})();