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

function getCurrentSlug() {
  const path = window.location.pathname.split("/").filter(Boolean);
  const fileName = path[path.length - 1] || "index.html";
  const slug = fileName.replace(/\.html$/i, "");
  return slug || "index";
}

function renderDynamicMenu(pageSections) {
  if (!primaryMenu) {
    return;
  }

  const links = pageSections.map((section) => {
    const id = section.sectionKey || section.id;
    return `<li><a href="#${id}">${toTitleCase(section.name || section.sectionKey || "Section")}</a></li>`;
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

  heroEyebrow.textContent = toTitleCase(firstSection.sectionKey || "Highlights");
  heroTitle.textContent = firstSection.title || firstSection.name || "Website Content";
  heroLead.textContent =
    firstSection.jsonConfig || "Data-driven content loaded from content.json.";

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

  const head = document.createElement("div");
  head.className = "section-head";
  const subtitleHtml = section.subtitle ? `<p class="lead">${section.subtitle}</p>` : "";
  const bodyHtml = section.body
    ? `<p>${String(section.body).replace(/\n/g, "<br />")}</p>`
    : "";
  head.innerHTML = `
    <p class="eyebrow">${toTitleCase(section.sectionKey || "Section")}</p>
    <h2>${section.title || section.name || "Section"}</h2>
    ${subtitleHtml}
    ${bodyHtml}
  `;
  sectionBody.appendChild(head);

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

function renderPageContent(page) {
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

  renderDynamicMenu(sections);
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

    applySiteBranding(contentData);
    if (page) {
      renderPageContent(page);
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
