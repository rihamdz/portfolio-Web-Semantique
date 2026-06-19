
/**
 * Version statique du portfolio.
 * Remplace PHP + XSLTProcessor par JavaScript côté navigateur.
 * Les données restent dans portfolio.xml.
 */
(function () {
  'use strict';

  const state = { lang: localStorage.getItem('portfolioLang') || 'fr', xml: null };

  const labels = {
    fr: { dir:'ltr', nav:{about:'À propos',education:'Formation',experience:'Expérience',skills:'Compétences',projects:'Projets',video:'Vidéo',contact:'Contact'}, cta:{projects:'Voir mes projets',contact:'Me contacter'}, footer:{built:'Réalisé avec HTML, CSS, JavaScript et XML.', rights:'Tous droits réservés.'}, filter:{all:'Tous', algorithm:'Algo'}, form:{note:'Formulaire statique : utilisez les liens de contact ci-dessous.'}},
    en: { dir:'ltr', nav:{about:'About',education:'Education',experience:'Experience',skills:'Skills',projects:'Projects',video:'Video',contact:'Contact'}, cta:{projects:'View my projects',contact:'Contact me'}, footer:{built:'Built with HTML, CSS, JavaScript and XML.', rights:'All rights reserved.'}, filter:{all:'All', algorithm:'Algo'}, form:{note:'Static form: please use the contact links below.'}},
    ar: { dir:'rtl', nav:{about:'من أنا',education:'التكوين',experience:'التجربة',skills:'المهارات',projects:'المشاريع',video:'فيديو',contact:'التواصل'}, cta:{projects:'عرض مشاريعي',contact:'تواصل معي'}, footer:{built:'مُنجز بـ HTML وCSS وJavaScript وXML.', rights:'جميع الحقوق محفوظة.'}, filter:{all:'الكل', algorithm:'خوارزميات'}, form:{note:'النموذج ثابت: يرجى استخدام روابط التواصل أدناه.'}}
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const text = (node, fallback = '') => node ? node.textContent.trim() : fallback;
  const attr = (node, name, fallback = '') => node ? (node.getAttribute(name) || fallback) : fallback;
  const t = (parent, path, lang = state.lang) => text(parent.querySelector(`${path} > translation[lang="${lang}"]`));
  const contentLang = (parent, path, lang = state.lang) => text(parent.querySelector(`${path}[lang="${lang}"]`));
  const esc = (s) => String(s || '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    $('#year').textContent = new Date().getFullYear();
    initMenu();
    initLanguageButtons();

    try {
      const response = await fetch('portfolio.xml');
      const xmlText = await response.text();
      state.xml = new DOMParser().parseFromString(xmlText, 'application/xml');
      renderAll();
    } catch (e) {
      $('#dynamic-content').innerHTML = '<section class="section"><div class="container"><p>Erreur : impossible de charger portfolio.xml.</p></div></section>';
      console.error(e);
    }
  }

  function initMenu() {
    const btn = $('.nav-toggle');
    const nav = $('#main-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open', !expanded);
    });
  }

  function initLanguageButtons() {
    $$('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.lang = btn.dataset.lang;
        localStorage.setItem('portfolioLang', state.lang);
        renderAll();
      });
    });
  }

  function applyLabels() {
    const L = labels[state.lang];
    document.documentElement.lang = state.lang;
    document.documentElement.dir = L.dir;
    $$('[data-i18n]').forEach(el => {
      const path = el.dataset.i18n.split('.');
      let value = labels[state.lang];
      path.forEach(p => value = value && value[p]);
      if (value) el.textContent = value;
    });
    $$('.lang-btn').forEach(btn => btn.classList.toggle('lang-btn--active', btn.dataset.lang === state.lang));
  }

  function renderAll() {
    applyLabels();
    const root = state.xml.querySelector('portfolio');
    const identity = root.querySelector('identity');
    const meta = root.querySelector('meta');

    document.title = t(meta, 'siteTitle') || 'Portfolio – Riham Kaddour Bakir';
    const desc = t(meta, 'siteDescription');
    if ($('meta[name="description"]')) $('meta[name="description"]').setAttribute('content', desc);

    renderHero(identity);
    $('#dynamic-content').innerHTML = [
      renderAbout(root.querySelector('about'), identity),
      renderEducation(root.querySelector('education')),
      renderExperience(root.querySelector('experience')),
      renderSkills(root.querySelector('skills')),
      renderProjects(root.querySelector('projects')),
      renderVideo(root.querySelector('video')),
      renderContact(root.querySelector('contact'), identity)
    ].join('');
    renderFooterContact(identity);
    initProjectFilters();
    initReveal();
    animateSkillBars();
  }

  function renderHero(identity) {
    const fullName = text(identity.querySelector('fullName'), 'Riham Kaddour Bakir');
    const parts = fullName.split(' ');
    $('#hero-firstname').textContent = parts.shift() || fullName;
    $('#hero-lastname').textContent = ' ' + parts.join(' ');
    $('#hero-title').textContent = t(identity, 'title');
    $('#hero-tagline').textContent = t(identity, 'tagline');

    const photo = identity.querySelector('photo');
    const src = attr(photo, 'src');
    const alt = attr(photo, `alt_${state.lang}`, fullName);
    $('#hero-photo-zone').innerHTML = src
      ? `<img class="hero-photo" src="${esc(src)}" alt="${esc(alt)}" onerror="this.outerHTML='<div class=&quot;hero-photo-fallback&quot;>RKB</div>'">`
      : '<div class="hero-photo-fallback">RKB</div>';
  }

  function renderAbout(about, identity) {
    return `<section id="about" class="section reveal"><div class="container about-grid">
      <div><h2 class="section-title">${esc(t(about, 'sectionTitle'))}</h2><p class="about-paragraph">${esc(contentLang(about, 'content'))}</p>
        <dl class="about-info">
          <dt>📍</dt><dd>${esc(text(identity.querySelector('location')))}</dd>
          <dt>✉</dt><dd><a href="mailto:${esc(text(identity.querySelector('email')))}">${esc(text(identity.querySelector('email')))}</a></dd>
          <dt>☎</dt><dd><a href="tel:${esc(text(identity.querySelector('phone')).replace(/\s/g,''))}">${esc(text(identity.querySelector('phone')))}</a></dd>
        </dl></div>
      <div class="about-highlights">
        <div class="highlight-card"><span class="highlight-icon">💻</span><strong>Web</strong><span>HTML CSS JS XML</span></div>
        <div class="highlight-card"><span class="highlight-icon">📊</span><strong>Data</strong><span>SQL Power BI</span></div>
        <div class="highlight-card"><span class="highlight-icon">⚙️</span><strong>Systèmes</strong><span>Réseaux & outils</span></div>
        <div class="highlight-card"><span class="highlight-icon">🌍</span><strong>Multilingue</strong><span>FR / EN / AR</span></div>
      </div></div></section>`;
  }

  function renderEducation(education) {
    const items = $$('degree', education).map(d => `<li class="timeline-item" id="${esc(attr(d,'id'))}"><div class="timeline-marker"></div><div class="timeline-content">
      <time class="timeline-period">${esc(text(d.querySelector('period')))}</time>
      <h3 class="timeline-diploma">${esc(t(d,'diploma'))}</h3>
      <p class="timeline-institution">${esc(t(d,'institution'))}</p>
      <p class="timeline-location">${esc(text(d.querySelector('location_edu')))}</p>
      <p class="timeline-desc">${esc(t(d,'description'))}</p>
    </div></li>`).join('');
    return `<section id="education" class="section reveal"><div class="container"><h2 class="section-title">${esc(t(education,'sectionTitle'))}</h2><ol class="timeline">${items}</ol></div></section>`;
  }

  function renderExperience(experience) {
    const cards = $$('position', experience).map(p => {
      const missions = $$(`missions[lang="${state.lang}"] mission`, p).map(m => `<li class="exp-mission">${esc(text(m))}</li>`).join('');
      return `<article class="experience-card" id="${esc(attr(p,'id'))}"><div class="exp-header"><div class="exp-company-block">
        <h3 class="exp-role">${esc(t(p,'role'))}</h3><p class="exp-company">${esc(text(p.querySelector('company')))}</p></div>
        <div class="exp-meta"><span class="exp-period">${esc(text(p.querySelector('period_exp')))}</span><span class="exp-location">${esc(text(p.querySelector('location_exp')))}</span><span class="exp-contract">${esc(t(p,'contract'))}</span></div></div>
        <ul class="exp-missions">${missions}</ul></article>`;
    }).join('');
    return `<section id="experience" class="section reveal"><div class="container"><h2 class="section-title">${esc(t(experience,'sectionTitle'))}</h2>${cards}</div></section>`;
  }

  function renderSkills(skills) {
    const pct = { beginner:25, intermediate:55, advanced:80, expert:100 };
    const cats = $$('category', skills).map(c => {
      const list = $$('skill', c).map(s => {
        const level = attr(s, 'level', 'intermediate');
        return `<li class="skill-item" data-level="${esc(level)}" data-pct="${pct[level] || 50}"><span class="skill-name">${esc(attr(s,'name'))}</span><div class="skill-bar" role="progressbar" aria-valuenow="${pct[level] || 50}" aria-valuemin="0" aria-valuemax="100"><div class="skill-bar-fill" style="width:0%"></div></div></li>`;
      }).join('');
      return `<div class="skill-category" data-category-id="${esc(attr(c,'id'))}"><h3 class="skill-category-title"><span class="skill-icon">${esc(attr(c,'icon'))}</span>${esc(t(c,'categoryName'))}</h3><ul class="skill-list">${list}</ul></div>`;
    }).join('');
    return `<section id="skills" class="section reveal"><div class="container"><h2 class="section-title">${esc(t(skills,'sectionTitle'))}</h2><div class="skills-grid">${cats}</div></div></section>`;
  }

  function renderProjects(projects) {
    const L = labels[state.lang];
    const filters = `<div class="project-filters"><button class="filter-btn active" data-filter="all" type="button">${L.filter.all}</button><button class="filter-btn" data-filter="web" type="button">Web</button><button class="filter-btn" data-filter="mobile" type="button">Mobile</button><button class="filter-btn" data-filter="algorithm" type="button">${L.filter.algorithm}</button><button class="filter-btn" data-filter="desktop" type="button">Desktop</button></div>`;
    const cards = $$('project', projects).map(p => {
      const techs = $$('techStack tech', p).map(tech => `<span class="tech-badge">${esc(text(tech))}</span>`).join('');
      const link = p.querySelector('projectLink') ? `<a class="project-link" href="${esc(attr(p.querySelector('projectLink'),'url'))}" target="_blank" rel="noopener noreferrer">${esc(attr(p.querySelector('projectLink'),'label'))}</a>` : '';
      return `<article class="project-card" data-type="${esc(attr(p,'type'))}" id="${esc(attr(p,'id'))}"><div class="project-card-header"><h3 class="project-title">${esc(t(p,'projectTitle'))}</h3><span class="project-period">${esc(text(p.querySelector('period_proj')))}</span></div><p class="project-desc">${esc(t(p,'projectDesc'))}</p><div class="tech-stack">${techs}</div>${link}</article>`;
    }).join('');
    return `<section id="projects" class="section reveal"><div class="container"><h2 class="section-title">${esc(t(projects,'sectionTitle'))}</h2>${filters}<div class="projects-grid">${cards}</div></div></section>`;
  }

  function renderVideo(video) {
    const item = video.querySelector(`videoItem[lang="${state.lang}"]`) || video.querySelector('videoItem');
    const id = attr(item, 'youtubeId');
    const title = attr(item, 'title');
    const valid = id && !id.startsWith('TODO');
    return `<section id="video" class="section reveal"><div class="container"><h2 class="section-title">${esc(t(video,'sectionTitle'))}</h2>${valid ? `<div class="video-wrapper"><iframe class="video-iframe" src="https://www.youtube.com/embed/${esc(id)}" title="${esc(title)}" allowfullscreen></iframe></div>` : `<div class="video-placeholder"><p class="video-todo">TODO : remplacer le youtubeId dans portfolio.xml pour afficher la vidéo.</p></div>`}</div></section>`;
  }

  function renderContact(contact, identity) {
    const email = text(identity.querySelector('email'));
    const phone = text(identity.querySelector('phone'));
    const linkedin = identity.querySelector('linkedin');
    const github = identity.querySelector('github');
    return `<section id="contact" class="section reveal"><div class="container contact-grid"><div><h2 class="section-title">${esc(t(contact,'sectionTitle'))}</h2><p class="contact-intro">${esc(t(contact,'contactIntro'))}</p><p class="contact-availability">${esc(t(contact,'availability'))}</p><div class="contact-links">
      <a class="contact-link-item" href="mailto:${esc(email)}"><span class="contact-icon">✉</span>${esc(email)}</a>
      <a class="contact-link-item" href="tel:${esc(phone.replace(/\s/g,''))}"><span class="contact-icon">☎</span>${esc(phone)}</a>
      <a class="contact-link-item" href="${esc(attr(linkedin,'url'))}" target="_blank"><span class="contact-icon">in</span>${esc(attr(linkedin,'label'))}</a>
      <a class="contact-link-item" href="${esc(attr(github,'url'))}" target="_blank"><span class="contact-icon">⌥</span>${esc(attr(github,'label'))}</a>
    </div></div><div class="contact-form-wrapper"><p class="contact-form-note">${labels[state.lang].form.note}</p></div></div></section>`;
  }

  function renderFooterContact(identity) {
    const email = text(identity.querySelector('email'));
    const phone = text(identity.querySelector('phone'));
    $('#footer-contact').innerHTML = `<a class="footer-link" href="mailto:${esc(email)}">✉ ${esc(email)}</a><a class="footer-link" href="tel:${esc(phone.replace(/\s/g,''))}">☎ ${esc(phone)}</a>`;
  }

  function initProjectFilters() {
    $$('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        $$('.project-card').forEach(card => card.classList.toggle('hidden', filter !== 'all' && card.dataset.type !== filter));
      });
    });
  }

  function initReveal() {
    const sections = $$('.reveal');
    if (!('IntersectionObserver' in window)) { sections.forEach(s => s.classList.add('revealed')); return; }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('revealed'); });
    }, { threshold: 0.12 });
    sections.forEach(s => observer.observe(s));
  }

  function animateSkillBars() {
    setTimeout(() => $$('.skill-item').forEach(item => {
      const fill = $('.skill-bar-fill', item);
      if (fill) fill.style.width = (item.dataset.pct || 50) + '%';
    }), 150);
  }
})();

