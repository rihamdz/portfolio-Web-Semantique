<?php
/**
 * config.php
 * Configuration globale du portfolio de Riham Kaddour Bakir
 * Web Sémantique – Sup Galilée / Université Sorbonne Paris Nord
 *
 * Ce fichier doit être inclus en premier dans chaque page PHP.
 * Il initialise la session, détermine la langue selon l'ordre de priorité
 * défini dans l'énoncé, et expose les constantes du projet.
 */

// ─── Sécurité : désactiver l'affichage des erreurs en production ───────────
// En développement local, mettre à E_ALL pour déboguer.
ini_set('display_errors', 0);
error_reporting(E_ALL);

// ─── Démarrage de session (obligatoire pour la priorité n°3) ──────────────
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ─── Constantes du projet ──────────────────────────────────────────────────

/** Chemin absolu vers la racine du projet */
define('ROOT_PATH', __DIR__ . '/..');

/** Chemin vers le fichier XML de données */
define('XML_PATH',  ROOT_PATH . '/data/portfolio.xml');

/** Chemin vers la DTD */
define('DTD_PATH',  ROOT_PATH . '/data/portfolio.dtd');

/** Chemin vers la feuille XSLT */
define('XSLT_PATH', ROOT_PATH . '/xslt/portfolio.xsl');

/** Liste des langues supportées avec leurs métadonnées */
define('SUPPORTED_LANGS', [
    'fr' => [
        'label'     => 'Français',
        'dir'       => 'ltr',
        'flag'      => '🇫🇷',
        'hreflang'  => 'fr',
        'locale'    => 'fr_FR',
    ],
    'en' => [
        'label'     => 'English',
        'dir'       => 'ltr',
        'flag'      => '🇬🇧',
        'hreflang'  => 'en',
        'locale'    => 'en_GB',
    ],
    'ar' => [
        'label'     => 'العربية',
        'dir'       => 'rtl',
        'flag'      => '🇩🇿',
        'hreflang'  => 'ar',
        'locale'    => 'ar_DZ',
    ],
]);

/** Langue par défaut du site (priorité 5) */
define('DEFAULT_LANG', 'fr');

/** URL de base du site (adapter selon l'hébergement) */
define('BASE_URL', (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
    . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost')
    . rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\')
);

// ─── Détermination de la langue (ordre de priorité énoncé) ────────────────
$currentLang = determine_language();

/**
 * Détermine la langue d'affichage selon l'ordre de priorité :
 * 1. Paramètre GET  (?lang=xx)
 * 2. Paramètre POST (bouton langue = soumission formulaire)
 * 3. Variable de session ($_SESSION['lang'])
 * 4. Entête HTTP Accept-Language du navigateur
 * 5. Langue par défaut (DEFAULT_LANG)
 *
 * @return string Code de langue validé (fr|en|ar)
 */
function determine_language(): string
{
    $supported = array_keys(SUPPORTED_LANGS);

    // ── Priorité 1 : paramètre GET ──────────────────────────────────────
    if (!empty($_GET['lang']) && in_array($_GET['lang'], $supported, true)) {
        $lang = $_GET['lang'];
        $_SESSION['lang'] = $lang;       // Sauvegarder en session (priorité 3)
        return $lang;
    }

    // ── Priorité 2 : paramètre POST ────────────────────────────────────
    if (!empty($_POST['lang']) && in_array($_POST['lang'], $supported, true)) {
        $lang = $_POST['lang'];
        $_SESSION['lang'] = $lang;
        return $lang;
    }

    // ── Priorité 3 : variable de session ───────────────────────────────
    if (!empty($_SESSION['lang']) && in_array($_SESSION['lang'], $supported, true)) {
        return $_SESSION['lang'];
    }

    // ── Priorité 4 : Accept-Language du navigateur ─────────────────────
    $acceptLang = parse_accept_language($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '');
    foreach ($acceptLang as $code) {
        // On ne retient que les 2 premiers caractères (ex: fr-FR → fr)
        $short = strtolower(substr($code, 0, 2));
        if (in_array($short, $supported, true)) {
            $_SESSION['lang'] = $short;
            return $short;
        }
    }

    // ── Priorité 5 : langue par défaut ─────────────────────────────────
    return DEFAULT_LANG;
}

/**
 * Parse l'entête HTTP Accept-Language et retourne les codes
 * triés par qualité décroissante (q=...).
 *
 * Exemples :
 *   "fr-FR,fr;q=0.9,en;q=0.8"  → ['fr', 'fr', 'en']
 *   "ar,en-US;q=0.9"            → ['ar', 'en']
 *
 * @param  string $header Valeur brute de Accept-Language
 * @return array  Liste de codes de langue triés
 */
function parse_accept_language(string $header): array
{
    if (empty($header)) {
        return [];
    }

    $entries = [];
    foreach (explode(',', $header) as $part) {
        $part = trim($part);
        if (strpos($part, ';q=') !== false) {
            [$code, $q] = explode(';q=', $part, 2);
            $entries[] = ['code' => trim($code), 'q' => (float) $q];
        } else {
            $entries[] = ['code' => $part, 'q' => 1.0];
        }
    }

    // Tri décroissant par qualité
    usort($entries, static fn($a, $b) => $b['q'] <=> $a['q']);

    return array_column($entries, 'code');
}

/**
 * Génère l'URL courante avec un paramètre lang différent,
 * en conservant tous les autres paramètres GET et l'ancre.
 *
 * @param  string $lang     Nouveau code de langue
 * @param  string $anchor   Ancre à conserver (#section)
 * @return string URL complète avec ?lang=xx[&autres...]#ancre
 */
function lang_url(string $lang, string $anchor = ''): string
{
    $params = $_GET;
    $params['lang'] = $lang;

    // Supprimer les paramètres vides
    $params = array_filter($params, static fn($v) => $v !== '');

    $url = strtok($_SERVER['REQUEST_URI'] ?? 'index.php', '?') . '?' . http_build_query($params);
    if ($anchor !== '') {
        $url .= '#' . ltrim($anchor, '#');
    }
    return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
}

/**
 * Échappe une chaîne pour un affichage HTML sécurisé.
 *
 * @param  string $str
 * @return string
 */
function h(string $str): string
{
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}