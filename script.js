const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const year = document.getElementById("year");
const hero = document.querySelector("[data-dynamic-hero]");
const dynamicGallery = document.getElementById("dynamic-gallery");
const imageCards = document.querySelectorAll("[data-image-card]");

const productImages = [
  "cold-rolled-stainless-steel-sheet-in-coil-500x500.webp",
  "image1.jpg",
  "image2.jpg",
  "stainless-steel-sheet.webp"
];

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuToggle && menu) {
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

  imageCards.forEach((card, index) => {
    const existingWrap = card.querySelector(".card-content");
    if (!existingWrap) {
      const content = document.createElement("div");
      content.className = "card-content";

      while (card.firstChild) {
        content.appendChild(card.firstChild);
      }

      card.appendChild(content);
    }

    const image = document.createElement("img");
    image.className = "card-image";
    image.src = productImages[index % productImages.length];
    image.alt = "Metal strip and coil product";
    image.loading = "lazy";
    card.prepend(image);
  });
}
