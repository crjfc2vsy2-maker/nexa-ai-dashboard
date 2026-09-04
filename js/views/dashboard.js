/*
 * Nexa.views.dashboard — overview: greeting + quick actions, usage stats,
 * recent projects/generations, content performance, and an activity feed.
 */
(function () {
  "use strict";

  const { state } = window.Nexa.state;
  const data = window.Nexa.data;
  const { formatNumber, formatCompact, relativeTime, escapeHtml } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;
  const charts = window.Nexa.charts;
  const { statusTag, avatar } = window.Nexa.ui;

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function statCard(stat) {
    if (stat.format === "credits") {
      const pct = Math.round((stat.value / stat.total) * 100);
      return `
        <article class="stat-card stat-card--progress" data-reveal>
          <p class="stat-card__label">${stat.label}</p>
          <p class="stat-card__value">${formatNumber(stat.value)} <span class="stat-card__of">/ ${formatNumber(stat.total)}</span></p>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <p class="stat-card__period">${stat.period}</p>
        </article>`;
    }

    const displayValue = stat.format === "compact" ? formatCompact(stat.value) : stat.value;
    const deltaGood = stat.format === "raw" ? stat.delta < 0 : stat.delta > 0;
    const trendSeries = data.ANALYTICS.usageByDay.slice(-12).map((v) => v + (stat.id === "speed" ? -v * 0.4 : 0));

    return `
      <article class="stat-card" data-reveal>
        <p class="stat-card__label">${stat.label}</p>
        <div class="stat-card__row">
          <p class="stat-card__value">${displayValue}</p>
          ${charts.sparkline(trendSeries, { tone: deltaGood ? "accent" : "muted" })}
        </div>
        <p class="stat-card__period">
          <span class="delta ${deltaGood ? "delta--up" : "delta--down"}">
            ${icon(stat.delta >= 0 ? "chevronRight" : "chevronRight", "delta__icon")}
            ${Math.abs(stat.delta)}%
          </span>
          ${stat.period}
        </p>
      </article>`;
  }

  function projectRow(project) {
    return `
      <li class="row-item" data-route="projects">
        <span class="row-item__lead">
          ${avatar(project.owner, project.hue, "sm")}
        </span>
        <span class="row-item__body">
          <span class="row-item__title">${escapeHtml(project.name)}</span>
          <span class="row-item__meta">${escapeHtml(project.client)} &middot; ${escapeHtml(project.type)}</span>
        </span>
        <span class="row-item__end">${statusTag(project.status)}</span>
      </li>`;
  }

  function generationRow(generation) {
    const project = window.Nexa.state.getProject(generation.projectId);
    return `
      <li class="row-item" data-route="history">
        <span class="row-item__lead row-item__lead--icon">${icon("sparkle")}</span>
        <span class="row-item__body">
          <span class="row-item__title">${escapeHtml(generation.type)} &middot; ${escapeHtml(project ? project.client : "—")}</span>
          <span class="row-item__meta">${escapeHtml(generation.excerpt.slice(0, 64))}&hellip;</span>
        </span>
        <span class="row-item__end row-item__end--muted">${relativeTime(generation.createdAt, new Date())}</span>
      </li>`;
  }

  function performanceCard(row, index) {
    const tones = ["performance-card--a", "performance-card--b", "performance-card--c"];
    return `
      <article class="performance-card ${tones[index % tones.length]}" data-reveal>
        <p class="performance-card__project">${escapeHtml(row.project)}</p>
        <p class="performance-card__value">${formatCompact(row.views)} <span>views</span></p>
        <div class="performance-card__metrics">
          <span>${row.engagement}% engagement</span>
          <span>${row.ctr}% CTR</span>
        </div>
      </article>`;
  }

  function activityItem(item) {
    return `
      <li class="activity-item">
        <span class="activity-item__dot"></span>
        <p class="activity-item__text">
          <strong>${escapeHtml(item.actor)}</strong> ${escapeHtml(item.action)}
          <span class="activity-item__target">${escapeHtml(item.target)}</span>
        </p>
        <time class="activity-item__time">${relativeTime(item.time, new Date())}</time>
      </li>`;
  }

  function render() {
    const recentProjects = [...state.projects]
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, 4);
    const recentGenerations = [...state.generations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    return `
      <div class="view-header">
        <div>
          <p class="eyebrow">${data.WORKSPACE.name}</p>
          <h1>${greeting()}, ${data.USER.name.split(" ")[0]}</h1>
          <p class="view-header__lead">Here's what's moving across your workspace today.</p>
        </div>
        <div class="quick-actions">
          <button type="button" class="button button--ghost" data-action="open-create-project">${icon("plus")} New project</button>
          <button type="button" class="button button--primary" data-route="generator">${icon("sparkle")} Generate content</button>
        </div>
      </div>

      <section class="stat-grid" aria-label="Usage statistics">
        ${data.STATS.map(statCard).join("")}
      </section>

      <div class="dashboard-grid">
        <div class="dashboard-grid__main">
          <section class="panel" aria-labelledby="recent-projects-title">
            <div class="panel__head">
              <h2 id="recent-projects-title">Recent projects</h2>
              <button type="button" class="text-button" data-route="projects">View all ${icon("chevronRight")}</button>
            </div>
            <ul class="row-list">${recentProjects.map(projectRow).join("")}</ul>
          </section>

          <section class="panel" aria-labelledby="recent-generations-title">
            <div class="panel__head">
              <h2 id="recent-generations-title">Recent generations</h2>
              <button type="button" class="text-button" data-route="history">View all ${icon("chevronRight")}</button>
            </div>
            <ul class="row-list">${recentGenerations.map(generationRow).join("")}</ul>
          </section>
        </div>

        <div class="dashboard-grid__side">
          <section class="panel" aria-labelledby="performance-title">
            <div class="panel__head">
              <h2 id="performance-title">Content performance</h2>
              <button type="button" class="text-button" data-route="analytics">Analytics ${icon("chevronRight")}</button>
            </div>
            <div class="performance-grid">
              ${data.ANALYTICS.performance.slice(0, 3).map(performanceCard).join("")}
            </div>
          </section>

          <section class="panel" aria-labelledby="activity-title">
            <div class="panel__head">
              <h2 id="activity-title">Activity feed</h2>
            </div>
            <ul class="activity-list">${state.activity.slice(0, 6).map(activityItem).join("")}</ul>
          </section>
        </div>
      </div>
    `;
  }

  function mount() {
    // Rows/cards use data-route for navigation; app.js handles that globally.
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.views = window.Nexa.views || {};
  window.Nexa.views.dashboard = { render, mount, title: "Dashboard" };
})();
