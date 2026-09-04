/*
 * Nexa.views.history — full generation history with search, a content-type
 * filter, and a detail modal for each entry.
 */
(function () {
  "use strict";

  const nexaState = window.Nexa.state;
  const { state } = nexaState;
  const data = window.Nexa.data;
  const { escapeHtml, relativeTime, formatDate, debounce, copyToClipboard } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;
  const { toast, openModal } = window.Nexa.ui;

  function visibleGenerations() {
    const { query, type } = state.historyFilters;
    return state.generations
      .filter((g) => {
        const matchesQuery =
          !query ||
          g.prompt.toLowerCase().includes(query.toLowerCase()) ||
          g.excerpt.toLowerCase().includes(query.toLowerCase());
        const matchesType = type === "all" || g.type === type;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function historyCard(generation) {
    const project = nexaState.getProject(generation.projectId);
    return `
      <article class="history-card" data-reveal>
        <div class="history-card__head">
          <span class="tag tag--accent">${escapeHtml(generation.type)}</span>
          <time class="history-card__time">${relativeTime(generation.createdAt, new Date())}</time>
        </div>
        <p class="history-card__excerpt">${escapeHtml(generation.excerpt)}</p>
        <div class="history-card__meta">
          <span>${escapeHtml(project ? project.name : "General")}</span>
          <span>${escapeHtml(generation.tone)}</span>
          <span>${escapeHtml(generation.language)}</span>
          <span>${generation.wordCount} words</span>
        </div>
        <div class="history-card__actions">
          <button type="button" class="text-button" data-action="view-generation" data-id="${generation.id}">View prompt ${icon("chevronRight")}</button>
          <button type="button" class="icon-button icon-button--ghost" data-action="copy-generation" data-id="${generation.id}" aria-label="Copy content">${icon("copy")}</button>
        </div>
      </article>`;
  }

  function emptyState() {
    return `
      <div class="empty-state">
        ${icon("clock")}
        <h3>No generations found</h3>
        <p>Try a different search term, or generate something new.</p>
        <button type="button" class="button button--primary" data-route="generator">${icon("sparkle")} Go to generator</button>
      </div>`;
  }

  function render() {
    const list = visibleGenerations();
    const typeOptions = ["all", ...data.CONTENT_TYPES];

    return `
      <div class="view-header">
        <div>
          <p class="eyebrow">Workspace</p>
          <h1>Content history</h1>
          <p class="view-header__lead">${state.generations.length} generations across every project.</p>
        </div>
      </div>

      <div class="toolbar">
        <label class="search-field">
          ${icon("search")}
          <input type="search" id="history-search" placeholder="Search prompts and content" value="${escapeHtml(state.historyFilters.query)}" aria-label="Search content history" />
        </label>
        <div class="dropdown" data-dropdown>
          <button type="button" class="button button--ghost button--sm" data-dropdown-trigger aria-haspopup="true" aria-expanded="false">
            ${icon("filter")} ${state.historyFilters.type === "all" ? "All types" : state.historyFilters.type} ${icon("chevronDown")}
          </button>
          <div class="dropdown__panel" data-dropdown-panel role="menu">
            ${typeOptions
              .map(
                (t) =>
                  `<button type="button" role="menuitem" data-action="history-type-filter" data-value="${t}" class="${t === state.historyFilters.type ? "is-active" : ""}">${t === "all" ? "All types" : t}</button>`,
              )
              .join("")}
          </div>
        </div>
      </div>

      ${list.length === 0 ? emptyState() : `<div class="history-grid">${list.map(historyCard).join("")}</div>`}
    `;
  }

  function openDetail(id) {
    const generation = state.generations.find((g) => g.id === id);
    if (!generation) return;
    const project = nexaState.getProject(generation.projectId);
    openModal({
      title: `${generation.type} · ${generation.tone}`,
      bodyHtml: `
        <p class="modal-label">Prompt</p>
        <p class="modal-quote">${escapeHtml(generation.prompt)}</p>
        <p class="modal-label">Result</p>
        <p class="modal-quote modal-quote--result">${escapeHtml(generation.excerpt)}</p>
        <dl class="modal-meta">
          <div><dt>Project</dt><dd>${escapeHtml(project ? project.name : "General")}</dd></div>
          <div><dt>Language</dt><dd>${escapeHtml(generation.language)}</dd></div>
          <div><dt>Length</dt><dd>${generation.wordCount} words</dd></div>
          <div><dt>Created</dt><dd>${formatDate(generation.createdAt)}</dd></div>
        </dl>
      `,
      footerHtml: `
        <button type="button" class="button button--ghost" data-modal-close>Close</button>
        <button type="button" class="button button--primary" data-action="copy-generation" data-id="${generation.id}">${icon("copy")} Copy content</button>
      `,
    });
  }

  function mount(root) {
    const searchInput = root.querySelector("#history-search");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        debounce((event) => nexaState.setHistoryFilters({ query: event.target.value }), 200),
      );
    }
  }

  function handleAction(action, target) {
    if (action === "history-type-filter") {
      nexaState.setHistoryFilters({ type: target.dataset.value });
      return true;
    }
    if (action === "view-generation") {
      openDetail(target.dataset.id);
      return true;
    }
    if (action === "copy-generation") {
      const generation = state.generations.find((g) => g.id === target.dataset.id);
      if (generation) {
        copyToClipboard(generation.excerpt).then((ok) => {
          toast(ok ? "Copied to clipboard." : "Couldn't copy — try selecting the text.", ok ? "success" : "warning");
        });
      }
      return true;
    }
    return false;
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.views = window.Nexa.views || {};
  window.Nexa.views.history = { render, mount, handleAction, title: "Content History" };
})();
