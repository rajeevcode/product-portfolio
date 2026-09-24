// Case-study table of contents: marks the section currently in view with aria-current.
(function highlightToc() {
  const links = [...document.querySelectorAll(".toc a[href^='#']")];
  if (!links.length) return;
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  const update = () => {
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top < 140) current = section;
    }
    links.forEach((link) => {
      link.setAttribute("aria-current", String(link.getAttribute("href") === "#" + current.id));
    });
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
