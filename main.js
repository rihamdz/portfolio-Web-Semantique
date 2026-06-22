/**
 * main.js — version statique avec annotations RDFa
 *
 * Rôle :
 * - Charger portfolio.xml
 * - Gérer la langue (fr/en/ar)
 * - Générer les sections HTML dynamiquement
 * - Ajouter des attributs RDFa dans les contenus rendus
 */
(function () {
  'use strict';

  const state = {
    lang: localStorage.getItem('portfolioLang') || 'fr',
    xml: null
  };

  const labels = {
    fr: {
      dir: 'ltr',
      nav: {
        about: 'À propos',
        education: 'Formation',
        experience: 'Expérience',
        skills: 'Compétences',
        projects: 'Projets',
        semanticTPs: 'Web Sémantique',
        video: 'Vidéo',
        contact: 'Contact'
      },
      cta: {
        semanticTPs: 'Web Sémantique',
        projects: 'Voir mes projets',
        contact: 'Me contacter'
      },
      footer: {
        built: 'Réalisé avec HTML, CSS, JavaScript, XML et RDFa.',
        rights: 'Tous droits réservés.'
      },
      filter: {
        all: 'Tous',
        algorithm: 'Algo'
      },
      form: {
        note: 'Formulaire statique : utilisez les liens de contact ci-dessous.'
      },
      misc: {
        technologies: 'Technologies utilisées',
        missions: 'Missions'
      }
    },
    en: {
      dir: 'ltr',
      nav: {
        about: 'About',
        education: 'Education',
        experience: 'Experience',
        skills: 'Skills',
        projects: 'Projects',
        semanticTPs: 'Semantic Web',
        video: 'Video',
        contact: 'Contact'
      },
      cta: {
        semanticTPs: 'Semantic Web',
        projects: 'View my projects',
        contact: 'Contact me'
      },
      footer: {
        built: 'Built with HTML, CSS, JavaScript, XML and RDFa.',
        rights: 'All rights reserved.'
      },
      filter: {
        all: 'All',
        algorithm: 'Algo'
      },
      form: {
        note: 'soon ...'
      },
      misc: {
        technologies: 'Technologies used',
        missions: 'Tasks'
      }
    },
    ar: {
      dir: 'rtl',
      nav: {
        about: 'من أنا',
        education: 'التكوين',
        experience: 'التجربة',
        skills: 'المهارات',
        projects: 'المشاريع',
        semanticTPs: 'الويب الدلالي',
        video: 'فيديو',
        contact: 'التواصل'
      },
      cta: {
        semanticTPs: 'الويب الدلالي',
        projects: 'عرض مشاريعي',
        contact: 'تواصل معي'
      },
      footer: {
        built: 'مُنجز بـ HTML وCSS وJavaScript وXML وRDFa.',
        rights: 'جميع الحقوق محفوظة.'
      },
      filter: {
        all: 'الكل',
        algorithm: 'خوارزميات'
      },
      form: {
        note: 'النموذج ثابت: يرجى استخدام روابط التواصل أدناه.'
      },
      misc: {
        technologies: 'التقنيات المستخدمة',
        missions: 'المهام'
      }
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function text(node, fallback = '') {
    return node ? node.textContent.trim() : fallback;
  }

  function attr(node, name, fallback = '') {
    return node ? (node.getAttribute(name) || fallback) : fallback;
  }

  function t(parent, path, lang = state.lang) {
    if (!parent) return '';
    return text(parent.querySelector(`${path} > translation[lang="${lang}"]`));
  }

  function contentLang(parent, path, lang = state.lang) {
    if (!parent) return '';
    return text(parent.querySelector(`${path}[lang="${lang}"]`));
  }

  function esc(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    $('#year').textContent = new Date().getFullYear();
    initMenu();
    initLanguageButtons();

    try {
      const response = await fetch('portfolio.xml');
      const xmlText = await response.text();
      state.xml = new DOMParser().parseFromString(xmlText, 'application/xml');

      const parserError = state.xml.querySelector('parsererror');
      if (parserError) {
        throw new Error('portfolio.xml contient une erreur XML.');
      }

      renderAll();
    } catch (error) {
      console.error(error);
      $('#dynamic-content').innerHTML = `
        <section class="section">
          <div class="container">
            <p>Erreur : impossible de charger ou parser <code>portfolio.xml</code>.</p>
          </div>
        </section>`;
    }
  }

  function initMenu() {
    const button = $('.nav-toggle');
    const nav = $('#main-nav');
    if (!button || !nav) return;

    button.addEventListener('click', function () {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open', !expanded);
    });
  }

  function initLanguageButtons() {
    $$('.lang-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        state.lang = button.dataset.lang;
        localStorage.setItem('portfolioLang', state.lang);
        renderAll();
      });
    });
  }

  function applyLabels() {
    const current = labels[state.lang];
    document.documentElement.lang = state.lang;
    document.documentElement.dir = current.dir;

    $$('[data-i18n]').forEach(function (element) {
      const path = element.dataset.i18n.split('.');
      let value = labels[state.lang];

      path.forEach(function (segment) {
        value = value && value[segment];
      });

      if (value) {
        element.textContent = value;
      }
    });

    $$('.lang-btn').forEach(function (button) {
      button.classList.toggle('lang-btn--active', button.dataset.lang === state.lang);
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
    if (metaDesc) metaDesc.setAttribute('content', description);

    renderHero(identity);

    $('#dynamic-content').innerHTML = [
      renderAbout(root.querySelector('about'), identity),
      renderEducation(root.querySelector('education')),
      renderExperience(root.querySelector('experience')),
      renderSkills(root.querySelector('skills')),
      renderProjects(root.querySelector('projects')),
      renderTPs(root.querySelector('semanticTPs')),
      renderVideo(root.querySelector('video')),
      renderContact(root.querySelector('contact'), identity)
    ].join('');

    renderFooterContact(identity);
    initProjectFilters();
    initReveal();
    animateSkillBars();
    setActiveNavOnScroll();
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
      ? `<img class="hero-photo" src="${esc(src)}" alt="${esc(alt)}" property="image" onerror="this.outerHTML='<div class=&quot;hero-photo-fallback&quot; aria-hidden=&quot;true&quot;>RKB</div>'">`
      : '<div class="hero-photo-fallback" aria-hidden="true">RKB</div>';

    const heroSection = $('#home');
    if (heroSection) {
      heroSection.setAttribute('vocab', 'https://schema.org/');
      heroSection.setAttribute('typeof', 'Person');
      heroSection.setAttribute('about', '#riham');
    }

    ensureMeta('#home', 'email', text(identity.querySelector('email')));
    ensureMeta('#home', 'telephone', text(identity.querySelector('phone')));
    ensureMeta('#home', 'address', text(identity.querySelector('location')));
    ensureMeta('#home', 'url', text(identity.querySelector('portfolio_url')));
    ensureSameAs('#home', attr(identity.querySelector('linkedin'), 'url'));
    ensureSameAs('#home', attr(identity.querySelector('github'), 'url'));
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

  function ensureSameAs(rootSelector, href) {
    if (!href) return;
    const root = $(rootSelector);
    if (!root) return;

    const already = Array.from(root.querySelectorAll('link[property="sameAs"]')).some(function (link) {
      return link.getAttribute('href') === href;
    });

    if (!already) {
      const link = document.createElement('link');
      link.setAttribute('property', 'sameAs');
      link.setAttribute('href', href);
      root.appendChild(link);
    }
  }

  function renderAbout(about, identity) {
    const fullName = text(identity.querySelector('fullName'));
    const location = text(identity.querySelector('location'));
    const email = text(identity.querySelector('email'));
    const phone = text(identity.querySelector('phone'));

    return `
      <section id="about" class="section reveal" vocab="https://schema.org/" typeof="Person" about="#riham">
        <div class="container about-grid">
          <div>
            <h2 class="section-title">${esc(t(about, 'sectionTitle'))}</h2>
            <p class="about-paragraph" property="description">${esc(contentLang(about, 'content'))}</p>

            <dl class="about-info">
              <dt>📍</dt>
              <dd property="address">${esc(location)}</dd>

              <dt>✉</dt>
              <dd>
                <a href="mailto:${esc(email)}" property="email">${esc(email)}</a>
              </dd>

              <dt>☎</dt>
              <dd>
                <a href="tel:${esc(phone.replace(/\s/g, ''))}" property="telephone">${esc(phone)}</a>
              </dd>
            </dl>

            <meta property="name" content="${esc(fullName)}">
          </div>

          <div class="about-highlights">
            <div class="highlight-card" typeof="DefinedTerm">
              <span class="highlight-icon">💻</span>
              <strong property="name">Web</strong>
              <span property="description">HTML CSS JS XML</span>
            </div>
            <div class="highlight-card" typeof="DefinedTerm">
              <span class="highlight-icon">📊</span>
              <strong property="name">Data</strong>
              <span property="description">SQL Power BI</span>
            </div>
            <div class="highlight-card" typeof="DefinedTerm">
              <span class="highlight-icon">⚙️</span>
              <strong property="name">Systèmes</strong>
              <span property="description">Réseaux &amp; outils</span>
            </div>
            <div class="highlight-card" typeof="DefinedTerm">
              <span class="highlight-icon">🌍</span>
              <strong property="name">Multilingue</strong>
              <span property="description">FR / EN / AR</span>
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderEducation(education) {
    const items = $$('degree', education).map(function (degree) {
      return `
        <li class="timeline-item" id="${esc(attr(degree, 'id'))}" typeof="EducationalOccupationalCredential">
          <div class="timeline-marker" aria-hidden="true"></div>
          <div class="timeline-content">
            <time class="timeline-period" property="dateCreated">${esc(text(degree.querySelector('period')))}</time>
            <h3 class="timeline-diploma" property="name">${esc(t(degree, 'diploma'))}</h3>
            <p class="timeline-institution" property="recognizedBy">${esc(t(degree, 'institution'))}</p>
            <p class="timeline-location" property="spatial">${esc(text(degree.querySelector('location_edu')))}</p>
            <p class="timeline-desc" property="description">${esc(t(degree, 'description'))}</p>
          </div>
        </li>`;
    }).join('');

    return `
      <section id="education" class="section reveal" vocab="https://schema.org/">
        <div class="container">
          <h2 class="section-title">${esc(t(education, 'sectionTitle'))}</h2>
          <ol class="timeline">${items}</ol>
        </div>
      </section>`;
  }

  function renderExperience(experience) {
    const current = labels[state.lang];

    const cards = $$('position', experience).map(function (position) {
      const missions = $$(`missions[lang="${state.lang}"] mission`, position).map(function (mission) {
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
              <span class="exp-period" property="startDate">${esc(text(position.querySelector('period_exp')))}</span>
              <span class="exp-location" property="location">${esc(text(position.querySelector('location_exp')))}</span>
              <span class="exp-contract" property="description">${esc(t(position, 'contract'))}</span>
            </div>
          </div>
          <ul class="exp-missions" aria-label="${esc(current.misc.missions)}">
            ${missions}
          </ul>
        </article>`;
    }).join('');

    return `
      <section id="experience" class="section reveal" vocab="https://schema.org/">
        <div class="container">
          <h2 class="section-title">${esc(t(experience, 'sectionTitle'))}</h2>
          ${cards}
        </div>
      </section>`;
  }

  function renderSkills(skills) {
    const percentages = {
      beginner: 25,
      intermediate: 55,
      advanced: 80,
      expert: 100
    };

    const categories = $$('category', skills).map(function (category) {
      const list = $$('skill', category).map(function (skill) {
        const level = attr(skill, 'level', 'intermediate');
        const percent = percentages[level] || 50;
        const name = attr(skill, 'name');

        return `
          <li class="skill-item" data-level="${esc(level)}" data-pct="${percent}" typeof="DefinedTerm">
            <span class="skill-name" property="name">${esc(name)}</span>
            <meta property="description" content="${esc(level)}">
            <meta property="knowledgeLevel" content="${percent}%">
            <div class="skill-bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(name)} – ${percent}%">
              <div class="skill-bar-fill" style="width:0%"></div>
            </div>
          </li>`;
      }).join('');

      return `
        <div class="skill-category" data-category-id="${esc(attr(category, 'id'))}" typeof="ItemList">
          <h3 class="skill-category-title" property="name">
            <span class="skill-icon" aria-hidden="true">${esc(attr(category, 'icon'))}</span>
            ${esc(t(category, 'categoryName'))}
          </h3>
          <ul class="skill-list">${list}</ul>
        </div>`;
    }).join('');

    return `
      <section id="skills" class="section reveal" vocab="https://schema.org/">
        <div class="container">
          <h2 class="section-title">${esc(t(skills, 'sectionTitle'))}</h2>
          <div class="skills-grid">${categories}</div>
        </div>
      </section>`;
  }

  function renderProjects(projects) {
    const current = labels[state.lang];

    const filters = `
      <div class="project-filters" role="group" aria-label="Filtrer les projets">
        <button class="filter-btn active" data-filter="all" type="button">${esc(current.filter.all)}</button>
        <button class="filter-btn" data-filter="web" type="button">Web</button>
        <button class="filter-btn" data-filter="mobile" type="button">Mobile</button>
        <button class="filter-btn" data-filter="algorithm" type="button">${esc(current.filter.algorithm)}</button>
        <button class="filter-btn" data-filter="desktop" type="button">Desktop</button>
      </div>`;

    const cards = $$('project', projects).map(function (project) {
      const techs = $$('techStack tech', project).map(function (tech) {
        return `<span class="tech-badge" property="programmingLanguage">${esc(text(tech))}</span>`;
      }).join('');

      let linkHtml = '';
      const projectLink = project.querySelector('projectLink');
      if (projectLink) {
        const url = attr(projectLink, 'url');
        const label = attr(projectLink, 'label') || url;
        linkHtml = `
          <a class="project-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer" property="codeRepository">
            ${esc(label)}
          </a>`;
      }

      return `
        <article class="project-card" data-type="${esc(attr(project, 'type'))}" id="${esc(attr(project, 'id'))}" vocab="https://schema.org/" typeof="SoftwareSourceCode">
          <div class="project-card-header">
            <h3 class="project-title" property="name">${esc(t(project, 'projectTitle'))}</h3>
            <span class="project-period" property="dateCreated">${esc(text(project.querySelector('period_proj')))}</span>
          </div>
          <p class="project-desc" property="description">${esc(t(project, 'projectDesc'))}</p>
          <div class="tech-stack" aria-label="${esc(current.misc.technologies)}">
            ${techs}
          </div>
          ${linkHtml}
        </article>`;
    }).join('');

    return `
      <section id="projects" class="section reveal" vocab="https://schema.org/">
        <div class="container">
          <h2 class="section-title">${esc(t(projects, 'sectionTitle'))}</h2>
          ${filters}
          <div class="projects-grid">${cards}</div>
        </div>
      </section>`;
  }


  function renderTPs(semanticTPs) {
    if (!semanticTPs) return '';
    const lang = state.lang;

    const tpLabelMap = {
      fr: { notions: 'Notions clés', techs: 'Technologies' },
      en: { notions: 'Key concepts', techs: 'Technologies' },
      ar: { notions: 'المفاهيم الأساسية', techs: 'التقنيات' }
    };
    const lbl = tpLabelMap[lang] || tpLabelMap['fr'];

    const intro = (() => {
      const n = semanticTPs.querySelector('sectionIntro > translation[lang="' + lang + '"]');
      return n ? n.textContent.trim() : '';
    })();

    const cards = Array.from(semanticTPs.querySelectorAll('tp')).map(function(tp) {
      const tpTitle = (() => {
        const n = tp.querySelector('tpTitle > translation[lang="' + lang + '"]');
        return n ? n.textContent.trim() : '';
      })();
      const tpDesc = (() => {
        const n = tp.querySelector('tpDesc > translation[lang="' + lang + '"]');
        return n ? n.textContent.trim() : '';
      })();
      const icon = attr(tp, 'icon', '📌');
      const num = attr(tp, 'number', '');

      const techs = Array.from(tp.querySelectorAll('techStack > tech'))
        .map(function(t) { return `<span class="tp-tech">${esc(t.textContent.trim())}</span>`; })
        .join('');

      const notions = Array.from(tp.querySelectorAll(`notions > notion[lang="${lang}"]`))
        .map(function(n) { return `<li>${esc(n.textContent.trim())}</li>`; })
        .join('');

      return `
        <article class="tp-card" vocab="https://schema.org/" typeof="LearningResource" id="tp${esc(num)}">
          <div class="tp-card-header">
            <span class="tp-icon">${esc(icon)}</span>
            <h3 class="tp-card-title" property="name">${esc(tpTitle)}</h3>
          </div>
          <p class="tp-card-desc" property="description">${esc(tpDesc)}</p>
          <div class="tp-techs">
            <span class="tp-label">${esc(lbl.techs)} :</span>
            ${techs}
          </div>
          ${notions ? `<div class="tp-notions">
            <span class="tp-label">${esc(lbl.notions)} :</span>
            <ul class="tp-notions-list">${notions}</ul>
          </div>` : ''}
        </article>`;
    }).join('');

    const sectionTitle = (() => {
      const n = semanticTPs.querySelector('sectionTitle > translation[lang="' + lang + '"]');
      return n ? n.textContent.trim() : 'Web Sémantique – TPs';
    })();

    return `
      <section id="semantic-tps" class="section reveal" vocab="https://schema.org/" typeof="Course">
        <div class="container">
          <h2 class="section-title" property="name">${esc(sectionTitle)}</h2>
          ${intro ? `<p class="tps-intro" property="description">${esc(intro)}</p>` : ''}
          <div class="tps-grid">${cards}</div>
        </div>
      </section>`;
  }

  function renderVideo(video) {
    const item = video.querySelector(`videoItem[lang="${state.lang}"]`) || video.querySelector('videoItem');
    const youtubeId = attr(item, 'youtubeId');
    const title = attr(item, 'title');
    const valid = youtubeId && !youtubeId.startsWith('TODO');

    // Vidéo LSF — ID fixe, pas besoin de passer par le XML
    const LSF_ID = 'Zz711bmuUBw';
    const lsfTitles = {
      fr: "Comment dire « Bonjour, je m'appelle… » en langue des signes",
      en: "How to sign 'Hello, my name is...' in sign language",
      ar: "كيف تقول «مرحباً، اسمي...» بلغة الإشارة"
    };
    const lsfTitle = lsfTitles[state.lang] || lsfTitles['fr'];

    return `
      <section id="video" class="section reveal" vocab="https://schema.org/">
        <div class="container">
          <h2 class="section-title">${esc(t(video, 'sectionTitle'))}</h2>
          ${valid
            ? `<div class="video-wrapper" typeof="VideoObject">
                 <meta property="name" content="${esc(title)}">
                 <meta property="embedUrl" content="https://www.youtube.com/embed/${esc(youtubeId)}">
                 <iframe class="video-iframe" src="https://www.youtube.com/embed/${esc(youtubeId)}" title="${esc(title)}" allowfullscreen></iframe>
               </div>`
            : ''}
          <div class="video-extra" style="${valid ? 'margin-top:2rem;border-top:1px solid var(--color-border);padding-top:2rem;' : ''}">
            <h3 class="video-extra-title" style="font-size:1rem;margin-bottom:.75rem;color:var(--color-accent);">🤟 ${esc(lsfTitle)}</h3>
            <div class="video-wrapper" typeof="VideoObject">
              <meta property="name" content="${esc(lsfTitle)}">
              <meta property="embedUrl" content="https://www.youtube.com/embed/${LSF_ID}">
              <iframe class="video-iframe" src="https://www.youtube.com/embed/${LSF_ID}" title="${esc(lsfTitle)}" allowfullscreen></iframe>
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderContact(contact, identity) {
    const email = text(identity.querySelector('email'));
    const phone = text(identity.querySelector('phone'));
    const linkedin = identity.querySelector('linkedin');
    const github = identity.querySelector('github');

    return `
      <section id="contact" class="section reveal" vocab="https://schema.org/" typeof="Person" about="#riham">
        <div class="container contact-grid">
          <div>
            <h2 class="section-title">${esc(t(contact, 'sectionTitle'))}</h2>
            <p class="contact-intro">${esc(t(contact, 'contactIntro'))}</p>
            <div class="contact-links">
              <a class="contact-link-item" href="mailto:${esc(email)}" property="email">
                <span class="contact-icon">✉</span>
                ${esc(email)}
              </a>
              <a class="contact-link-item" href="tel:${esc(phone.replace(/\s/g, ''))}" property="telephone">
                <span class="contact-icon">☎</span>
                ${esc(phone)}
              </a>
              <a class="contact-link-item" href="${esc(attr(linkedin, 'url'))}" target="_blank" rel="noopener noreferrer" property="sameAs">
                <span class="contact-icon">in</span>
                ${esc(attr(linkedin, 'label'))}
              </a>
              <a class="contact-link-item" href="${esc(attr(github, 'url'))}" target="_blank" rel="noopener noreferrer" property="sameAs">
                <span class="contact-icon">⌥</span>
                ${esc(attr(github, 'label'))}
              </a>
            </div>
          </div>

        </div>
      </section>`;
  }

  function renderFooterContact(identity) {
    const container = $('#footer-contact');
    if (!container) return;

    const email = text(identity.querySelector('email'));
    const phone = text(identity.querySelector('phone'));

    container.innerHTML = `
      <a class="footer-link" href="mailto:${esc(email)}" property="email">✉ ${esc(email)}</a>
      <a class="footer-link" href="tel:${esc(phone.replace(/\s/g, ''))}" property="telephone">☎ ${esc(phone)}</a>`;
  }

  function initProjectFilters() {
    $$('.filter-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        $$('.filter-btn').forEach(function (btn) {
          btn.classList.remove('active');
        });
        button.classList.add('active');

        const filter = button.dataset.filter;
        $$('.project-card').forEach(function (card) {
          const hide = filter !== 'all' && card.dataset.type !== filter;
          card.classList.toggle('hidden', hide);
        });
      });
    });
  }

  function initReveal() {
    const sections = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      sections.forEach(function (section) {
        section.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.12 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function animateSkillBars() {
    setTimeout(function () {
      $$('.skill-item').forEach(function (item) {
        const fill = $('.skill-bar-fill', item);
        if (fill) {
          fill.style.width = (item.dataset.pct || 50) + '%';
        }
      });
    }, 150);
  }

  function setActiveNavOnScroll() {
    const sections = $$('main section[id]');
    const navLinks = $$('.nav-link');

    if (!sections.length || !navLinks.length) return;

    function updateActiveLink() {
      let currentId = '';

      sections.forEach(function (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 140) {
          currentId = section.id;
        }
      });

      navLinks.forEach(function (link) {
        const target = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', target === currentId);
      });
    }

    updateActiveLink();
    window.removeEventListener('scroll', updateActiveLink);
    window.addEventListener('scroll', updateActiveLink, { passive: true });
  }
})();
