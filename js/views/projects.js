/*
 * Nexa.views.projects — project list with search, status filter, sort,
 * a cards/table toggle, and a "Create project" modal with validation.
 */
(function () {
  "use strict";

  const nexaState = window.Nexa.state;
  const { state } = nexaState;
  const data = window.Nexa.data;
  const { escapeHtml, formatDate, debounce } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;
  const { statusTag, avatar, toast, openModal, closeModal } = window.Nexa.ui;

  let viewMode = "cards";

  const STATUS_FILTERS = [
    { id: "all", label: "All statuses" },
    { id: "active", label: "Active" },
    { id: "review", label: "In review" },
    { id: "draft", label: "Draft" },
    { id: "archived", label: "Archived" },
  ];

  const SORTS = [
    { id: "updated", label: "Recently updated" },
    { id: "name", label: "Name (A–Z)" },
    { id: "progress", label: "Progress" },
  ];

  function visibleProjects() {
    const { query, status, sort } = state.projectFilters;
    let list = state.projects.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.client.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || p.status === status;
      return matchesQuery && matchesStatus;
    });
    list = list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "progress") return b.progress - a.progress;
      return new Date(b.updated) - new Date(a.updated);
    });
    return list;
  }

  function projectCard(project) {
    return `
      <article class="project-card project-card--${project.hue}" data-reveal>
        <div class="project-card__top">
          ${statusTag(project.status)}
          <div class="dropdown" data-dropdown>
            <button type="button" class="icon-button icon-button--ghost" data-dropdown-trigger aria-haspopup="true" aria-expanded="false" aria-label="More actions for ${escapeHtml(project.name)}">
              ${icon("dots")}
            </button>
            <div class="dropdown__panel dropdown__panel--right" data-dropdown-panel role="menu">
              <button type="button" role="menuitem" data-action="project-status" data-id="${project.id}" data-status="active">Mark active</button>
              <button type="button" role="menuitem" data-action="project-status" data-id="${project.id}" data-status="review">Mark in review</button>
              <button type="button" role="menuitem" data-action="project-status" data-id="${project.id}" data-status="archived">Archive</button>
            </div>
          </div>
        </div>
        <h3 class="project-card__title">${escapeHtml(project.name)}</h3>
        <p class="project-card__client">${escapeHtml(project.client)} &middot; ${escapeHtml(project.type)}</p>
        ${
          project.status === "archived"
            ? `<p class="project-card__done">${icon("checkCircle")} Completed</p>`
            : `<div class="progress-track progress-track--sm"><div class="progress-fill" style="width:${project.progress}%"></div></div>
               <p class="project-card__progress-label">${project.progress}% complete</p>`
        }
        <div class="project-card__foot">
          ${avatar(project.owner, project.hue, "sm")}
          <span class="project-card__meta">${project.contentCount} items &middot; updated ${formatDate(project.updated)}</span>
        </div>
      </article>`;
  }

  function projectTableRow(project) {
    return `
      <tr>
        <td>
          <span class="table-title">${escapeHtml(project.name)}</span>
          <span class="table-subtitle">${escapeHtml(project.client)}</span>
        </td>
        <td>${escapeHtml(project.type)}</td>
        <td>${statusTag(project.status)}</td>
        <td>
          <div class="progress-track progress-track--sm progress-track--inline"><div class="progress-fill" style="width:${project.progress}%"></div></div>
        </td>
        <td>${avatar(project.owner, project.hue, "sm")}</td>
        <td class="table-muted">${formatDate(project.updated)}</td>
      </tr>`;
  }

  function emptyState() {
    return `
      <div class="empty-state">
        ${icon("search")}
        <h3>No projects match your filters</h3>
        <p>Try a different search term or clear the status filter.</p>
        <button type="button" class="button button--ghost" data-action="clear-project-filters">Clear filters</button>
      </div>`;
  }

  function toolbar() {
    const currentStatus = STATUS_FILTERS.find((s) => s.id === state.projectFilters.status);
    const currentSort = SORTS.find((s) => s.id === state.projectFilters.sort);
    return `
      <div class="toolbar">
        <label class="search-field">
          ${icon("search")}
          <input type="search" id="project-search" placeholder="Search projects or clients" value="${escapeHtml(state.projectFilters.query)}" aria-label="Search projects" />
        </label>

        <div class="dropdown" data-dropdown>
          <button type="button" class="button button--ghost button--sm" data-dropdown-trigger aria-haspopup="true" aria-expanded="false">
            ${icon("filter")} ${currentStatus.label} ${icon("chevronDown")}
          </button>
          <div class="dropdown__panel" data-dropdown-panel role="menu">
            ${STATUS_FILTERS.map(
              (s) =>
                `<button type="button" role="menuitem" data-action="project-status-filter" data-value="${s.id}" class="${s.id === state.projectFilters.status ? "is-active" : ""}">${s.label}</button>`,
            ).join("")}
          </div>
        </div>

        <div class="dropdown" data-dropdown>
          <button type="button" class="button button--ghost button--sm" data-dropdown-trigger aria-haspopup="true" aria-expanded="false">
            Sort: ${currentSort.label} ${icon("chevronDown")}
          </button>
          <div class="dropdown__panel" data-dropdown-panel role="menu">
            ${SORTS.map(
              (s) =>
                `<button type="button" role="menuitem" data-action="project-sort" data-value="${s.id}" class="${s.id === state.projectFilters.sort ? "is-active" : ""}">${s.label}</button>`,
            ).join("")}
          </div>
        </div>

        <div class="view-toggle" role="group" aria-label="Layout">
          <button type="button" class="view-toggle__btn ${viewMode === "cards" ? "is-active" : ""}" data-action="projects-view" data-value="cards" aria-pressed="${viewMode === "cards"}" aria-label="Card view">${icon("grid")}</button>
          <button type="button" class="view-toggle__btn ${viewMode === "table" ? "is-active" : ""}" data-action="projects-view" data-value="table" aria-pressed="${viewMode === "table"}" aria-label="Table view">${icon("layout")}</button>
        </div>

        <button type="button" class="button button--primary" data-action="open-create-project">${icon("plus")} New project</button>
      </div>`;
  }

  function render() {
    const list = visibleProjects();
    return `
      <div class="view-header">
        <div>
          <p class="eyebrow">Workspace</p>
          <h1>Projects</h1>
          <p class="view-header__lead">${state.projects.length} projects across ${data.WORKSPACE.name}.</p>
        </div>
      </div>

      ${toolbar()}

      ${
        list.length === 0
          ? emptyState()
          : viewMode === "cards"
            ? `<div class="project-grid">${list.map(projectCard).join("")}</div>`
            : `<div class="table-scroll"><table class="data-table">
                <thead><tr><th>Project</th><th>Type</th><th>Status</th><th>Progress</th><th>Owner</th><th>Updated</th></tr></thead>
                <tbody>${list.map(projectTableRow).join("")}</tbody>
              </table></div>`
      }
    `;
  }

  function openCreateProjectModal() {
    const typeOptions = data.CONTENT_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("");
    openModal({
      title: "Create a new project",
      bodyHtml: `
        <form id="create-project-form" novalidate>
          <div class="field">
            <label for="new-project-name">Project name</label>
            <input id="new-project-name" name="name" type="text" placeholder="e.g. Solace Skincare — Fall Campaign" required />
            <p class="field__error" data-error="name" hidden>Give the project a name.</p>
          </div>
          <div class="field">
            <label for="new-project-client">Client <span class="field__optional">(optional)</span></label>
            <input id="new-project-client" name="client" type="text" placeholder="e.g. Solace Skincare" />
          </div>
          <div class="field">
            <label for="new-project-type">Primary content type</label>
            <select id="new-project-type" name="type">${typeOptions}</select>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="button button--ghost" data-modal-close>Cancel</button>
        <button type="submit" form="create-project-form" class="button button--primary">${icon("plus")} Create project</button>
      `,
      onMount: (modalEl) => {
        const form = modalEl.querySelector("#create-project-form");
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          const nameField = form.elements.name;
          const errorEl = form.querySelector('[data-error="name"]');
          const name = nameField.value.trim();
          if (!name) {
            errorEl.hidden = false;
            nameField.setAttribute("aria-invalid", "true");
            nameField.focus();
            return;
          }
          errorEl.hidden = true;
          nameField.removeAttribute("aria-invalid");
          nexaState.createProject({
            name,
            client: form.elements.client.value.trim(),
            type: form.elements.type.value,
          });
          closeModal();
          toast(`"${name}" was created.`, "success");
        });
      },
    });
  }

  function mount(root) {
    const searchInput = root.querySelector("#project-search");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        debounce((event) => nexaState.setProjectFilters({ query: event.target.value }), 200),
      );
    }
  }

  function handleAction(action, target) {
    if (action === "open-create-project") {
      openCreateProjectModal();
      return true;
    }
    if (action === "project-status-filter") {
      nexaState.setProjectFilters({ status: target.dataset.value });
      return true;
    }
    if (action === "project-sort") {
      nexaState.setProjectFilters({ sort: target.dataset.value });
      return true;
    }
    if (action === "project-status") {
      nexaState.setProjectStatus(target.dataset.id, target.dataset.status);
      toast("Project status updated.", "success");
      return true;
    }
    if (action === "projects-view") {
      viewMode = target.dataset.value;
      nexaState.notify("projectsViewMode");
      return true;
    }
    if (action === "clear-project-filters") {
      nexaState.setProjectFilters({ query: "", status: "all" });
      return true;
    }
    return false;
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.views = window.Nexa.views || {};
  window.Nexa.views.projects = {
    render,
    mount,
    handleAction,
    openCreateProjectModal,
    title: "Projects",
  };
})();
