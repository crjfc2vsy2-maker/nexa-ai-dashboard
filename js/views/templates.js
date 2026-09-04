/*
 * Nexa.views.templates — a browsable library of starting points. "Use
 * template" hands off to the generator with the content type pre-filled.
 */
(function () {
  "use strict";

  const nexaState = window.Nexa.state;
  const { state } = nexaState;
  const data = window.Nexa.data;
  const { escapeHtml, formatNumber } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;
  const { toast } = window.Nexa.ui;

  let activeCategory = "All";

  function categories() {
    return ["All", ...new Set(data.TEMPLATES.map((t) => t.category))];
  }

  function templateCard(template) {
    return `
      <article class="template-card" data-reveal>
        <span class="template-card__icon">${icon(template.icon)}</span>
        <h3 class="template-card__title">${escapeHtml(template.name)}</h3>
        <p class="template-card__description">${escapeHtml(template.description)}</p>
        <div class="template-card__foot">
          <span class="template-card__uses">${formatNumber(template.uses)} uses</span>
          <button type="button" class="button button--ghost button--sm" data-action="use-template" data-id="${template.id}">
            Use template ${icon("chevronRight")}
          </button>
        </div>
      </article>`;
  }

  function render() {
    const list = data.TEMPLATES.filter((t) => activeCategory === "All" || t.category === activeCategory);
    return `
      <div class="view-header">
        <div>
          <p class="eyebrow">Library</p>
          <h1>Templates</h1>
          <p class="view-header__lead">Proven starting points, tuned per content type.</p>
        </div>
      </div>

      <div class="pill-row" role="tablist" aria-label="Filter by category">
        ${categories()
          .map(
            (c) =>
              `<button type="button" class="pill ${c === activeCategory ? "is-active" : ""}" data-action="template-category" data-value="${escapeHtml(c)}">${escapeHtml(c)}</button>`,
          )
          .join("")}
      </div>

      <div class="template-grid">${list.map(templateCard).join("")}</div>
    `;
  }

  function mount() {}

  function handleAction(action, target) {
    if (action === "template-category") {
      activeCategory = target.dataset.value;
      nexaState.notify("templateCategory");
      return true;
    }
    if (action === "use-template") {
      const template = data.TEMPLATES.find((t) => t.id === target.dataset.id);
      if (template) {
        nexaState.setGeneratorDraft({
          contentType: template.category,
          prompt: `${template.name}: `,
        });
        toast(`Loaded "${template.name}" into the generator.`, "info");
        window.Nexa.app.navigate("generator");
      }
      return true;
    }
    return false;
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.views = window.Nexa.views || {};
  window.Nexa.views.templates = { render, mount, handleAction, title: "Templates" };
})();
