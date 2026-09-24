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

// Homepage mobile menu: toggles the sheet nav and closes it after a link is chosen.
document.querySelectorAll("[data-menu]").forEach((header) => {
  const toggle = header.querySelector("[data-menu-toggle]");
  const sheet = header.querySelector(".sheet");
  if (!toggle || !sheet) return;
  const setOpen = (open) => {
    sheet.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
  };
  toggle.addEventListener("click", () => setOpen(sheet.hidden));
  sheet.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  window.matchMedia("(min-width: 900px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
});
