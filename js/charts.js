/*
 * Nexa.charts — small inline-SVG chart builders. No charting library:
 * every function returns a plain SVG markup string.
 */
(function () {
  "use strict";

  const PALETTE = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  function points(values, width, height, pad) {
    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const stepX = (width - pad * 2) / (values.length - 1 || 1);
    return values.map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + (1 - (v - min) / span) * (height - pad * 2);
      return [x, y];
    });
  }

  // Small trend line with no axes — used inside stat cards.
  function sparkline(values, opts) {
    const o = Object.assign({ width: 96, height: 32, tone: "accent" }, opts || {});
    if (!values || values.length < 2) return "";
    const pts = points(values, o.width, o.height, 2);
    const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const last = pts[pts.length - 1];
    return (
      `<svg class="sparkline" viewBox="0 0 ${o.width} ${o.height}" preserveAspectRatio="none" aria-hidden="true">` +
      `<path d="${d}" fill="none" stroke="var(--${o.tone === "accent" ? "accent" : "text-muted"})" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.2" fill="var(--${o.tone === "accent" ? "accent" : "text-muted"})"/>` +
      `</svg>`
    );
  }

  // Area + line chart with a light grid and a handful of x-axis labels.
  function lineChart(values, opts) {
    const o = Object.assign(
      { width: 640, height: 220, pad: 28, labels: [], formatY: (v) => v },
      opts || {},
    );
    const pts = points(values, o.width, o.height, o.pad);
    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const areaBottom = o.height - o.pad;
    const area =
      `M${pts[0][0].toFixed(1)},${areaBottom} ` +
      pts.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
      ` L${pts[pts.length - 1][0].toFixed(1)},${areaBottom} Z`;

    const gridY = [0.25, 0.5, 0.75].map((f) => o.pad + f * (o.height - o.pad * 2));
    const grid = gridY
      .map(
        (y) =>
          `<line x1="${o.pad}" y1="${y.toFixed(1)}" x2="${o.width - 4}" y2="${y.toFixed(1)}" class="chart-grid"/>`,
      )
      .join("");

    const labelStep = Math.max(1, Math.floor(values.length / (o.labels.length || 1)));
    const labelMarks = (o.labels || [])
      .map((label, i) => {
        const idx = Math.min(values.length - 1, i * labelStep);
        const x = pts[idx][0];
        return `<text x="${x.toFixed(1)}" y="${o.height - 6}" class="chart-axis-label" text-anchor="middle">${label}</text>`;
      })
      .join("");

    return (
      `<svg class="line-chart" viewBox="0 0 ${o.width} ${o.height}" role="img" aria-label="Usage trend chart">` +
      `<defs><linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.22"/>` +
      `<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>` +
      grid +
      `<path d="${area}" fill="url(#lineFill)" stroke="none"/>` +
      `<path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
      labelMarks +
      `</svg>`
    );
  }

  // Donut chart from [{label, value}], returns SVG + a data-driven legend
  // (the legend is left to the caller so it can be styled per-view).
  function donutChart(segments, opts) {
    const o = Object.assign({ size: 148, thickness: 16 }, opts || {});
    const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
    const r = (o.size - o.thickness) / 2;
    const cx = o.size / 2;
    const cy = o.size / 2;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    const arcs = segments
      .map((seg, i) => {
        const fraction = seg.value / total;
        const length = fraction * circumference;
        const dash = `${length.toFixed(2)} ${(circumference - length).toFixed(2)}`;
        const rotation = (offset / circumference) * 360 - 90;
        offset += length;
        const color = seg.color || PALETTE[i % PALETTE.length];
        return (
          `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" ` +
          `stroke-width="${o.thickness}" stroke-dasharray="${dash}" ` +
          `transform="rotate(${rotation.toFixed(2)} ${cx} ${cy})" stroke-linecap="butt"/>`
        );
      })
      .join("");

    return (
      `<svg class="donut-chart" viewBox="0 0 ${o.size} ${o.size}" role="img" aria-label="Content mix chart">` +
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="${o.thickness}"/>` +
      arcs +
      `</svg>`
    );
  }

  // Horizontal bar list from [{label, value}].
  function barChart(rows, opts) {
    const o = Object.assign({ max: null, formatValue: (v) => v }, opts || {});
    const max = o.max || Math.max(...rows.map((r) => r.value), 1);
    return (
      `<div class="bar-chart">` +
      rows
        .map((row, i) => {
          const pct = Math.max(2, Math.round((row.value / max) * 100));
          const color = row.color || PALETTE[i % PALETTE.length];
          return (
            `<div class="bar-chart__row">` +
            `<span class="bar-chart__label">${row.label}</span>` +
            `<span class="bar-chart__track"><span class="bar-chart__fill" style="width:${pct}%;background:${color}"></span></span>` +
            `<span class="bar-chart__value">${o.formatValue(row.value)}</span>` +
            `</div>`
          );
        })
        .join("") +
      `</div>`
    );
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.charts = { sparkline, lineChart, donutChart, barChart, PALETTE };
})();
