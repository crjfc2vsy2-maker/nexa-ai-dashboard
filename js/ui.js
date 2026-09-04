/*
 * Nexa.ui — cross-view UI primitives: toasts, a modal dialog, and delegated
 * tabs/dropdown behaviour. Delegated listeners are bound once to `document`
 * so they keep working after a view re-renders its markup with innerHTML.
 */
(function () {
  "use strict";

  const { qs, qsa, escapeHtml } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;

  /* ---------------------------------------------------------------------
   * Toasts
   * ------------------------------------------------------------------- */
  let toastRegion = null;
  function ensureToastRegion() {
    if (toastRegion) return toastRegion;
    toastRegion = document.createElement("div");
    toastRegion.className = "toast-region";
    toastRegion.setAttribute("role", "status");
    toastRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(toastRegion);
    return toastRegion;
  }

  const TOAST_ICON = { info: "info", success: "checkCircle", warning: "alert", danger: "alert" };

  function toast(message, type) {
    const region = ensureToastRegion();
    const kind = type || "info";
    const node = document.createElement("div");
    node.className = `toast toast--${kind}`;
    node.innerHTML =
      `<span class="toast__icon">${icon(TOAST_ICON[kind] || "info")}</span>` +
      `<span class="toast__message">${escapeHtml(message)}</span>` +
      `<button type="button" class="toast__close" aria-label="Dismiss notification">${icon("close")}</button>`;
    region.appendChild(node);

    requestAnimationFrame(() => node.classList.add("is-visible"));

    const remove = () => {
      node.classList.remove("is-visible");
      setTimeout(() => node.remove(), 220);
    };
    const timer = setTimeout(remove, 4200);
    node.querySelector(".toast__close").addEventListener("click", () => {
      clearTimeout(timer);
      remove();
    });
  }

  /* ---------------------------------------------------------------------
   * Modal
   * ------------------------------------------------------------------- */
  let activeModal = null;
  let lastFocused = null;

  function openModal({ title, bodyHtml, footerHtml, onMount, size }) {
    closeModal();
    lastFocused = document.activeElement;

    const titleId = window.Nexa.utils.uid("modal-title");
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
      <div class="modal ${size === "sm" ? "modal--sm" : ""}" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
        <div class="modal__header">
          <h2 class="modal__title" id="${titleId}">${escapeHtml(title)}</h2>
          <button type="button" class="icon-button" data-modal-close aria-label="Close dialog">${icon("close")}</button>
        </div>
        <div class="modal__body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal__footer">${footerHtml}</div>` : ""}
      </div>
    `;
    document.body.appendChild(backdrop);
    document.body.classList.add("no-scroll");
    activeModal = backdrop;

    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) closeModal();
    });
    backdrop.querySelector("[data-modal-close]").addEventListener("click", () => closeModal());

    if (typeof onMount === "function") onMount(backdrop.querySelector(".modal"));

    const focusable = qsa(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      backdrop,
    ).filter((node) => !node.disabled);
    (focusable[0] || backdrop).focus();

    backdrop.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    requestAnimationFrame(() => backdrop.classList.add("is-visible"));
  }

  function closeModal() {
    if (!activeModal) return;
    const node = activeModal;
    activeModal = null;
    node.classList.remove("is-visible");
    document.body.classList.remove("no-scroll");
    setTimeout(() => node.remove(), 180);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  /* ---------------------------------------------------------------------
   * Delegated tabs — [data-tabs] > [data-tab-trigger] + [data-tab-panel]
   * ------------------------------------------------------------------- */
  function activateTab(tablist, targetId) {
    qsa("[data-tab-trigger]", tablist).forEach((btn) => {
      const active = btn.dataset.tabTrigger === targetId;
      btn.setAttribute("aria-selected", String(active));
      btn.tabIndex = active ? 0 : -1;
    });
    const panelGroup = tablist.closest("[data-tabs]");
    qsa("[data-tab-panel]", panelGroup).forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== targetId;
    });
  }

  /* ---------------------------------------------------------------------
   * Delegated dropdowns — [data-dropdown] > [data-dropdown-trigger] + [data-dropdown-panel]
   * ------------------------------------------------------------------- */
  function closeAllDropdowns(except) {
    qsa("[data-dropdown].is-open").forEach((node) => {
      if (node === except) return;
      node.classList.remove("is-open");
      const trigger = qs("[data-dropdown-trigger]", node);
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  let initialized = false;
  function initGlobalInteractions() {
    if (initialized) return;
    initialized = true;

    document.addEventListener("click", (event) => {
      const tabTrigger = event.target.closest("[data-tab-trigger]");
      if (tabTrigger) {
        const tablist = tabTrigger.closest('[role="tablist"]');
        if (tablist) activateTab(tablist, tabTrigger.dataset.tabTrigger);
      }

      const dropdownTrigger = event.target.closest("[data-dropdown-trigger]");
      if (dropdownTrigger) {
        const dropdown = dropdownTrigger.closest("[data-dropdown]");
        const isOpen = dropdown.classList.contains("is-open");
        closeAllDropdowns(isOpen ? null : dropdown);
        dropdown.classList.toggle("is-open", !isOpen);
        dropdownTrigger.setAttribute("aria-expanded", String(!isOpen));
        if (!isOpen) {
          const firstItem = qs("[data-dropdown-panel] [role='menuitem'], [data-dropdown-panel] button", dropdown);
          if (firstItem) firstItem.focus();
        }
      } else if (!event.target.closest("[data-dropdown-panel]")) {
        closeAllDropdowns();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAllDropdowns();

      const tab = event.target.closest("[data-tab-trigger]");
      if (tab && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        const tablist = tab.closest('[role="tablist"]');
        const triggers = qsa("[data-tab-trigger]", tablist);
        const index = triggers.indexOf(tab);
        const nextIndex =
          event.key === "ArrowRight"
            ? (index + 1) % triggers.length
            : (index - 1 + triggers.length) % triggers.length;
        triggers[nextIndex].focus();
        activateTab(tablist, triggers[nextIndex].dataset.tabTrigger);
        event.preventDefault();
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Small shared render helpers (used across several views)
   * ------------------------------------------------------------------- */
  function statusTag(status) {
    const meta = window.Nexa.data.STATUS_META[status] || { label: status, tone: "neutral" };
    return `<span class="tag tag--${meta.tone}">${escapeHtml(meta.label)}</span>`;
  }

  function avatar(initials, hue, size) {
    const sizeClass = size === "sm" ? " avatar--sm" : size === "lg" ? " avatar--lg" : "";
    return `<span class="avatar avatar--${hue || "a"}${sizeClass}">${escapeHtml(initials)}</span>`;
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.ui = {
    toast,
    openModal,
    closeModal,
    closeAllDropdowns,
    initGlobalInteractions,
    statusTag,
    avatar,
  };
})();
