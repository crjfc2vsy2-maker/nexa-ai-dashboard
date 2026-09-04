/*
 * Nexa.state — a small mutable store + action functions. Every action
 * mutates `state` then notifies subscribers (app.js re-renders the shell
 * and the active view). This is intentionally simple: there is no backend,
 * so "persistence" is just this in-memory object for the session.
 */
(function () {
  "use strict";

  const data = window.Nexa.data;
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const state = {
    theme: localStorage.getItem("nexa-theme") || "dark",
    view: "dashboard",
    sidebarCollapsed: false,
    mobileNavOpen: false,
    commandOpen: false,

    projects: clone(data.PROJECTS),
    generations: clone(data.GENERATIONS),
    notifications: clone(data.NOTIFICATIONS),
    activity: clone(data.ACTIVITY),

    projectFilters: { query: "", status: "all", sort: "updated" },
    historyFilters: { query: "", type: "all" },
    notifFilter: "all",
    analyticsRange: "30D",
    generatorDraft: { contentType: data.CONTENT_TYPES[0], tone: data.TONES[0], language: data.LANGUAGES[0] },

    settings: {
      name: data.USER.name,
      email: data.USER.email,
      role: data.USER.role,
      workspace: data.WORKSPACE.name,
      notifyGenerationComplete: true,
      notifyWeeklySummary: true,
      notifyEmailDigest: false,
    },
  };

  const listeners = [];
  function subscribe(fn) {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }
  function notify(reason) {
    listeners.forEach((fn) => fn(reason));
  }

  // --- Navigation -----------------------------------------------------
  function setView(view) {
    state.view = view;
    state.mobileNavOpen = false;
    notify("view");
  }
  function setTheme(theme) {
    state.theme = theme;
    localStorage.setItem("nexa-theme", theme);
    notify("theme");
  }
  function toggleSidebarCollapsed() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    notify("sidebar");
  }
  function setMobileNavOpen(open) {
    state.mobileNavOpen = open;
    notify("mobileNav");
  }

  // --- Projects ---------------------------------------------------------
  function getProject(id) {
    return state.projects.find((p) => p.id === id) || null;
  }
  function createProject({ name, client, type }) {
    const project = {
      id: window.Nexa.utils.uid("prj"),
      name,
      client: client || "Internal",
      type: type || data.CONTENT_TYPES[0],
      status: "draft",
      progress: 0,
      contentCount: 0,
      owner: data.USER.initials,
      hue: "a",
      updated: new Date().toISOString(),
    };
    state.projects.unshift(project);
    notify("projects");
    return project;
  }
  function setProjectStatus(id, status) {
    const project = getProject(id);
    if (!project) return;
    project.status = status;
    project.updated = new Date().toISOString();
    notify("projects");
  }
  function setProjectFilters(partial) {
    Object.assign(state.projectFilters, partial);
    notify("projectFilters");
  }

  // --- Generator / history ----------------------------------------------
  function addGeneration(entry) {
    const generation = Object.assign(
      { id: window.Nexa.utils.uid("gen"), createdAt: new Date().toISOString() },
      entry,
    );
    state.generations.unshift(generation);
    notify("generations");
    return generation;
  }
  function getGenerationsForProject(projectId) {
    return state.generations.filter((g) => g.projectId === projectId);
  }
  function setHistoryFilters(partial) {
    Object.assign(state.historyFilters, partial);
    notify("historyFilters");
  }
  function setGeneratorDraft(partial) {
    Object.assign(state.generatorDraft, partial);
  }

  // --- Notifications ------------------------------------------------------
  function unreadNotificationCount() {
    return state.notifications.filter((n) => !n.read).length;
  }
  function toggleNotificationRead(id) {
    const notification = state.notifications.find((n) => n.id === id);
    if (!notification) return;
    notification.read = !notification.read;
    notify("notifications");
  }
  function markAllNotificationsRead() {
    state.notifications.forEach((n) => {
      n.read = true;
    });
    notify("notifications");
  }
  function setNotifFilter(value) {
    state.notifFilter = value;
    notify("notifFilter");
  }

  // --- Analytics / settings ----------------------------------------------
  function setAnalyticsRange(value) {
    state.analyticsRange = value;
    notify("analyticsRange");
  }
  function updateSettings(partial) {
    Object.assign(state.settings, partial);
    notify("settings");
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.state = {
    state,
    subscribe,
    notify,
    setView,
    setTheme,
    toggleSidebarCollapsed,
    setMobileNavOpen,
    getProject,
    createProject,
    setProjectStatus,
    setProjectFilters,
    addGeneration,
    getGenerationsForProject,
    setHistoryFilters,
    setGeneratorDraft,
    unreadNotificationCount,
    toggleNotificationRead,
    markAllNotificationsRead,
    setNotifFilter,
    setAnalyticsRange,
    updateSettings,
  };
})();
