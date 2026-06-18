<?php
/**
 * xml_loader.php
 * Chargement, validation et lecture du fichier XML portfolio
 * + Transformation XSLT pour générer des fragments HTML
 *
 * Web Sémantique – Sup Galilée / Université Sorbonne Paris Nord
 *
 * FONCTIONNEMENT :
 * 1. load_xml()       : charge portfolio.xml avec validation DTD
 * 2. get_translation(): extrait une traduction dans la langue courante
 * 3. xslt_render()    : transforme une section XML → HTML via XSLT
 * 4. get_section_*()  : fonctions haut niveau pour chaque section
 */

require_once __DIR__ . '/config.php';

/**
 * Charge et retourne le DOMDocument du portfolio XML.
 * La validation DTD est activée pour garantir la conformité.
 *
 * @return DOMDocument
 * @throws RuntimeException si le fichier est manquant ou invalide
 */
function load_xml(): DOMDocument
{
    static $doc = null;   // Cache : on ne charge qu'une fois par requête

    if ($doc !== null) {
        return $doc;
    }

    if (!file_exists(XML_PATH)) {
        throw new RuntimeException('Fichier XML introuvable : ' . XML_PATH);
    }

    // Supprime les avertissements libxml pour les gérer manuellement
    libxml_use_internal_errors(true);

    $doc = new DOMDocument('1.0', 'UTF-8');

    // Chargement avec résolution des entités et validation DTD
    $doc->resolveExternals  = true;
    $doc->validateOnParse   = true;
    $doc->preserveWhiteSpace = false;

    $loaded = $doc->load(XML_PATH, LIBXML_DTDVALID | LIBXML_NONET);

    // Récupération des erreurs libxml
    $errors = libxml_get_errors();
    libxml_clear_errors();

    if (!$loaded) {
        $msg = 'Impossible de charger le XML.';
        if (!empty($errors)) {
            $msg .= ' ' . $errors[0]->message;
        }
        throw new RuntimeException($msg);
    }

    // Log les avertissements sans bloquer (en mode dev)
    if (!empty($errors) && ini_get('display_errors')) {
        foreach ($errors as $err) {
            error_log('[XML Warning] ' . trim($err->message) . ' (ligne ' . $err->line . ')');
        }
    }

    return $doc;
}

/**
 * Récupère une valeur XPath du document XML.
 *
 * @param  string $xpath  Expression XPath
 * @param  string $lang   Code langue pour les translations[@lang=...]
 * @return string         Valeur textuelle du premier nœud trouvé
 */
function xml_get(string $xpath, string $lang = ''): string
{
    $doc   = load_xml();
    $xp    = new DOMXPath($doc);

    // Injection de la langue dans l'expression si placeholder {lang}
    if ($lang !== '') {
        $xpath = str_replace('{lang}', $lang, $xpath);
    }

    $nodes = $xp->query($xpath);

    if ($nodes === false || $nodes->length === 0) {
        return '';
    }

    return trim($nodes->item(0)->textContent);
}

/**
 * Retourne toutes les valeurs d'une expression XPath sous forme de tableau.
 *
 * @param  string $xpath
 * @param  string $lang
 * @return array
 */
function xml_get_all(string $xpath, string $lang = ''): array
{
    $doc   = load_xml();
    $xp    = new DOMXPath($doc);

    if ($lang !== '') {
        $xpath = str_replace('{lang}', $lang, $xpath);
    }

    $nodes  = $xp->query($xpath);
    $result = [];

    if ($nodes === false) {
        return $result;
    }

    foreach ($nodes as $node) {
        $result[] = trim($node->textContent);
    }

    return $result;
}

/**
 * Transforme une section du XML via XSLT et retourne le HTML généré.
 *
 * Utilisé pour les sections skills, projects, education, experience.
 * Le résultat est un fragment HTML prêt à être inséré dans la page.
 *
 * @param  string $section  Identifiant de section (skills|projects|education|experience|all)
 * @param  string $lang     Code langue courant
 * @return string           Fragment HTML
 * @throws RuntimeException si XSLT introuvable ou erreur de transformation
 */
function xslt_render(string $section, string $lang): string
{
    if (!file_exists(XSLT_PATH)) {
        throw new RuntimeException('Feuille XSLT introuvable : ' . XSLT_PATH);
    }

    libxml_use_internal_errors(true);

    // Chargement du document XSL
    $xsl = new DOMDocument();
    $xsl->load(XSLT_PATH, LIBXML_NONET);

    // Création du processeur XSLT
    $proc = new XSLTProcessor();
    $proc->importStylesheet($xsl);

    // Injection des paramètres (lang et section)
    $proc->setParameter('', 'lang',    $lang);
    $proc->setParameter('', 'section', $section);

    // Transformation du XML
    $xml    = load_xml();
    $result = $proc->transformToXML($xml);

    $errors = libxml_get_errors();
    libxml_clear_errors();

    if ($result === false) {
        $msg = 'Erreur XSLT lors de la transformation de la section "' . $section . '".';
        if (!empty($errors)) {
            $msg .= ' ' . $errors[0]->message;
        }
        throw new RuntimeException($msg);
    }

    return $result;
}

// ─── Fonctions haut niveau par section ───────────────────────────────────────

/**
 * Retourne les données d'identité du portfolio.
 *
 * @param  string $lang
 * @return array  Tableau associatif avec toutes les infos d'identité
 */
function get_identity(string $lang): array
{
    $doc = load_xml();
    $xp  = new DOMXPath($doc);

    return [
        'fullName'  => xml_get('//identity/fullName'),
        'title'     => xml_get("//identity/title/translation[@lang='$lang']"),
        'tagline'   => xml_get("//identity/tagline/translation[@lang='$lang']"),
        'location'  => xml_get('//identity/location'),
        'email'     => xml_get('//identity/email'),
        'phone'     => xml_get('//identity/phone'),
        'photo_src' => xml_get('//identity/photo/@src'),  // attribut
        'photo_alt' => xml_get("//identity/photo/@alt_$lang"),
        'linkedin'  => [
            'url'   => xml_get('//identity/linkedin/@url'),
            'label' => xml_get('//identity/linkedin/@label'),
        ],
        'github'    => [
            'url'   => xml_get('//identity/github/@url'),
            'label' => xml_get('//identity/github/@label'),
        ],
    ];
}

/**
 * Retourne le contenu About dans la langue donnée.
 *
 * @param  string $lang
 * @return string
 */
function get_about(string $lang): string
{
    return xml_get("//about/content[@lang='$lang']");
}

/**
 * Retourne les titres de sections traduits.
 *
 * @param  string $section  Nom de la section XML (about, skills, projects, etc.)
 * @param  string $lang
 * @return string
 */
function get_section_title(string $section, string $lang): string
{
    return xml_get("//$section/sectionTitle/translation[@lang='$lang']");
}

/**
 * Retourne les métadonnées du site (title, description, keywords) traduits.
 *
 * @param  string $lang
 * @return array
 */
function get_site_meta(string $lang): array
{
    return [
        'title'       => xml_get("//meta/siteTitle/translation[@lang='$lang']"),
        'description' => xml_get("//meta/siteDescription/translation[@lang='$lang']"),
        'keywords'    => xml_get("//meta/keywords/translation[@lang='$lang']"),
    ];
}

/**
 * Retourne les données de la vidéo pour une langue donnée.
 *
 * @param  string $lang
 * @return array  [youtubeId, title, subtitleSrc] ou tableau vide si absent
 */
function get_video(string $lang): array
{
    $doc = load_xml();
    $xp  = new DOMXPath($doc);

    $nodes = $xp->query("//video/videoItem[@lang='$lang']");

    if ($nodes === false || $nodes->length === 0) {
        return [];
    }

    $node = $nodes->item(0);

    return [
        'youtubeId'   => $node->getAttribute('youtubeId'),
        'title'       => $node->getAttribute('title'),
        'subtitleSrc' => $node->getAttribute('subtitleSrc'),
    ];
}

/**
 * Retourne les données de contact traduites.
 *
 * @param  string $lang
 * @return array
 */
function get_contact(string $lang): array
{
    return [
        'intro'        => xml_get("//contact/contactIntro/translation[@lang='$lang']"),
        'availability' => xml_get("//contact/availability/translation[@lang='$lang']"),
        'sectionTitle' => get_section_title('contact', $lang),
        'email'        => xml_get('//identity/email'),
        'phone'        => xml_get('//identity/phone'),
        'linkedin'     => [
            'url'   => xml_get('//identity/linkedin/@url'),
            'label' => xml_get('//identity/linkedin/@label'),
        ],
    ];
}

/**
 * Retourne tous les projets sous forme de tableau structuré.
 * Utile pour du rendu PHP pur (fallback si XSLT désactivé).
 *
 * @param  string $lang
 * @return array
 */
function get_projects(string $lang): array
{
    $doc      = load_xml();
    $xp       = new DOMXPath($doc);
    $projNodes = $xp->query('//projects/project');
    $projects = [];

    foreach ($projNodes as $proj) {
        $titleNode = $xp->query("projectTitle/translation[@lang='$lang']", $proj);
        $descNode  = $xp->query("projectDesc/translation[@lang='$lang']", $proj);
        $techNodes = $xp->query('techStack/tech', $proj);

        $techs = [];
        foreach ($techNodes as $t) {
            $techs[] = trim($t->textContent);
        }

        $projects[] = [
            'id'     => $proj->getAttribute('id'),
            'type'   => $proj->getAttribute('type'),
            'title'  => $titleNode->length > 0 ? trim($titleNode->item(0)->textContent) : '',
            'period' => trim($xp->query('period_proj', $proj)->item(0)->textContent ?? ''),
            'desc'   => $descNode->length  > 0 ? trim($descNode->item(0)->textContent) : '',
            'techs'  => $techs,
        ];
    }

    return $projects;
}