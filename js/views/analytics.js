/*
 * Nexa.views.analytics — usage trend, content mix, and performance-by-project,
 * with a date-range control and two tabs.
 */
(function () {
  "use strict";

  const nexaState = window.Nexa.state;
  const { state } = nexaState;
  const data = window.Nexa.data;
  const { formatNumber, formatCompact, escapeHtml } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;
  const charts = window.Nexa.charts;

  const RANGE_DAYS = { "7D": 7, "30D": 30, "90D": 90 };

  function usageSlice() {
    const days = RANGE_DAYS[state.analyticsRange];
    return data.ANALYTICS.usageByDay.slice(-days);
  }

  function rangeLabels(days) {
    if (days <= 7) return ["Mon", "Wed", "Fri", "Sun"];
    if (days <= 30) return ["4w ago", "3w ago", "2w ago", "1w ago", "Today"];
    return ["90d ago", "60d ago", "30d ago", "Today"];
  }

  function dateRangeControl() {
    return `
      <div class="segmented" role="group" aria-label="Date range">
        ${Object.keys(RANGE_DAYS)
          .map(
            (key) => `
          <button type="button" class="segmented__btn ${state.analyticsRange === key ? "is-active" : ""}"
            data-action="analytics-range" data-value="${key}" aria-pressed="${state.analyticsRange === key}">${key}</button>`,
          )
          .join("")}
      </div>`;
  }

  function overviewTab() {
    const series = usageSlice();
    const total = series.reduce((sum, v) => sum + v, 0);
    const avg = Math.round(total / series.length);
    const best = Math.max(...series);

    return `
      <div class="tab-panel" data-tab-panel="overview" role="tabpanel" aria-labelledby="tab-overview">
        <div class="analytics-callouts">
          <div class="callout"><p class="callout__value">${formatCompact(total)}</p><p class="callout__label">Words in range</p></div>
          <div class="callout"><p class="callout__value">${formatCompact(avg)}</p><p class="callout__label">Daily average</p></div>
          <div class="callout"><p class="callout__value">${formatCompact(best)}</p><p class="callout__label">Best day</p></div>
        </div>

        <div class="chart-card">
          <div class="chart-card__head">
            <h3>Words generated</h3>
            ${dateRangeControl()}
          </div>
          ${charts.lineChart(series, { labels: rangeLabels(series.length) })}
        </div>

        <div class="analytics-split">
          <div class="chart-card chart-card--donut">
            <h3>Content mix</h3>
            <div class="donut-row">
              ${charts.donutChart(data.ANALYTICS.contentByType.map((c) => ({ label: c.type, value: c.value })))}
              <ul class="legend">
                ${data.ANALYTICS.contentByType
                  .map(
                    (c, i) => `
                  <li><span class="legend__swatch" style="background:${charts.PALETTE[i % charts.PALETTE.length]}"></span>${c.type} <strong>${c.value}%</strong></li>`,
                  )
                  .join("")}
              </ul>
            </div>
          </div>

          <div class="chart-card">
            <h3>Top performing content</h3>
            <ol class="top-content-list">
              ${data.ANALYTICS.topContent
                .map(
                  (item, i) => `
                <li>
                  <span class="top-content-list__rank">${i + 1}</span>
                  <span class="top-content-list__body">
                    <span class="top-content-list__title">${escapeHtml(item.title)}</span>
                    <span class="top-content-list__meta">${escapeHtml(item.project)} &middot; ${escapeHtml(item.type)}</span>
                  </span>
                  <span class="top-content-list__score">${item.score}</span>
                </li>`,
                )
                .join("")}
            </ol>
          </div>
        </div>
      </div>`;
  }

  function performanceTab() {
    const rows = data.ANALYTICS.performance;
    const maxViews = Math.max(...rows.map((r) => r.views));
    return `
      <div class="tab-panel" data-tab-panel="performance" role="tabpanel" aria-labelledby="tab-performance" hidden>
        <div class="chart-card">
          <h3>Views by project</h3>
          ${charts.barChart(
            rows.map((r) => ({ label: r.project, value: r.views })),
            { max: maxViews, formatValue: formatCompact },
          )}
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Project</th><th>Views</th><th>Engagement</th><th>CTR</th></tr></thead>
            <tbody>
              ${rows
                .map(
                  (r) => `
                <tr>
                  <td class="table-title">${escapeHtml(r.project)}</td>
                  <td>${formatNumber(r.views)}</td>
                  <td>${r.engagement}%</td>
                  <td>${r.ctr}%</td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  function render() {
    return `
      <div class="view-header">
        <div>
          <p class="eyebrow">Insights</p>
          <h1>Analytics</h1>
          <p class="view-header__lead">Realistic, clearly fictional demo data for illustration only.</p>
        </div>
      </div>

      <div class="tabs" data-tabs>
        <div class="tablist" role="tablist" aria-label="Analytics views">
          <button type="button" id="tab-overview" class="tab" role="tab" data-tab-trigger="overview" aria-selected="true" tabindex="0">Overview</button>
          <button type="button" id="tab-performance" class="tab" role="tab" data-tab-trigger="performance" aria-selected="false" tabindex="-1">Performance</button>
        </div>
        ${overviewTab()}
        ${performanceTab()}
      </div>
    `;
  }

  function mount() {}

  function handleAction(action, target) {
    if (action === "analytics-range") {
      nexaState.setAnalyticsRange(target.dataset.value);
      return true;
    }
    return false;
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.views = window.Nexa.views || {};
  window.Nexa.views.analytics = { render, mount, handleAction, title: "Analytics" };
})();
