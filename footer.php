<?php
/**
 * footer.php
 * Pied de page commun à toutes les pages du portfolio
 *
 * Inclut :
 *  - Microdata schema.org/Person (suite du head, fermée ici)
 *  - Liens de contact et réseaux sociaux
 *  - Mentions légales et crédits
 *  - Inclusion du JavaScript principal
 *
 * Variables attendues :
 *  $currentLang  : string
 *  $identity     : array
 */

defined('ROOT_PATH') or exit('Accès direct interdit.');

$footerLabels = [
    'fr' => [
        'rights'     => 'Tous droits réservés.',
        'built_with' => 'Réalisé avec PHP, XML/XSLT et du soin.',
        'nav_label'  => 'Navigation secondaire',
        'contact_label' => 'Coordonnées',
    ],
    'en' => [
        'rights'     => 'All rights reserved.',
        'built_with' => 'Built with PHP, XML/XSLT and care.',
        'nav_label'  => 'Secondary navigation',
        'contact_label' => 'Contact details',
    ],
    'ar' => [
        'rights'     => 'جميع الحقوق محفوظة.',
        'built_with' => 'مُنجز بـ PHP وXML/XSLT واهتمام.',
        'nav_label'  => 'تصفح ثانوي',
        'contact_label' => 'معلومات الاتصال',
    ],
];
$fl = $footerLabels[$currentLang];
?>

    <!-- ═══════════════════════════════════════════════════════════
         PIED DE PAGE
         Microdata schema.org/Person – informations complémentaires
         ═══════════════════════════════════════════════════════════ -->
    <footer class="site-footer" role="contentinfo"
            itemscope itemtype="https://schema.org/Person">

        <!-- Données schema.org cachées visuellement mais lisibles par les moteurs -->
        <meta itemprop="name"       content="<?= h($identity['fullName']) ?>" />
        <meta itemprop="email"      content="<?= h($identity['email']) ?>" />
        <meta itemprop="telephone"  content="<?= h($identity['phone']) ?>" />
        <meta itemprop="address"    content="<?= h($identity['location']) ?>" />
        <meta itemprop="url"        content="<?= h(BASE_URL . '/index.php?lang=' . $currentLang) ?>" />
        <link itemprop="sameAs"     href="<?= h($identity['linkedin']['url']) ?>" />
        <link itemprop="sameAs"     href="<?= h($identity['github']['url']) ?>" />

        <div class="footer-inner container">

            <!-- Colonne gauche : nom + tagline -->
            <div class="footer-brand">
                <p class="footer-name" itemprop="name"><?= h($identity['fullName']) ?></p>
                <p class="footer-built"><?= h($fl['built_with']) ?></p>
            </div>

            <!-- Colonne centre : liens de contact -->
            <nav class="footer-contact" aria-label="<?= h($fl['contact_label']) ?>">
                <a href="mailto:<?= h($identity['email']) ?>"
                   class="footer-link"
                   itemprop="email">
                    ✉ <?= h($identity['email']) ?>
                </a>
                <a href="tel:<?= h(preg_replace('/\s/', '', $identity['phone'])) ?>"
                   class="footer-link"
                   itemprop="telephone">
                    ☎ <?= h($identity['phone']) ?>
                </a>
                <a href="<?= h($identity['linkedin']['url']) ?>"
                   class="footer-link"
                   target="_blank"
                   rel="noopener noreferrer"
                   itemprop="sameAs">
                    in <?= h($identity['linkedin']['label']) ?>
                </a>
                <a href="<?= h($identity['github']['url']) ?>"
                   class="footer-link"
                   target="_blank"
                   rel="noopener noreferrer"
                   itemprop="sameAs">
                    ⌥ <?= h($identity['github']['label']) ?>
                </a>
            </nav>

            <!-- Colonne droite : navigation rapide -->
            <nav class="footer-nav" aria-label="<?= h($fl['nav_label']) ?>">
                <?php
                $navLinks = [
                    'fr' => ['#about'=>'À propos','#education'=>'Formation','#projects'=>'Projets','#contact'=>'Contact'],
                    'en' => ['#about'=>'About','#education'=>'Education','#projects'=>'Projects','#contact'=>'Contact'],
                    'ar' => ['#about'=>'من أنا','#education'=>'التكوين','#projects'=>'المشاريع','#contact'=>'التواصل'],
                ];
                foreach ($navLinks[$currentLang] as $anchor => $label): ?>
                <a href="<?= h('index.php?lang=' . $currentLang . $anchor) ?>"
                   class="footer-nav-link">
                    <?= h($label) ?>
                </a>
                <?php endforeach; ?>
            </nav>

        </div><!-- /.footer-inner -->

        <!-- Copyright -->
        <div class="footer-copy">
            <p>
                &copy; <?= date('Y') ?>
                <span itemprop="name"><?= h($identity['fullName']) ?></span>
                &mdash; <?= h($fl['rights']) ?>
            </p>
            <p class="footer-academic">
                Portfolio Web Sémantique &ndash; Sup Galilée / Université Sorbonne Paris Nord
            </p>
        </div>

    </footer>

    <!-- JavaScript principal (chargé en bas pour ne pas bloquer le rendu) -->
    <script src="assets/js/main.js" defer></script>

</body>
</html>