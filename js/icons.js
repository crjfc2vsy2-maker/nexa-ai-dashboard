/*
 * Nexa.icons — a small hand-authored line-icon set (24x24, stroke-based).
 * No icon library: every icon is plain SVG markup built from primitives.
 */
(function () {
  "use strict";

  const PATHS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    folder: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.2h8a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 17V6.5Z"/>',
    sparkle: '<path d="M11 3.5c.4 2.6 1.2 4.3 2.4 5.5 1.2 1.2 2.9 2 5.5 2.4-2.6.4-4.3 1.2-5.5 2.4-1.2 1.2-2 2.9-2.4 5.5-.4-2.6-1.2-4.3-2.4-5.5-1.2-1.2-2.9-2-5.5-2.4 2.6-.4 4.3-1.2 5.5-2.4 1.2-1.2 2-2.9 2.4-5.5Z"/><path d="M19 3v3M17.5 4.5h3" stroke-width="1.4"/>',
    clock: '<circle cx="12" cy="12" r="8.25"/><path d="M12 7.75V12l3 2"/>',
    chart: '<path d="M4 19V10M10 19V5M16 19v-7M21 19H3.2" stroke-linejoin="round"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="1.75"/><path d="M9 4v16M3 9.5h6"/>',
    bell: '<path d="M6 10a6 6 0 1 1 12 0c0 4.2 1.2 5.7 2 6.5H4c.8-.8 2-2.3 2-6.5Z"/><path d="M9.75 19.5a2.25 2.25 0 0 0 4.5 0"/>',
    gear: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7.5"/><path d="M12 4.5v1.2M12 18.3v1.2M19.5 12h-1.2M5.7 12H4.5M17.4 6.6l-.85.85M7.45 16.55l-.85.85M17.4 17.4l-.85-.85M7.45 7.45l-.85-.85" stroke-width="1.4"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.3-4.3"/>',
    sun: '<circle cx="12" cy="12" r="4.25"/><path d="M12 2.75v2.4M12 18.85v2.4M21.25 12h-2.4M5.15 12h-2.4M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" stroke-width="1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 6.8 6.8 0 0 0 20 14.5Z"/>',
    menu: '<path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19.5 7"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.75"/><path d="M4.5 15.5v-10a1.5 1.5 0 0 1 1.5-1.5h10"/>',
    refresh: '<path d="M4.5 12a7.5 7.5 0 0 1 12.6-5.5M19.5 12a7.5 7.5 0 0 1-12.6 5.5"/><path d="M17 3.5v3.5h-3.5M7 20.5V17h3.5"/>',
    trash: '<path d="M5 7h14M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M7 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7"/>',
    filter: '<path d="M3.5 5h17L14 12.7V19l-4 2v-8.3Z" stroke-linejoin="round"/>',
    arrowUpRight: '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
    dots: '<circle cx="12" cy="5.5" r="1.35"/><circle cx="12" cy="12" r="1.35"/><circle cx="12" cy="18.5" r="1.35"/>',
    user: '<circle cx="12" cy="8.25" r="3.5"/><path d="M4.75 19.5a7.25 7.25 0 0 1 14.5 0"/>',
    logout: '<path d="M9 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3"/><path d="M20 12H10.5M20 12l-3.5-3.5M20 12l-3.5 3.5"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.75"/><path d="m4 7 8 6 8-6"/>',
    download: '<path d="M12 3.5V15M7.5 11l4.5 4.5L16.5 11"/><path d="M4.5 17v2A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5v-2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.75"/><path d="M3.5 10h17M8 3v3.6M16 3v3.6"/>',
    alert: '<path d="M12 3.5 21.5 20h-19Z" stroke-linejoin="round"/><path d="M12 10v4.2"/><circle cx="12" cy="17.2" r="0.15" fill="currentColor" stroke-width="2.4"/>',
    info: '<circle cx="12" cy="12" r="8.25"/><path d="M12 11v5.5"/><circle cx="12" cy="8" r="0.15" fill="currentColor" stroke-width="2.4"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.25"/><path d="m8.25 12.4 2.5 2.6 5-5.5"/>',
    stack: '<path d="m12 3.5 8.5 4.5-8.5 4.5-8.5-4.5Z" stroke-linejoin="round"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
    globe: '<circle cx="12" cy="12" r="8.25"/><path d="M3.75 12h16.5M12 3.75c2.4 2.2 3.6 5 3.6 8.25s-1.2 6.05-3.6 8.25c-2.4-2.2-3.6-5-3.6-8.25S9.6 5.95 12 3.75Z"/>',
    tag: '<path d="M11.4 4H6a2 2 0 0 0-2 2v5.4c0 .53.21 1.04.59 1.41l8.6 8.6a2 2 0 0 0 2.82 0l5.4-5.4a2 2 0 0 0 0-2.82l-8.6-8.6A2 2 0 0 0 11.4 4Z" stroke-linejoin="round"/><circle cx="8.75" cy="8.75" r="1.15"/>',
    switch: '<rect x="3" y="7.5" width="18" height="9" rx="4.5"/><circle cx="8" cy="12" r="3" fill="currentColor" stroke="none"/>',
  };

  function markup(name) {
    return PATHS[name] || PATHS.info;
  }

  function svg(name, cls) {
    return (
      '<svg class="icon' +
      (cls ? " " + cls : "") +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      markup(name) +
      "</svg>"
    );
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.icons = { svg, markup, names: Object.keys(PATHS) };
})();
