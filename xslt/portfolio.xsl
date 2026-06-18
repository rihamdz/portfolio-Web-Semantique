<?xml version="1.0" encoding="UTF-8"?>
<!--
    portfolio.xsl
    Feuille de style XSLT pour le portfolio de Riham Kaddour Bakir
    Web Sémantique – Sup Galilée / Université Sorbonne Paris Nord

    USAGE DANS CE PROJET :
    Ce fichier XSLT est utilisé côté serveur PHP via la classe XSLTProcessor
    pour générer des fragments HTML à partir du XML.
    Il prend en paramètre la langue courante et produit uniquement les
    éléments du DOM correspondants à cette langue.

    Il peut aussi être invoqué directement dans un navigateur si le XML
    inclut la processing instruction <?xml-stylesheet?>.

    PARAMÈTRES :
        $lang       : code langue (fr / en / ar)
        $section    : section à rendre (all / skills / projects / education / ...)
-->
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output
        method="xml"
        encoding="UTF-8"
        indent="yes"
        omit-xml-declaration="yes"
    />

    <!-- Paramètres injectés par PHP -->
    <xsl:param name="lang">fr</xsl:param>
    <xsl:param name="section">all</xsl:param>

    <!-- ================================================================
         TEMPLATE RACINE
         ================================================================ -->
    <xsl:template match="/portfolio">
        <xsl:choose>
            <!-- Rendu complet (pas utilisé en production, utile pour debug) -->
            <xsl:when test="$section = 'all'">
                <xsl:apply-templates select="skills"/>
                <xsl:apply-templates select="projects"/>
                <xsl:apply-templates select="education"/>
                <xsl:apply-templates select="experience"/>
            </xsl:when>
            <!-- Rendu par section -->
            <xsl:when test="$section = 'skills'">
                <xsl:apply-templates select="skills"/>
            </xsl:when>
            <xsl:when test="$section = 'projects'">
                <xsl:apply-templates select="projects"/>
            </xsl:when>
            <xsl:when test="$section = 'education'">
                <xsl:apply-templates select="education"/>
            </xsl:when>
            <xsl:when test="$section = 'experience'">
                <xsl:apply-templates select="experience"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates select="skills"/>
                <xsl:apply-templates select="projects"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- ================================================================
         SKILLS : Grille de compétences par catégorie
         ================================================================ -->
    <xsl:template match="skills">
        <section id="skills" class="section" aria-labelledby="skills-title">
            <div class="container">
                <h2 id="skills-title" class="section-title">
                    <xsl:value-of select="sectionTitle/translation[@lang=$lang]"/>
                </h2>
                <div class="skills-grid" role="list">
                    <xsl:apply-templates select="category"/>
                </div>
            </div>
        </section>
    </xsl:template>

    <xsl:template match="category">
        <div class="skill-category" role="listitem"
             data-category-id="{@id}">
            <h3 class="skill-category-title">
                <!-- Icône de la catégorie -->
                <xsl:if test="@icon != ''">
                    <span class="skill-icon" aria-hidden="true">
                        <xsl:value-of select="@icon"/>
                    </span>
                </xsl:if>
                <xsl:value-of select="categoryName/translation[@lang=$lang]"/>
            </h3>
            <ul class="skill-list" aria-label="{categoryName/translation[@lang=$lang]}">
                <xsl:apply-templates select="skill"/>
            </ul>
        </div>
    </xsl:template>

    <xsl:template match="skill">
        <!-- Calcul du niveau en pourcentage pour la barre visuelle -->
        <xsl:variable name="levelPct">
            <xsl:choose>
                <xsl:when test="@level = 'beginner'">25</xsl:when>
                <xsl:when test="@level = 'intermediate'">55</xsl:when>
                <xsl:when test="@level = 'advanced'">80</xsl:when>
                <xsl:when test="@level = 'expert'">100</xsl:when>
                <xsl:otherwise>50</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <li class="skill-item" data-level="{@level}" data-pct="{$levelPct}">
            <span class="skill-name"><xsl:value-of select="@name"/></span>
            <div class="skill-bar" role="progressbar"
                 aria-valuenow="{$levelPct}"
                 aria-valuemin="0"
                 aria-valuemax="100"
                 aria-label="{@name} – {$levelPct}%">
                <div class="skill-bar-fill" style="width:{$levelPct}%"></div>
            </div>
        </li>
    </xsl:template>

    <!-- ================================================================
         PROJECTS : Grille de projets avec filtrage possible par JS
         ================================================================ -->
    <xsl:template match="projects">
        <section id="projects" class="section" aria-labelledby="projects-title">
            <div class="container">
                <h2 id="projects-title" class="section-title">
                    <xsl:value-of select="sectionTitle/translation[@lang=$lang]"/>
                </h2>
                <!-- Boutons de filtre (type) — manipulés par JS côté client -->
                <div class="project-filters" role="group" aria-label="Filtrer les projets">
                    <button class="filter-btn active" data-filter="all" type="button">
                        <xsl:choose>
                            <xsl:when test="$lang = 'fr'">Tous</xsl:when>
                            <xsl:when test="$lang = 'en'">All</xsl:when>
                            <xsl:otherwise>الكل</xsl:otherwise>
                        </xsl:choose>
                    </button>
                    <button class="filter-btn" data-filter="web" type="button">Web</button>
                    <button class="filter-btn" data-filter="mobile" type="button">Mobile</button>
                    <button class="filter-btn" data-filter="algorithm" type="button">
                        <xsl:choose>
                            <xsl:when test="$lang = 'fr'">Algo</xsl:when>
                            <xsl:when test="$lang = 'en'">Algo</xsl:when>
                            <xsl:otherwise>خوارزميات</xsl:otherwise>
                        </xsl:choose>
                    </button>
                    <button class="filter-btn" data-filter="desktop" type="button">Desktop</button>
                </div>
                <div class="projects-grid">
                    <xsl:apply-templates select="project"/>
                </div>
            </div>
        </section>
    </xsl:template>

    <xsl:template match="project">
        <article class="project-card" data-type="{@type}" id="{@id}"
                 itemscope="itemscope"
                 itemtype="http://schema.org/SoftwareSourceCode">
            <div class="project-card-header">
                <h3 class="project-title" itemprop="name">
                    <xsl:value-of select="projectTitle/translation[@lang=$lang]"/>
                </h3>
                <span class="project-period">
                    <xsl:value-of select="period_proj"/>
                </span>
            </div>
            <p class="project-desc" itemprop="description">
                <xsl:value-of select="projectDesc/translation[@lang=$lang]"/>
            </p>
            <div class="tech-stack" aria-label="Technologies utilisées">
                <xsl:for-each select="techStack/tech">
                    <span class="tech-badge" itemprop="programmingLanguage">
                        <xsl:value-of select="."/>
                    </span>
                </xsl:for-each>
            </div>
            <!-- Lien optionnel vers le projet -->
            <xsl:if test="projectLink">
                <a class="project-link" href="{projectLink/@url}"
                   target="_blank"
                   rel="noopener noreferrer"
                   itemprop="codeRepository">
                    <xsl:value-of select="projectLink/@label"/>
                </a>
            </xsl:if>
        </article>
    </xsl:template>

    <!-- ================================================================
         EDUCATION : Timeline de formation
         ================================================================ -->
    <xsl:template match="education">
        <section id="education" class="section" aria-labelledby="education-title">
            <div class="container">
                <h2 id="education-title" class="section-title">
                    <xsl:value-of select="sectionTitle/translation[@lang=$lang]"/>
                </h2>
                <ol class="timeline" reversed="reversed">
                    <xsl:apply-templates select="degree"/>
                </ol>
            </div>
        </section>
    </xsl:template>

    <xsl:template match="degree">
        <li class="timeline-item" id="{@id}"
            itemscope="itemscope"
            itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="timeline-marker" aria-hidden="true"></div>
            <div class="timeline-content">
                <time class="timeline-period" itemprop="dateCreated">
                    <xsl:value-of select="period"/>
                </time>
                <h3 class="timeline-diploma" itemprop="name">
                    <xsl:value-of select="diploma/translation[@lang=$lang]"/>
                </h3>
                <p class="timeline-institution" itemprop="recognizedBy">
                    <xsl:value-of select="institution/translation[@lang=$lang]"/>
                </p>
                <p class="timeline-location">
                    <xsl:value-of select="location_edu"/>
                </p>
                <p class="timeline-desc">
                    <xsl:value-of select="description/translation[@lang=$lang]"/>
                </p>
            </div>
        </li>
    </xsl:template>

    <!-- ================================================================
         EXPERIENCE : Liste d'expériences
         ================================================================ -->
    <xsl:template match="experience">
        <section id="experience" class="section" aria-labelledby="experience-title">
            <div class="container">
                <h2 id="experience-title" class="section-title">
                    <xsl:value-of select="sectionTitle/translation[@lang=$lang]"/>
                </h2>
                <xsl:apply-templates select="position"/>
            </div>
        </section>
    </xsl:template>

    <xsl:template match="position">
        <article class="experience-card" id="{@id}"
                 itemscope="itemscope"
                 itemtype="http://schema.org/OrganizationRole">
            <div class="exp-header">
                <div class="exp-company-block">
                    <h3 class="exp-role" itemprop="roleName">
                        <xsl:value-of select="role/translation[@lang=$lang]"/>
                    </h3>
                    <p class="exp-company" itemprop="memberOf">
                        <xsl:value-of select="company"/>
                    </p>
                </div>
                <div class="exp-meta">
                    <span class="exp-period"><xsl:value-of select="period_exp"/></span>
                    <span class="exp-location"><xsl:value-of select="location_exp"/></span>
                    <span class="exp-contract">
                        <xsl:value-of select="contract/translation[@lang=$lang]"/>
                    </span>
                </div>
            </div>
            <ul class="exp-missions" aria-label="Missions">
                <xsl:for-each select="missions[@lang=$lang]/mission">
                    <li class="exp-mission"><xsl:value-of select="."/></li>
                </xsl:for-each>
            </ul>
        </article>
    </xsl:template>

</xsl:stylesheet>
