(function applySiteContact() {
  const site = window.SITE;
  if (!site) return;

  // Email: wire the mailto href but NEVER expose the raw address as visible text.
  // The button keeps whatever label is authored in HTML (e.g. "Email").
  // Open in a new tab so webmail (Gmail, etc.) doesn't navigate away from the portfolio.
  document.querySelectorAll("[data-contact='email']").forEach((el) => {
    el.href = "mailto:" + site.email;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  // Opt-in only: an element that explicitly wants the address shown as text.
  document.querySelectorAll("[data-contact='email-label']").forEach((el) => {
    el.textContent = site.email;
  });

  document.querySelectorAll("[data-contact='linkedin']").forEach((el) => {
    if (site.linkedin) {
      el.href = site.linkedin;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });

  document.querySelectorAll("[data-contact='github']").forEach((el) => {
    if (site.github) {
      el.href = site.github;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });

  document.querySelectorAll("[data-contact='portfolio']").forEach((el) => {
    if (site.portfolio) {
      el.href = site.portfolio;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });

  document.querySelectorAll("[data-contact='roles']").forEach((el) => {
    if (!site.roles?.length) return;
    el.innerHTML = site.roles
      .map((role) => '<span class="role-tag">' + role + "</span>")
      .join("");
  });
})();
