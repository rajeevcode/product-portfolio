// Smooth scroll for in-page anchor links flagged with data-scroll.
document.querySelectorAll("[data-scroll]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    if (!id || !id.startsWith("#")) return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Lightbox for screenshot cards.
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");

document.querySelectorAll("[data-lightbox]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".shot-card");
    if (!card || !lightbox || !lightboxImg) return;
    const img = card.querySelector("img");
    const title = card.querySelector(".caption h3");
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    if (lightboxCaption && title) {
      lightboxCaption.textContent = title.textContent || "";
    }
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox() {
  if (!lightbox || !lightboxImg) return;
  lightbox.hidden = true;
  lightboxImg.src = "";
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close-lightbox]").forEach((el) => {
  el.addEventListener("click", (event) => {
    // Only close when clicking the backdrop or the close button itself.
    if (event.target === el) closeLightbox();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});
