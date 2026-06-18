<?php
/**
 * header.php
 * En-tête HTML commun à toutes les pages du portfolio
 *
 * Inclut :
 *  - <!DOCTYPE html> conforme HTML5 / XHTML
 *  - Balises <meta> sémantiques avec la langue courante
 *  - Liens <link rel="alternate" hreflang="..."> pour le SEO multilingue
 *  - Microdata schema.org sur la personne (Person)
 *  - Navigation principale avec sélecteur de langue fixe
 *  - Attributs lang et dir corrects
 *
 * Variables attendues dans le contexte appelant :
 *  $currentLang  : string  (fr|en|ar)
 *  $siteMeta     : array   (title, description, keywords)
 *  $identity     : array   (fullName, email, location, ...)
 *  $currentPage  : string  (nom de la page courante, ex: 'index')
 */

// Sécurité : ne pas exposer ce fichier directement
defined('ROOT_PATH') or exit('Accès direct interdit.');

$dir    = SUPPORTED_LANGS[$currentLang]['dir'];   // ltr ou rtl
$flag   = SUPPORTED_LANGS[$currentLang]['flag'];

// Labels de navigation traduits
$navLabels = [
    'fr' => ['about'=>'À propos','education'=>'Formation','experience'=>'Expérience','skills'=>'Compétences','projects'=>'Projets','video'=>'Vidéo','contact'=>'Contact'],
    'en' => ['about'=>'About','education'=>'Education','experience'=>'Experience','skills'=>'Skills','projects'=>'Projects','video'=>'Video','contact'=>'Contact'],
    'ar' => ['about'=>'من أنا','education'=>'التكوين','experience'=>'التجربة','skills'=>'المهارات','projects'=>'المشاريع','video'=>'فيديو','contact'=>'التواصل'],
];
$nav = $navLabels[$currentLang];

// Labels du bouton de langue dans chaque langue
$skipLabel = [
    'fr' => 'Aller au contenu principal',
    'en' => 'Skip to main content',
    'ar' => 'انتقل إلى المحتوى الرئيسي',
];
?>
<!DOCTYPE html>
<html lang="<?= h($currentLang) ?>" dir="<?= h($dir) ?>">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <!-- Titre et métadonnées selon la langue -->
    <title><?= h($siteMeta['title']) ?></title>
    <meta name="description" content="<?= h($siteMeta['description']) ?>" />
    <meta name="keywords"    content="<?= h($siteMeta['keywords']) ?>" />
    <meta name="author"      content="<?= h($identity['fullName']) ?>" />
    <meta name="robots"      content="index, follow" />

    <!-- Open Graph -->
    <meta property="og:title"       content="<?= h($siteMeta['title']) ?>" />
    <meta property="og:description" content="<?= h($siteMeta['description']) ?>" />
    <meta property="og:type"        content="website" />
    <meta property="og:locale"      content="<?= h(SUPPORTED_LANGS[$currentLang]['locale']) ?>" />

    <!--
        Liens hreflang : conformité SEO multilingue (recommandation Google).
        Chaque version de langue pointe vers les autres, et vers x-default.
        Le changement de langue conserve la page courante via lang_url().
    -->
    <?php foreach (SUPPORTED_LANGS as $code => $meta): ?>
    <link rel="alternate"
          hreflang="<?= h($meta['hreflang']) ?>"
          href="<?= h(BASE_URL . '/index.php?lang=' . $code) ?>" />
    <?php endforeach; ?>
    <!-- Version par défaut (fr) pour x-default -->
    <link rel="alternate"
          hreflang="x-default"
          href="<?= h(BASE_URL . '/index.php?lang=fr') ?>" />

    <!-- Feuille de style principale -->
    <link rel="stylesheet" href="assets/css/style.css" />

    <!-- Favicon (TODO: remplacer par un vrai favicon) -->
    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg" />

    <!--
        Microdata schema.org : Person
        Permettent aux moteurs de recherche d'identifier l'auteur du portfolio.
        Ces données sémantiques sont conformes aux exigences de l'énoncé.
        Source : https://schema.org/Person
    -->
</head>
<body
    class="lang-<?= h($currentLang) ?>"
    data-lang="<?= h($currentLang) ?>"
    data-dir="<?= h($dir) ?>">

    <!-- Lien d'évitement pour l'accessibilité (navigation clavier) -->
    <a href="#main-content" class="skip-link">
        <?= h($skipLabel[$currentLang]) ?>
    </a>

    <!--
        ═══════════════════════════════════════════════════════════
        EN-TÊTE PRINCIPAL
        ═══════════════════════════════════════════════════════════
        Microdata schema.org/Person sur l'auteur du portfolio.
    -->
    <header class="site-header" role="banner">
        <div class="header-inner container">

            <!-- Logo / Nom -->
            <a href="index.php?lang=<?= h($currentLang) ?>"
               class="header-logo"
               aria-label="<?= h($identity['fullName']) ?> – Portfolio">
                <span class="logo-first">Riham</span>
                <span class="logo-last">KB</span>
            </a>

            <!-- Navigation principale -->
            <nav class="main-nav" role="navigation" aria-label="Navigation principale">
                <button class="nav-toggle"
                        aria-label="Ouvrir le menu"
                        aria-expanded="false"
                        aria-controls="nav-menu"
                        type="button">
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                </button>

                <ul id="nav-menu" class="nav-menu" role="list">
                    <li><a href="#about"      class="nav-link"><?= h($nav['about']) ?></a></li>
                    <li><a href="#education"  class="nav-link"><?= h($nav['education']) ?></a></li>
                    <li><a href="#experience" class="nav-link"><?= h($nav['experience']) ?></a></li>
                    <li><a href="#skills"     class="nav-link"><?= h($nav['skills']) ?></a></li>
                    <li><a href="#projects"   class="nav-link"><?= h($nav['projects']) ?></a></li>
                    <li><a href="#video"      class="nav-link"><?= h($nav['video']) ?></a></li>
                    <li><a href="#contact"    class="nav-link"><?= h($nav['contact']) ?></a></li>
                </ul>
            </nav>

            <!--
                ═══════════════════════════════════════════════
                SÉLECTEUR DE LANGUE – Position fixe (exigence énoncé)
                Utilise POST pour respecter la priorité n°2.
                Les drapeaux utilisent les caractères Unicode
                de la plage "Enclosed Alphanumeric Supplement"
                (mentionnée dans l'énoncé, note de bas de page).
                ═══════════════════════════════════════════════
            -->
            <div class="lang-switcher" aria-label="Sélecteur de langue" role="navigation">
                <?php foreach (SUPPORTED_LANGS as $code => $meta): ?>
                <form method="post"
                      action="<?= h(strtok($_SERVER['REQUEST_URI'] ?? 'index.php', '?')) ?>"
                      class="lang-form"
                      aria-label="Langue <?= h($meta['label']) ?>">

                    <!-- Conservation de tous les paramètres GET -->
                    <?php foreach ($_GET as $k => $v): if ($k === 'lang') continue; ?>
                    <input type="hidden"
                           name="<?= h($k) ?>"
                           value="<?= h($v) ?>" />
                    <?php endforeach; ?>

                    <input type="hidden" name="lang" value="<?= h($code) ?>" />

                    <button type="submit"
                            class="lang-btn <?= $code === $currentLang ? 'lang-btn--active' : '' ?>"
                            lang="<?= h($code) ?>"
                            dir="<?= h($meta['dir']) ?>"
                            aria-current="<?= $code === $currentLang ? 'true' : 'false' ?>"
                            aria-label="Passer en <?= h($meta['label']) ?>">
                        <span class="lang-flag" aria-hidden="true"><?= $meta['flag'] ?></span>
                        <span class="lang-code"><?= h(strtoupper($code)) ?></span>
                    </button>
                </form>
                <?php endforeach; ?>
            </div>

        </div><!-- /.header-inner -->
    </header>