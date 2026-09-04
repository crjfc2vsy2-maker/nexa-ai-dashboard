/*
 * Nexa.app — boots the shell (sidebar, topbar), owns the hash router, and
 * re-renders the active view whenever state changes. This is the only file
 * that touches the persistent shell chrome; view modules only ever render
 * into #viewRoot.
 */
(function () {
  "use strict";

  const nexaState = window.Nexa.state;
  const { state } = nexaState;
  const data = window.Nexa.data;
  const views = window.Nexa.views;
  const ui = window.Nexa.ui;
  const { qs, qsa, escapeHtml, relativeTime, initials } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;

  const VIEW_ORDER = data.NAV_ITEMS.map((n) => n.id);

  /* ------------------------------------------------------------------
   * Shell chrome
   * ---------------------------------------------------------------- */
  function renderSidebarNav() {
    const nav = qs("#sidebarNav");
    nav.innerHTML = data.NAV_ITEMS.map((item) => {
      const active = state.view === item.id;
      const badgeCount = item.badge === "notifications" ? nexaState.unreadNotificationCount() : 0;
      return `
        <a href="#/${item.id}" class="sidebar__link ${active ? "is-active" : ""}" data-route="${item.id}" ${active ? 'aria-current="page"' : ""}>
          <span class="sidebar__icon">${icon(item.icon)}</span>
          <span class="sidebar__label">${item.label}</span>
          ${badgeCount > 0 ? `<span class="badge badge--sidebar">${badgeCount}</span>` : ""}
        </a>`;
    }).join("");
  }

  function renderNotifPanel() {
    const unread = nexaState.unreadNotificationCount();
    const badge = qs("#notifBadge");
    badge.textContent = String(unread);
    badge.hidden = unread === 0;

    const recent = [...state.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
    qs("#notifPreview").innerHTML = `
      <div class="dropdown__header">
        <span>Notifications</span>
        <a href="#/notifications" data-route="notifications" class="text-button text-button--sm">View all</a>
      </div>
      <ul class="dropdown__list">
        ${
          recent.length === 0
            ? `<li class="dropdown__empty">You're all caught up.</li>`
            : recent
                .map(
                  (n) => `
              <li class="dropdown__notification ${n.read ? "" : "is-unread"}">
                <span class="notification-item__title">${escapeHtml(n.title)}</span>
                <span class="notification-item__text">${escapeHtml(n.body)}</span>
                <time>${relativeTime(n.createdAt, new Date())}</time>
              </li>`,
                )
                .join("")
        }
      </ul>`;
  }

  function renderAccountPanel() {
    const trigger = qs("#accountTrigger");
    trigger.innerHTML = `${ui.avatar(initials(state.settings.name), "a", "sm")}<span class="account-trigger__name">${escapeHtml(state.settings.name.split(" ")[0])}</span>${icon("chevronDown")}`;

    qs("#accountPanel").innerHTML = `
      <div class="dropdown__header dropdown__header--account">
        <span class="account-trigger__full">${escapeHtml(state.settings.name)}</span>
        <span class="account-trigger__email">${escapeHtml(state.settings.email)}</span>
      </div>
      <a href="#/settings" data-route="settings" role="menuitem">${icon("gear")} Settings</a>
      <button type="button" role="menuitem" data-action="toggle-theme">${icon(state.theme === "dark" ? "sun" : "moon")} ${state.theme === "dark" ? "Light theme" : "Dark theme"}</button>
      <button type="button" role="menuitem" data-action="log-out">${icon("logout")} Log out</button>
    `;
  }

  function applyShellState() {
    document.documentElement.setAttribute("data-theme", state.theme);
    qs("#sidebar").classList.toggle("sidebar--collapsed", state.sidebarCollapsed);
    qs("#appShell").classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
    qs("#sidebar").classList.toggle("sidebar--open", state.mobileNavOpen);
    qs("#sidebarOverlay").hidden = !state.mobileNavOpen;
    qs("#mobileNavToggle").setAttribute("aria-expanded", String(state.mobileNavOpen));
    document.body.classList.toggle("no-scroll", state.mobileNavOpen);
  }

  function renderShell() {
    renderSidebarNav();
    renderNotifPanel();
    renderAccountPanel();
    applyShellState();
  }

  // Icons for the static shell chrome — populated once at boot so the
  // stable nodes they contain (e.g. #notifBadge) survive later re-renders.
  function renderStaticIcons() {
    qs("#mobileNavToggle").innerHTML = icon("menu");
    qs("#sidebarCollapseBtn").innerHTML = icon("menu");
    qs("#searchIconSlot").innerHTML = icon("search");
    qs("#notifBellBtn").innerHTML = `${icon("bell")}<span class="badge badge--count" id="notifBadge" hidden></span>`;
  }

  /* ------------------------------------------------------------------
   * View rendering (focus-preserving)
   * ---------------------------------------------------------------- */
  function currentView() {
    return views[state.view] || views.dashboard;
  }

  function renderView() {
    const root = qs("#viewRoot");
    const active = document.activeElement;
    const activeId = active && active.id;
    const canSelect = active && "selectionStart" in active;
    const selStart = canSelect ? active.selectionStart : null;
    const selEnd = canSelect ? active.selectionEnd : null;

    root.innerHTML = currentView().render();
    document.title = `${currentView().title} · Nexa AI`;
    if (typeof currentView().mount === "function") currentView().mount(root);

    if (activeId) {
      const restored = document.getElementById(activeId);
      if (restored && typeof restored.focus === "function") {
        restored.focus();
        if (selStart != null && "setSelectionRange" in restored) {
          try {
            restored.setSelectionRange(selStart, selEnd);
          } catch (err) {
            /* not a text-selectable input; ignore */
          }
        }
      }
    }
  }

  function renderAll() {
    renderShell();
    renderView();
  }

  /* ------------------------------------------------------------------
   * Router
   * ---------------------------------------------------------------- */
  function routeFromHash() {
    const id = (location.hash || "").replace(/^#\/?/, "");
    return VIEW_ORDER.includes(id) ? id : "dashboard";
  }

  function navigate(viewId) {
    if (location.hash !== `#/${viewId}`) {
      location.hash = `#/${viewId}`;
    } else {
      nexaState.setView(viewId);
    }
  }

  window.addEventListener("hashchange", () => {
    nexaState.setView(routeFromHash());
  });

  /* ------------------------------------------------------------------
   * Global interactions (delegated so they survive re-renders)
   * ---------------------------------------------------------------- */
  function onGlobalClick(event) {
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) {
      event.preventDefault();
      navigate(routeTarget.dataset.route);
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;

    // Let the active view handle its own actions first.
    const view = currentView();
    if (typeof view.handleAction === "function" && view.handleAction(action, actionTarget, qs("#viewRoot"))) {
      return;
    }

    // App-level actions shared across views / the shell.
    if (action === "open-create-project") {
      views.projects.openCreateProjectModal();
    } else if (action === "toggle-theme") {
      nexaState.setTheme(state.theme === "dark" ? "light" : "dark");
    } else if (action === "log-out") {
      ui.toast("This is a concept product — sign-out isn't wired to a real session.", "info");
    }
  }

  function setupShellControls() {
    qs("#mobileNavToggle").addEventListener("click", () => nexaState.setMobileNavOpen(!state.mobileNavOpen));
    qs("#sidebarOverlay").addEventListener("click", () => nexaState.setMobileNavOpen(false));
    qs("#sidebarCollapseBtn").addEventListener("click", () => nexaState.toggleSidebarCollapsed());

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.mobileNavOpen) nexaState.setMobileNavOpen(false);
      if (event.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        event.preventDefault();
        qs("#globalSearch").focus();
      }
    });

    const searchForm = qs("#globalSearchForm");
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = qs("#globalSearch").value.trim();
      if (!query) return;
      nexaState.setProjectFilters({ query });
      navigate("projects");
      qs("#globalSearch").blur();
    });

    window.matchMedia("(min-width: 900px)").addEventListener("change", (event) => {
      if (event.matches) nexaState.setMobileNavOpen(false);
    });
  }

  function renderSkeleton() {
    return `
      <div class="view-header">
        <div>
          <div class="skeleton skeleton--eyebrow"></div>
          <div class="skeleton skeleton--title"></div>
        </div>
      </div>
      <div class="stat-grid">
        ${Array.from({ length: 4 })
          .map(() => `<div class="skeleton skeleton--card"></div>`)
          .join("")}
      </div>
      <div class="skeleton skeleton--panel"></div>
    `;
  }

  /* ------------------------------------------------------------------
   * Boot
   * ---------------------------------------------------------------- */
  function boot() {
    ui.initGlobalInteractions();
    document.addEventListener("click", onGlobalClick);
    setupShellControls();

    document.documentElement.setAttribute("data-theme", state.theme);
    state.view = routeFromHash();
    if (!location.hash) location.hash = `#/${state.view}`;

    renderStaticIcons();
    qs("#viewRoot").innerHTML = renderSkeleton();
    renderShell();

    window.setTimeout(() => {
      renderView();
    }, 480);

    nexaState.subscribe(() => renderAll());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.app = { navigate, routeFromHash };
})();
