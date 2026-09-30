/* No build, imports, fetch, or runtime dependencies: also works from file://. */
(() => {
  "use strict";
  const site = window.SITE || {};
  const publications = Array.isArray(window.PUBLICATIONS) ? window.PUBLICATIONS : [];
  const name = site.name || "Siyu Chen";
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  // Reject placeholders and executable URLs. Relative paths remain project-Pages safe.
  function usableURL(value) {
    if (typeof value !== "string" || !value.trim() || /YOUR_|TODO|[<>]/i.test(value)) return false;
    if (/^(https?:\/\/|mailto:)/i.test(value)) return true;
    return !/^(\/|#)/.test(value) && !/^[a-z][a-z\d+.-]*:/i.test(value) && !/\s/.test(value);
  }
  function link(label, url, className) {
    const element = make("a", className, label);
    element.href = url;
    if (/^https?:\/\//i.test(url)) { element.target = "_blank"; element.rel = "noopener noreferrer"; }
    return element;
  }
  function unavailable(label, placeholder, className) {
    const element = make("span", className, label);
    element.setAttribute("aria-disabled", "true");
    element.title = `${label} to be added (${placeholder || "TODO"})`;
    element.setAttribute("aria-label", `${label} — to be added`);
    return element;
  }
  function image(src, alt, className) {
    const element = make("img", className);
    element.src = usableURL(src) ? src : "assets/images/publication-placeholder.svg";
    element.alt = alt || "Research image to be added";
    element.width = 400; element.height = 250;
    element.loading = "lazy"; element.decoding = "async";
    element.addEventListener("error", () => { element.src = "assets/images/publication-placeholder.svg"; element.alt = "Research image unavailable; placeholder shown"; }, { once: true });
    return element;
  }
  const icons = {
    Email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/>',
    Scholar: '<path d="m2 9 10-5 10 5-10 5zM6 11v6q6 5 12 0v-6M22 9v9"/>',
    GitHub: '<path d="M9 20v-4c-3 0-5-2-5-5 0-2 1-3 2-4V3l4 2h4l4-2v4c1 1 2 2 2 4 0 3-2 5-5 5v4M9 18c-4 2-5-2-7-2"/>',
    LinkedIn: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.1M11 17v-7m0 3c0-4 6-4 6 0v4"/>',
    CV: '<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8M8 16h8"/>'
  };
  const profileLinks = document.getElementById("profile-links");
  const missingLinks = [];
  for (const [label, key] of [["Email", "email"], ["Scholar", "scholar"], ["GitHub", "github"], ["LinkedIn", "linkedin"], ["CV", "cv"]]) {
    let url = site.links?.[key];
    if (key === "email" && url && !/YOUR_|TODO/.test(url) && !url.startsWith("mailto:")) url = `mailto:${url}`;
    const valid = usableURL(url);
    const element = key === "cv" ? link(label, "#cv", "profile-link") : valid ? link(label, url, "profile-link") : unavailable(label, url, "profile-link");
    // SVG strings are fixed UI icons; editable content is always textContent.
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24"); icon.setAttribute("aria-hidden", "true"); icon.innerHTML = icons[label];
    element.prepend(icon); profileLinks.append(element);
    if (!valid && key !== "cv") missingLinks.push(label);
  }
  if (missingLinks.length) profileLinks.append(make("p", "links-note", `* ${missingLinks.join(", ")} link to be added.`));
  const portrait = document.getElementById("profile-image");
  portrait.src = site.portrait || portrait.src;
  portrait.alt = site.portrait_alt || "Siyu Chen";
  document.getElementById("portrait-caption").hidden = !site.portrait_is_placeholder;
  portrait.addEventListener("error", () => { portrait.src = "assets/images/profile-placeholder.svg"; portrait.alt = "Portrait placeholder for Siyu Chen"; document.getElementById("portrait-caption").hidden = false; }, { once: true });

  for (const research of site.research || []) {
    const item = make("article", "research-item");
    item.append(image(research.image, research.alt));
    const content = make("div"); content.append(make("h3", "", research.title), make("p", "", research.description));
    const related = (research.publication_ids || []).map(id => publications.find(paper => paper.id === id)).filter(Boolean);
    if (related.length) {
      const references = make("p", "research-references", "Related publications: ");
      related.forEach((paper, i) => {
        if (i) references.append(document.createTextNode(" · "));
        const surname = paper.authors[0].split(" ").at(-1);
        const reference = link(paper.research_label || `${surname} et al. (${paper.year})`, `#${paper.id}`);
        reference.setAttribute("aria-label", paper.title);
        references.append(reference);
      });
      content.append(references);
    }
    item.append(content); document.getElementById("research-list").append(item);
  }

  function renderPublication(paper, headingTag) {
    const article = make("article", "publication");
    article.dataset.publicationId = paper.id;
    article.id = paper.id;
    // Journal figures and supplied posters use thumbnail rows; talks use compact citations.
    if (paper.type === "journal" || (paper.type === "poster" && !paper.image_is_placeholder)) {
      const figure = make("figure", "publication-figure");
      const thumbnail = image(paper.image, paper.image_alt, "publication-image");
      if (!paper.image_is_placeholder && usableURL(paper.image)) {
        const enlarge = link("", paper.type === "poster" && usableURL(paper.paper_url) ? paper.paper_url : paper.image, "figure-link");
        enlarge.setAttribute("aria-label", `View ${paper.type === "poster" ? "poster PDF" : "research figure"}: ${paper.title}`);
        enlarge.append(thumbnail); figure.append(enlarge);
      } else figure.append(thumbnail);
      if (paper.image_credit) {
        const caption = make("figcaption", "figure-credit");
        caption.append(usableURL(paper.image_source_url) ? link(paper.image_credit, paper.image_source_url) : document.createTextNode(paper.image_credit));
        if (paper.image_license && usableURL(paper.image_license_url)) {
          caption.append(document.createTextNode(" · "), link(paper.image_license, paper.image_license_url));
        }
        figure.append(caption);
      }
      article.append(figure);
    }
    else article.classList.add("presentation");
    const body = make("div", "publication-body");
    const heading = make(headingTag);
    // Journal titles always lead to the publisher landing page, independently of PDF/abstract resources.
    const primaryURL = (paper.type === "journal"
      ? [paper.publisher_url, paper.doi_url]
      : [paper.publisher_url, paper.abstract_url, paper.paper_url, paper.doi_url, paper.project_url]).find(usableURL);
    heading.append(primaryURL ? link(paper.title, primaryURL) : document.createTextNode(paper.title));
    body.append(heading);
    const authors = make("p", "authors");
    (paper.authors || []).forEach((author, i) => {
      if (i) authors.append(document.createTextNode(", "));
      authors.append(author === name ? make("strong", "", author) : document.createTextNode(author));
      if ((paper.equal_contribution || []).includes(author)) authors.append(make("sup", "", "*"));
      if ((paper.corresponding_author || []).includes(author)) authors.append(make("sup", "", "†"));
    });
    const venue = make("p", "venue");
    const volume = paper.volume ? ` ${paper.volume}${paper.issue ? `(${paper.issue})` : ""}` : "";
    const locator = paper.article_number || paper.pages;
    venue.append(make("cite", "", paper.venue || "Venue to be added"), document.createTextNode(`${volume}${locator ? `, ${locator}` : ""} · ${paper.year || "Year to be added"}`));
    // Keep every title at the same starting line; status belongs with citation metadata.
    if (paper.type === "conference" || paper.type === "poster") venue.append(document.createTextNode(" "), make("span", "badge", paper.type === "poster" ? "Poster" : "Conference presentation"));
    else if (paper.status && paper.status !== "Published") venue.append(document.createTextNode(" "), make("span", "badge", paper.status));
    body.append(authors, venue);
    if (paper.venue_detail) body.append(make("p", "record-note", paper.venue_detail));
    if (paper.type === "journal" && /^\d{4}-\d{2}-\d{2}$/.test(paper.published_date || "")) {
      const dateLine = make("p", "record-note", "Published online ");
      const date = make("time", "", new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${paper.published_date}T12:00:00Z`)));
      date.dateTime = paper.published_date;
      dateLine.append(date); body.append(dateLine);
    }
    if (paper.citation_note) body.append(make("p", "record-note", paper.citation_note));
    if (paper.description) body.append(make("p", "description", paper.description));
    const links = make("div", "paper-links");
    for (const [label, key] of [["Paper", "paper_url"], ["DOI", "doi_url"], ["Abstract", "abstract_url"], ["Code", "code_url"], ["Project", "project_url"], ["Data", "data_url"]]) {
      if (usableURL(paper[key])) {
        // A PubMed record is an abstract/citation page, not a downloadable paper.
        const resourceLabel = key === "paper_url" && paper.type === "poster" ? "Poster (PDF)" : key === "paper_url" && paper[key].startsWith("https://pubmed.ncbi.nlm.nih.gov/") ? "PubMed" : label;
        const item = link(resourceLabel, paper[key]); item.setAttribute("aria-label", `${resourceLabel}: ${paper.title}`); links.append(item);
      }
    }
    if (links.children.length) body.append(links);
    const contributions = [];
    if (paper.equal_contribution?.length) contributions.push("* Equal contribution");
    if (paper.corresponding_author?.length) contributions.push("† Corresponding author");
    if (contributions.length) body.append(make("p", "record-note", contributions.join(" · ")));
    article.append(body); return article;
  }
  const isFirst = paper => paper.authors?.[0] === name || paper.equal_contribution?.includes(name);
  // Journals use verified first-online dates; undated records fall back to year.
  // Equal dates use first-author status and editorial priority as tie-breakers.
  const publicationTime = paper => Date.parse(paper.published_date || `${paper.year}-01-01`);
  const sorted = [...publications].sort((a, b) => (a.type === "journal" && b.type === "journal" ? publicationTime(b) - publicationTime(a) : (Number(b.year) || 0) - (Number(a.year) || 0))
    || Number(b.type === "journal") - Number(a.type === "journal")
    || Number(Boolean(isFirst(b))) - Number(Boolean(isFirst(a)))
    || (b.priority || 0) - (a.priority || 0));
  const filters = ["All"];
  function renderList() {
    const results = sorted;
    const journals = results.filter(paper => paper.type === "journal");
    const presentations = results.filter(paper => paper.type === "conference");
    const posters = results.filter(paper => paper.type === "poster");
    // Each record appears once in its own type-specific list. Only All is shown.
    for (const [id, entries, label] of [["journal-publication-list", journals, "journal publications"], ["presentation-list", presentations, "presentations"], ["poster-list", posters, "posters"]]) {
      const list = document.getElementById(id);
      list.replaceChildren(...entries.map(paper => renderPublication(paper, "h4")));
      if (!entries.length) list.append(make("p", "muted", `No ${label} yet.`));
    }
    document.getElementById("publication-count").textContent = `${journals.length} journal ${journals.length === 1 ? "publication" : "publications"} · ${presentations.length} ${presentations.length === 1 ? "presentation" : "presentations"} · ${posters.length} ${posters.length === 1 ? "poster" : "posters"} · All`;
    document.querySelectorAll(".filter-button").forEach(button => button.setAttribute("aria-pressed", "true"));
  }
  const filterGroup = document.getElementById("publication-filters");
  for (const filter of filters) {
    const button = make("button", "filter-button", filter); button.type = "button";
    button.setAttribute("aria-controls", "journal-publication-list presentation-list poster-list");
    button.addEventListener("click", renderList); filterGroup.append(button);
  }
  filterGroup.hidden = false; renderList();

  for (const key of ["education", "experience"]) {
    const list = document.getElementById(`${key}-list`);
    for (const entry of site[key] || []) {
      const item = make("div", "academic-entry");
      const details = make("div");
      details.append(make("h3", "", entry.title), make("p", "", entry.organization));
      if (entry.detail) details.append(make("p", "entry-detail", entry.detail));
      item.append(make("div", "entry-dates", entry.dates), details); list.append(item);
    }
  }
  const awards = document.getElementById("awards");
  awards.hidden = !(site.show_awards && site.awards?.length);
  for (const award of site.awards || []) document.getElementById("awards-list").append(make("li", "", `${award.year} · ${award.text}`));
  const cvURL = site.links?.cv;
  const hasCV = usableURL(cvURL);
  document.getElementById("cv-link").append(hasCV ? link("View CV (PDF) ↗", cvURL, "cv-button") : unavailable("PDF to be added", cvURL, "cv-button"));
  if (hasCV) document.getElementById("cv-description").textContent = "Updated September 2026 · Education, research, publications, presentations, posters, and honors.";
  document.getElementById("copyright-year").textContent = new Date().getFullYear();
  if (/^\d{4}-\d{2}-\d{2}$/.test(site.updated || "")) {
    const date = new Date(`${site.updated}T12:00:00Z`);
    if (!Number.isNaN(date.getTime())) {
      const time = document.getElementById("last-updated"); time.dateTime = site.updated;
      time.textContent = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
    }
  }

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("nav-links");
  const navigation = document.querySelector(".navigation");
  navigation.classList.add("enhanced"); toggle.hidden = false;
  function closeMenu() { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  toggle.addEventListener("click", () => { const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); });
  nav.addEventListener("click", event => {
    const anchor = event.target.closest("a");
    if (!anchor) return;
    closeMenu();
    // Move focus out of the collapsing menu to the destination heading.
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  });
  navigation.addEventListener("keydown", event => { if (event.key === "Escape" && nav.classList.contains("open")) { closeMenu(); toggle.focus(); } });
  window.matchMedia("(min-width: 701px)").addEventListener("change", closeMenu);
  if ("IntersectionObserver" in window) {
    const navigationLinks = [...nav.querySelectorAll("a")];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        navigationLinks.forEach(anchor => { if (anchor.hash === `#${entry.target.id}`) anchor.setAttribute("aria-current", "location"); else anchor.removeAttribute("aria-current"); });
      }
    }, { rootMargin: "-12% 0px -55% 0px", threshold: 0 });
    navigationLinks.forEach(anchor => { const section = document.querySelector(anchor.hash); if (section) observer.observe(section); });
  }
})();
