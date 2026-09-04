/*
 * Nexa.utils — small, dependency-free DOM and formatting helpers shared by
 * every view.
 */
(function () {
  "use strict";

  const qs = (sel, scope) => (scope || document).querySelector(sel);
  const qsa = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        default:
          return "&#39;";
      }
    });
  }

  // 128400 -> "128,400"
  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  // 128400 -> "128.4k", 2100000 -> "2.1M"
  function formatCompact(value) {
    const n = Number(value);
    if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  function formatDate(isoOrDate, opts) {
    const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(
      "en-US",
      opts || { month: "short", day: "numeric", year: "numeric" },
    );
  }

  // Formats a Date/ISO string relative to `now` (both required so results
  // are deterministic/testable rather than depending on the real clock).
  function relativeTime(isoOrDate, now) {
    const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    const reference = now instanceof Date ? now : new Date(now);
    const diffMs = reference.getTime() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.round(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(date);
  }

  let uidCounter = 0;
  function uid(prefix) {
    uidCounter += 1;
    return `${prefix || "id"}-${uidCounter}-${Math.floor(Math.random() * 1e4)}`;
  }

  function debounce(fn, wait) {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  // Initials from a display name: "Sofia Marek" -> "SM"
  function initials(name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-secure contexts (still works on http://localhost).
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    area.remove();
    return ok;
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.utils = {
    qs,
    qsa,
    escapeHtml,
    formatNumber,
    formatCompact,
    formatDate,
    relativeTime,
    uid,
    debounce,
    clamp,
    initials,
    copyToClipboard,
  };
})();
