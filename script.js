const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const year = document.getElementById("year");
const hero = document.querySelector("[data-dynamic-hero]");
const dynamicGallery = document.getElementById("dynamic-gallery");
const dynamicPageContent = document.getElementById("dynamic-page-content");
const logoText = document.getElementById("logo-text");
const footerSiteName = document.getElementById("footer-site-name");
const pageTitle = document.getElementById("page-title");
const primaryMenu = document.getElementById("primary-menu");
const heroTitle = document.getElementById("hero-title");
const heroLead = document.getElementById("hero-lead");
const heroEyebrow = document.getElementById("hero-eyebrow");
const heroSpecs = document.getElementById("hero-specs");
const heroCtaPrimary = document.getElementById("hero-cta-primary");
const heroCtaSecondary = document.getElementById("hero-cta-secondary");

const productImages = [
  "cold-rolled-stainless-steel-sheet-in-coil-500x500.webp",
  "image1.jpg",
  "image2.jpg",
  "stainless-steel-sheet.webp"
];

if (year) {
  year.textContent = new Date().getFullYear();
}

function setupMenuEvents() {
  if (!menuToggle || !menu) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function toTitleCase(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function parseSectionConfig(rawConfig) {
  if (!rawConfig || typeof rawConfig !== "string") {
    return {};
  }
  try {
    const parsed = JSON.parse(rawConfig);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getCurrentSlug() {
  const path = window.location.pathname.split("/").filter(Boolean);
  const fileName = path[path.length - 1] || "index.html";
  const slug = fileName.replace(/\.html$/i, "");
  return slug || "index";
}

function resolveNavHref(navItem, pageSections) {
  const sections = Array.isArray(pageSections) ? pageSections : [];

  if (navItem.url) {
    return navItem.url;
  }
  if (navItem.anchorId) {
    return `#${navItem.anchorId}`;
  }
  if (navItem.sectionKey) {
    const matchedSection = sections.find(
      (section) => section.sectionKey === navItem.sectionKey
    );
    if (matchedSection) {
      return `#${matchedSection.anchorId || matchedSection.sectionKey || matchedSection.id}`;
    }
    return `#${navItem.sectionKey}`;
  }
  if (typeof navItem.target === "string" && navItem.target.trim()) {
    return navItem.target.startsWith("#") ? navItem.target : `#${navItem.target}`;
  }

  if (navItem.label) {
    const normalizedLabel = normalizeText(navItem.label);
    const matchedSection = sections.find((section) => {
      return (
        normalizeText(section.title) === normalizedLabel ||
        normalizeText(section.name) === normalizedLabel ||
        normalizeText(section.sectionKey) === normalizedLabel ||
        normalizeText(section.anchorId) === normalizedLabel
      );
    });
    if (matchedSection) {
      return `#${matchedSection.anchorId || matchedSection.sectionKey || matchedSection.id}`;
    }
  }

  return "#";
}

function renderDynamicMenu(navItems, pageSections) {
  if (!primaryMenu) {
    return;
  }

  const resolvedNavItems = Array.isArray(navItems)
    ? navItems
        .filter((item) => item && item.visible !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    : [];

  const flattenWithParentOrder = (items) => {
    const parentMap = new Map();
    const roots = [];
    items.forEach((item) => {
      const parentId = item.parentId || "";
      if (!parentMap.has(parentId)) {
        parentMap.set(parentId, []);
      }
      parentMap.get(parentId).push(item);
    });
    (parentMap.get("") || []).forEach((root) => {
      roots.push({ ...root, depth: 0 });
      const children = (parentMap.get(root.id) || []).sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      children.forEach((child) => roots.push({ ...child, depth: 1 }));
    });
    return roots.length > 0 ? roots : items.map((item) => ({ ...item, depth: 0 }));
  };

  const navList =
    resolvedNavItems.length > 0 ? flattenWithParentOrder(resolvedNavItems) : pageSections;

  const links = navList.map((entry) => {
    if (resolvedNavItems.length > 0) {
      const label = entry.label || entry.title || entry.name || "Menu";
      const prefixedLabel = entry.depth === 1 ? `- ${label}` : label;
      return `<li><a href="${resolveNavHref(entry, pageSections)}">${prefixedLabel}</a></li>`;
    }
    const id = entry.anchorId || entry.sectionKey || entry.id;
    return `<li><a href="#${id}">${toTitleCase(entry.name || entry.sectionKey || "Section")}</a></li>`;
  });

  links.push('<li><a href="#contact" class="btn btn-nav">Contact</a></li>');
  primaryMenu.innerHTML = links.join("");
}

function renderHeroFromContent(pageSections) {
  if (!heroTitle || !heroLead || !heroEyebrow || !heroSpecs || pageSections.length === 0) {
    return;
  }

  const firstSection = pageSections[0];
  const items = Array.isArray(firstSection.items) ? firstSection.items : [];

  heroEyebrow.textContent = "";
  heroEyebrow.style.display = "none";
  heroTitle.textContent = firstSection.title || firstSection.name || "Website Content";
  heroLead.textContent = firstSection.subtitle || "";

  if (heroCtaPrimary) {
    heroCtaPrimary.href = `#${firstSection.sectionKey || firstSection.id}`;
  }
  if (heroCtaSecondary && pageSections[1]) {
    heroCtaSecondary.href = `#${pageSections[1].sectionKey || pageSections[1].id}`;
  }

  heroSpecs.innerHTML = "";
  const topItems = items.slice(0, 4);
  topItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.title || item.name || item.itemKey || "Item";
    heroSpecs.appendChild(li);
  });
}

function renderSection(section, sectionIndex) {
  const wrapper = document.createElement("section");
  wrapper.id = section.anchorId || section.sectionKey || section.id;
  wrapper.className = sectionIndex % 2 === 1 ? "section section-alt" : "section container";

  const sectionBody = sectionIndex % 2 === 1 ? document.createElement("div") : wrapper;
  if (sectionIndex % 2 === 1) {
    sectionBody.className = "container";
    wrapper.appendChild(sectionBody);
  }

  const sectionConfig = parseSectionConfig(section.jsonConfig);

  const head = document.createElement("div");
  head.className = "section-head";
  const showEyebrow = sectionConfig.showEyebrow !== false;
  const showTitle = sectionConfig.showTitle !== false;
  const showSubtitle = sectionConfig.showSubtitle !== false;
  const subtitleHtml = showSubtitle && section.subtitle ? `<p class="lead">${section.subtitle}</p>` : "";
  const bodyHtml = section.body
    ? `<p>${String(section.body).replace(/\n/g, "<br />")}</p>`
    : "";
  const titleAlign = sectionConfig.titleAlign || "left";
  const eyebrowHtml = showEyebrow
    ? `<p class="eyebrow">${toTitleCase(section.sectionKey || "Section")}</p>`
    : "";
  const titleHtml = showTitle ? `<h2>${section.title || section.name || "Section"}</h2>` : "";
  const highlightHtml =
    sectionConfig.highlight && sectionConfig.highlight.enabled && sectionConfig.highlight.text
      ? `<p class="lead"><strong>${sectionConfig.highlight.text}</strong></p>`
      : "";
  head.innerHTML = `
    ${eyebrowHtml}
    ${titleHtml}
    ${subtitleHtml}
    ${highlightHtml}
    ${bodyHtml}
  `;
  head.style.textAlign = titleAlign;
  if (sectionConfig.maxBodyWidth) {
    head.style.maxWidth = sectionConfig.maxBodyWidth;
  }
  sectionBody.appendChild(head);

  if (sectionConfig.media && sectionConfig.media.enabled && sectionConfig.media.src) {
    const mediaFigure = document.createElement("figure");
    mediaFigure.className = "gallery-item";
    mediaFigure.style.maxWidth = "420px";
    mediaFigure.style.margin = "0 0 1rem";
    mediaFigure.innerHTML = `<img src="${sectionConfig.media.src}" alt="${
      sectionConfig.media.alt || section.title || section.name || "Section image"
    }" loading="lazy" />`;
    sectionBody.appendChild(mediaFigure);
  }

  if (sectionConfig.cta && sectionConfig.cta.enabled && sectionConfig.cta.label) {
    const cta = document.createElement("a");
    cta.className = sectionConfig.cta.style === "ghost" ? "btn btn-ghost" : "btn";
    cta.href = sectionConfig.cta.href || "#contact";
    cta.textContent = sectionConfig.cta.label;
    sectionBody.appendChild(cta);
  }

  const items = Array.isArray(section.items)
    ? section.items.filter((item) => item.visible !== false)
    : [];

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "lead";
    empty.textContent = "Content for this section will appear here soon.";
    sectionBody.appendChild(empty);
    return wrapper;
  }

  const grid = document.createElement("div");
  grid.className = "card-grid";

  items.forEach((item, itemIndex) => {
    const card = document.createElement("article");
    card.className = "card";

    const image = document.createElement("img");
    image.className = "card-image";
    image.src = productImages[itemIndex % productImages.length];
    image.alt = item.title || item.name || "Section item";
    image.loading = "lazy";
    card.appendChild(image);

    const content = document.createElement("div");
    content.className = "card-content";
    content.innerHTML = `
      <h3>${item.icon ? `${item.icon} ` : ""}${item.title || item.name || "Item"}</h3>
      <p>${item.description || item.itemKey || "No description available."}</p>
    `;

    if (item.linkText) {
      const link = document.createElement("a");
      link.className = "inline-link";
      link.href = item.linkUrl || "#contact";
      link.textContent = item.linkText;
      content.appendChild(link);
    }

    card.appendChild(content);
    grid.appendChild(card);
  });

  sectionBody.appendChild(grid);
  return wrapper;
}

function renderPageContent(page, navItems) {
  if (!dynamicPageContent) {
    return;
  }

  const sections = Array.isArray(page.sections)
    ? page.sections.filter((section) => section.visible !== false)
    : [];
  dynamicPageContent.innerHTML = "";
  sections.forEach((section, index) => {
    dynamicPageContent.appendChild(renderSection(section, index));
  });

  renderDynamicMenu(navItems, sections);
  renderHeroFromContent(sections);
}

function applySiteBranding(contentData) {
  const siteName = contentData?.site?.name || "Kashvi Metals";

  if (logoText) {
    logoText.innerHTML = `${siteName.toUpperCase().split(" ").slice(0, 1).join("")}<span>${siteName
      .split(" ")
      .slice(1)
      .join(" ")
      .toUpperCase()}</span>`;
  }
  if (footerSiteName) {
    footerSiteName.textContent = siteName;
  }
  if (pageTitle) {
    pageTitle.textContent = `${siteName} | Rolled Metal Solutions`;
  }
}

async function loadContent() {
  try {
    const response = await fetch("content.json", { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Unable to load content.json (${response.status})`);
    }

    const contentData = await response.json();
    const currentSlug = getCurrentSlug();
    const pages = Array.isArray(contentData?.pages) ? contentData.pages : [];
    const page = pages.find((p) => p.slug === currentSlug) || pages[0];
    const navItems = Array.isArray(contentData?.navItems) ? contentData.navItems : [];

    applySiteBranding(contentData);
    if (page) {
      renderPageContent(page, navItems);
    }
  } catch (error) {
    console.error("Content load error:", error);
  } finally {
    setupMenuEvents();
  }
}

if (productImages.length > 0) {
  if (hero) {
    let heroIndex = 0;
    hero.style.setProperty("--hero-image", `url("${productImages[heroIndex]}")`);

    setInterval(() => {
      heroIndex = (heroIndex + 1) % productImages.length;
      hero.style.setProperty("--hero-image", `url("${productImages[heroIndex]}")`);
    }, 4200);
  }

  if (dynamicGallery) {
    productImages.forEach((src, index) => {
      const figure = document.createElement("figure");
      figure.className = "gallery-item";
      figure.innerHTML = `<img src="${src}" alt="Kashvi Metals product ${index + 1}" loading="lazy" />`;
      dynamicGallery.appendChild(figure);
    });
  }
}

loadContent();
