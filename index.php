<?php
/**
 * index.php
 * Page principale du portfolio de Riham Kaddour Bakir
 * Web Sémantique – Sup Galilée / Université Sorbonne Paris Nord
 *
 * ARCHITECTURE MVC légère :
 *  - config.php   : détermine $currentLang (priorités 1→5)
 *  - xml_loader.php : lit portfolio.xml et expose les données
 *  - header.php / footer.php : mise en page commune
 *  - Ce fichier : contrôleur + vue principale
 */

// ─── Contrôleur ──────────────────────────────────────────────────────────────
require_once 'includes/config.php';
require_once 'includes/xml_loader.php';

// Données nécessaires à la vue
$siteMeta   = get_site_meta($currentLang);
$identity   = get_identity($currentLang);
$about      = get_about($currentLang);
$video      = get_video($currentLang);
$contact    = get_contact($currentLang);
$currentPage = 'index';

// Sections HTML générées via XSLT (transformation XML→HTML côté serveur)
$htmlSkills     = xslt_render('skills',     $currentLang);
$htmlProjects   = xslt_render('projects',   $currentLang);
$htmlEducation  = xslt_render('education',  $currentLang);
$htmlExperience = xslt_render('experience', $currentLang);

$dir = SUPPORTED_LANGS[$currentLang]['dir'];

// Labels hero (non stockés en XML pour démontrer PHP pur aussi)
$heroLabels = [
    'fr' => [
        'cta_contact'    => 'Me contacter',
        'cta_projects'   => 'Voir mes projets',
        'available'      => 'Disponible en alternance',
        'scroll'         => 'Défiler',
        'about_section'  => 'À propos',
        'video_section'  => 'Présentation vidéo',
        'contact_section'=> 'Contact',
        'contact_form_name'  => 'Votre nom',
        'contact_form_email' => 'Votre email',
        'contact_form_msg'   => 'Votre message',
        'contact_form_send'  => 'Envoyer',
        'contact_form_note'  => 'Ce formulaire est un prototype — contactez-moi directement par email.',
    ],
    'en' => [
        'cta_contact'    => 'Contact me',
        'cta_projects'   => 'See my projects',
        'available'      => 'Available for apprenticeship',
        'scroll'         => 'Scroll',
        'about_section'  => 'About me',
        'video_section'  => 'Video presentation',
        'contact_section'=> 'Contact',
        'contact_form_name'  => 'Your name',
        'contact_form_email' => 'Your email',
        'contact_form_msg'   => 'Your message',
        'contact_form_send'  => 'Send',
        'contact_form_note'  => 'This form is a prototype — contact me directly by email.',
    ],
    'ar' => [
        'cta_contact'    => 'تواصل معي',
        'cta_projects'   => 'اكتشف مشاريعي',
        'available'      => 'متاحة للتدريب المتناوب',
        'scroll'         => 'انزل',
        'about_section'  => 'من أنا',
        'video_section'  => 'تقديم بالفيديو',
        'contact_section'=> 'التواصل',
        'contact_form_name'  => 'اسمك',
        'contact_form_email' => 'بريدك الإلكتروني',
        'contact_form_msg'   => 'رسالتك',
        'contact_form_send'  => 'إرسال',
        'contact_form_note'  => 'هذا النموذج تجريبي — تواصل معي مباشرة عبر البريد الإلكتروني.',
    ],
];
$hl = $heroLabels[$currentLang];

// ─── Vue ──────────────────────────────────────────────────────────────────────
require_once 'includes/header.php';
?>

    <!--
        ════════════════════════════════════════════════════════════
        CONTENU PRINCIPAL
        Microdata schema.org/Person (auteur du portfolio)
        ════════════════════════════════════════════════════════════
    -->
    <main id="main-content" role="main"
          itemscope itemtype="https://schema.org/Person">

        <!-- Données sémantiques invisibles mais indexées -->
        <meta itemprop="name"       content="<?= h($identity['fullName']) ?>" />
        <meta itemprop="jobTitle"   content="<?= h($identity['title']) ?>" />
        <meta itemprop="email"      content="<?= h($identity['email']) ?>" />
        <meta itemprop="telephone"  content="<?= h($identity['phone']) ?>" />
        <meta itemprop="address"    content="<?= h($identity['location']) ?>" />
        <link  itemprop="sameAs"    href="<?= h($identity['linkedin']['url']) ?>" />
        <link  itemprop="sameAs"    href="<?= h($identity['github']['url']) ?>" />
        <meta itemprop="nationality" content="DZ" />
        <meta itemprop="knowsLanguage" content="fr" />
        <meta itemprop="knowsLanguage" content="en" />
        <meta itemprop="knowsLanguage" content="ar" />

        <!-- ════════════════════════════════════════════════════════
             HERO : Section d'accroche
             ════════════════════════════════════════════════════════ -->
        <section id="hero" class="hero" aria-labelledby="hero-name">
            <div class="hero-bg-grid" aria-hidden="true"></div>

            <div class="hero-inner container">

                <!-- Photo de profil -->
                <div class="hero-photo-wrapper">
                    <img
                        src="<?= h($identity['photo_src']) ?>"
                        alt="<?= h($identity['photo_alt']) ?>"
                        class="hero-photo"
                        width="200"
                        height="200"
                        itemprop="image"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                    />
                    <!-- Fallback avatar si photo absente -->
                    <div class="hero-photo-fallback" aria-hidden="true"
                         style="display:none">RKB</div>
                </div>

                <!-- Texte hero -->
                <div class="hero-text">
                    <p class="hero-eyebrow"><?= h($identity['tagline']) ?></p>

                    <h1 id="hero-name" class="hero-name" itemprop="name">
                        <span class="hero-name-first">Riham</span>
                        <span class="hero-name-last"> Kaddour Bakir</span>
                    </h1>

                    <p class="hero-title" itemprop="jobTitle">
                        <?= h($identity['title']) ?>
                    </p>

                    <!-- Badge de disponibilité -->
                    <p class="hero-badge">
                        <span class="badge-dot" aria-hidden="true"></span>
                        <?= h($hl['available']) ?>
                    </p>

                    <!-- Boutons d'appel à l'action -->
                    <div class="hero-cta" role="group">
                        <a href="#contact"
                           class="btn btn-primary">
                            <?= h($hl['cta_contact']) ?>
                        </a>
                        <a href="#projects"
                           class="btn btn-outline">
                            <?= h($hl['cta_projects']) ?>
                        </a>
                    </div>
                </div>

            </div><!-- /.hero-inner -->

            <!-- Indicateur de défilement -->
            <div class="hero-scroll" aria-hidden="true">
                <span><?= h($hl['scroll']) ?></span>
                <div class="scroll-arrow"></div>
            </div>
        </section>

        <!-- ════════════════════════════════════════════════════════
             ABOUT : Présentation personnelle
             ════════════════════════════════════════════════════════ -->
        <section id="about" class="section reveal" aria-labelledby="about-title">
            <div class="container">
                <h2 id="about-title" class="section-title">
                    <?= h($hl['about_section']) ?>
                </h2>
                <div class="about-grid">
                    <div class="about-text">
                        <p class="about-paragraph" itemprop="description">
                            <?= h($about) ?>
                        </p>
                        <!-- Informations clés -->
                        <dl class="about-info" aria-label="Informations clés">
                            <dt>📍</dt>
                            <dd itemprop="address"><?= h($identity['location']) ?></dd>

                            <dt>✉</dt>
                            <dd>
                                <a href="mailto:<?= h($identity['email']) ?>"
                                   itemprop="email">
                                    <?= h($identity['email']) ?>
                                </a>
                            </dd>

                            <dt>☎</dt>
                            <dd>
                                <a href="tel:<?= h(preg_replace('/\s/', '', $identity['phone'])) ?>"
                                   itemprop="telephone">
                                    <?= h($identity['phone']) ?>
                                </a>
                            </dd>

                            <dt>in</dt>
                            <dd>
                                <a href="<?= h($identity['linkedin']['url']) ?>"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   itemprop="sameAs">
                                    <?= h($identity['linkedin']['label']) ?>
                                </a>
                            </dd>
                        </dl>
                    </div>

                    <!-- Carte de compétences "top" affichée dynamiquement par JS -->
                    <div class="about-highlights" aria-label="Points forts" data-reveal="true">
                        <div class="highlight-card" data-anim="slide-in">
                            <span class="highlight-icon" aria-hidden="true">🎓</span>
                            <strong>Sup Galilée</strong>
                            <span>Cycle ingénieur 2024–2027</span>
                        </div>
                        <div class="highlight-card" data-anim="slide-in">
                            <span class="highlight-icon" aria-hidden="true">🏢</span>
                            <strong>GRDF</strong>
                            <span>Data & IT Systems</span>
                        </div>
                        <div class="highlight-card" data-anim="slide-in">
                            <span class="highlight-icon" aria-hidden="true">💻</span>
                            <strong>Full-Stack</strong>
                            <span>PHP · React · Flutter</span>
                        </div>
                        <div class="highlight-card" data-anim="slide-in">
                            <span class="highlight-icon" aria-hidden="true">📊</span>
                            <strong>Data & BI</strong>
                            <span>SQL · Power BI · ETL</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ════════════════════════════════════════════════════════
             EDUCATION : Généré par XSLT (reveal géré dans le XSL)
             ════════════════════════════════════════════════════════ -->
        <?= $htmlEducation ?>

        <!-- ════════════════════════════════════════════════════════
             EXPERIENCE : Généré par XSLT (reveal géré dans le XSL)
             ════════════════════════════════════════════════════════ -->
        <?= $htmlExperience ?>

        <!-- ════════════════════════════════════════════════════════
             SKILLS : Généré par XSLT (reveal géré dans le XSL)
             ════════════════════════════════════════════════════════ -->
        <?= $htmlSkills ?>

        <!-- ════════════════════════════════════════════════════════
             PROJECTS : Généré par XSLT
             ════════════════════════════════════════════════════════ -->
        <?= $htmlProjects ?>
        </div>

        <!-- ════════════════════════════════════════════════════════
             VIDEO : Présentation multilingue
             Déterminée par la langue courante ($currentLang)
             ════════════════════════════════════════════════════════ -->
        <section id="video" class="section reveal" aria-labelledby="video-title">
            <div class="container">
                <h2 id="video-title" class="section-title">
                    <?= h($hl['video_section']) ?>
                </h2>

                <?php if (!empty($video) && !empty($video['youtubeId']) && strpos($video['youtubeId'], 'TODO') === false): ?>
                <!-- Intégration YouTube : iframe responsive -->
                <div class="video-wrapper"
                     role="region"
                     aria-label="<?= h($video['title']) ?>">
                    <iframe
                        class="video-iframe"
                        src="https://www.youtube-nocookie.com/embed/<?= h($video['youtubeId']) ?>?hl=<?= h($currentLang) ?>&cc_lang_pref=<?= h($currentLang) ?>&cc_load_policy=1"
                        title="<?= h($video['title']) ?>"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        loading="lazy"
                        lang="<?= h($currentLang) ?>">
                    </iframe>
                </div>

                <?php elseif (!empty($video)): ?>
                <!-- Placeholder vidéo (TODO non rempli) -->
                <div class="video-placeholder" role="alert" aria-live="polite">
                    <p class="video-todo">
                        <?php
                        $videoTodo = [
                            'fr' => '📹 Vidéo de présentation à venir — remplacez <code>youtubeId</code> dans <code>portfolio.xml</code>.',
                            'en' => '📹 Presentation video coming soon — replace <code>youtubeId</code> in <code>portfolio.xml</code>.',
                            'ar' => '📹 فيديو التقديم قريبًا — استبدل <code>youtubeId</code> في <code>portfolio.xml</code>.',
                        ];
                        echo $videoTodo[$currentLang];
                        ?>
                    </p>
                    <!-- Démonstration de l'intégration avec une vidéo de substitution -->
                    <div class="video-wrapper">
                        <iframe
                            class="video-iframe"
                            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
                            title="Vidéo de démonstration"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                </div>
                <?php endif; ?>

            </div>
        </section>

        <!-- ════════════════════════════════════════════════════════
             CONTACT
             ════════════════════════════════════════════════════════ -->
        <section id="contact" class="section reveal" aria-labelledby="contact-title">
            <div class="container">
                <h2 id="contact-title" class="section-title">
                    <?= h($contact['sectionTitle']) ?>
                </h2>

                <div class="contact-grid">

                    <!-- Infos de contact -->
                    <div class="contact-info">
                        <p class="contact-intro">
                            <?= h($contact['intro']) ?>
                        </p>
                        <p class="contact-availability">
                            <?= h($contact['availability']) ?>
                        </p>

                        <ul class="contact-links" aria-label="Moyens de contact">
                            <li>
                                <a href="mailto:<?= h($contact['email']) ?>"
                                   class="contact-link-item">
                                    <span class="contact-icon" aria-hidden="true">✉</span>
                                    <?= h($contact['email']) ?>
                                </a>
                            </li>
                            <li>
                                <a href="<?= h($contact['linkedin']['url']) ?>"
                                   class="contact-link-item"
                                   target="_blank"
                                   rel="noopener noreferrer">
                                    <span class="contact-icon" aria-hidden="true">in</span>
                                    <?= h($contact['linkedin']['label']) ?>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <!-- Formulaire de contact (prototype) -->
                    <div class="contact-form-wrapper">
                        <p class="contact-form-note" role="note">
                            ⚠ <?= h($hl['contact_form_note']) ?>
                        </p>
                        <div class="contact-form" role="form" aria-label="Formulaire de contact">
                            <div class="form-group">
                                <label for="contact-name"><?= h($hl['contact_form_name']) ?></label>
                                <input
                                    type="text"
                                    id="contact-name"
                                    name="name"
                                    placeholder="<?= h($hl['contact_form_name']) ?>"
                                    autocomplete="name"
                                    dir="<?= h($dir) ?>"
                                />
                            </div>
                            <div class="form-group">
                                <label for="contact-email"><?= h($hl['contact_form_email']) ?></label>
                                <input
                                    type="email"
                                    id="contact-email"
                                    name="email"
                                    placeholder="<?= h($hl['contact_form_email']) ?>"
                                    autocomplete="email"
                                    dir="ltr"
                                />
                            </div>
                            <div class="form-group">
                                <label for="contact-message"><?= h($hl['contact_form_msg']) ?></label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    rows="5"
                                    placeholder="<?= h($hl['contact_form_msg']) ?>"
                                    dir="<?= h($dir) ?>"></textarea>
                            </div>
                            <button type="button" class="btn btn-primary" id="contact-submit">
                                <?= h($hl['contact_form_send']) ?>
                            </button>
                        </div>
                    </div>

                </div><!-- /.contact-grid -->
            </div>
        </section>

    </main><!-- /#main-content -->

<?php
// Injection de la langue courante pour le JavaScript
echo '<script>window.PORTFOLIO_LANG = ' . json_encode($currentLang) . '; window.PORTFOLIO_DIR = ' . json_encode($dir) . ';</script>';

require_once 'includes/footer.php';
?>
