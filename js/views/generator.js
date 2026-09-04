/*
 * Nexa.views.generator — the AI content generator: form, simulated
 * generation with a loading state, a result panel, and a small history rail.
 */
(function () {
  "use strict";

  const nexaState = window.Nexa.state;
  const { state } = nexaState;
  const data = window.Nexa.data;
  const { escapeHtml, relativeTime, copyToClipboard } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;
  const { toast } = window.Nexa.ui;

  let isGenerating = false;
  let lastResult = null; // { text, wordCount, meta }
  let lastDraftSnapshot = null; // the draft used to produce lastResult, for Regenerate

  const TEMPLATES_BY_TYPE = {
    "Blog post": [
      (p) =>
        `Open with the tension in "${p}" before widening into the bigger picture. Walk through two or three concrete examples, then close with one specific action the reader can take today.`,
      (p) =>
        `A strong angle here is to lead with a common misconception about ${lower(p)}, correct it in a single sentence, and spend the rest of the post proving why the correction matters in practice.`,
    ],
    "Social caption": [
      (p) => `${p} — said plainly, shown proudly. Save this for the next time someone asks why it matters.`,
      (p) => `Not a gimmick. Just ${lower(p)} — and the receipts to back it up.`,
    ],
    Email: [
      (p) => `Here's the honest version: ${lower(p)}. No fluff, no filler — just what you need to know and one clear next step.`,
      (p) => `Quick note on ${lower(p)}: it's simpler than it sounds, and worth two minutes of your time today.`,
    ],
    "Ad copy": [
      (p) => `${p}. Stop scrolling — this is the version worth clicking on.`,
      (p) => `${p}. No catch. Just the thing you actually asked for.`,
    ],
    "Product description": [
      (p) => `Built around one idea: ${lower(p)}. Every detail after that is in service of it — considered, not decorative.`,
    ],
    "Video script": [
      (p) => `[Open on a close shot] "${p}" [Cut to product] Here's how it actually works — no jargon, thirty seconds, straight through.`,
    ],
  };

  function lower(text) {
    return text.charAt(0).toLowerCase() + text.slice(1);
  }

  function composeContent(draft) {
    const variants = TEMPLATES_BY_TYPE[draft.contentType] || TEMPLATES_BY_TYPE["Blog post"];
    const template = variants[Math.floor(Math.random() * variants.length)];
    const prompt = draft.prompt.trim().replace(/\.$/, "");
    const text = template(prompt);
    return { text, wordCount: text.trim().split(/\s+/).length };
  }

  function resultPanel() {
    if (isGenerating) {
      return `
        <div class="result-panel result-panel--loading" role="status" aria-live="polite">
          <div class="loading-spinner" aria-hidden="true"></div>
          <p>Generating your ${escapeHtml(state.generatorDraft.contentType.toLowerCase())}&hellip;</p>
        </div>`;
    }
    if (!lastResult) {
      return `
        <div class="result-panel result-panel--empty">
          ${icon("sparkle")}
          <h3>Your generated content will appear here</h3>
          <p>Describe what you need on the left, choose a tone and language, then hit Generate.</p>
        </div>`;
    }
    return `
      <div class="result-panel">
        <div class="result-panel__meta">
          <span class="tag tag--accent">${escapeHtml(lastResult.meta.contentType)}</span>
          <span>${escapeHtml(lastResult.meta.tone)}</span>
          <span>${escapeHtml(lastResult.meta.language)}</span>
          <span>${lastResult.wordCount} words</span>
        </div>
        <p class="result-panel__text">${escapeHtml(lastResult.text)}</p>
        <div class="result-panel__actions">
          <button type="button" class="button button--ghost button--sm" data-action="copy-result">${icon("copy")} Copy</button>
          <button type="button" class="button button--ghost button--sm" data-action="regenerate">${icon("refresh")} Regenerate</button>
        </div>
      </div>`;
  }

  function historyRail() {
    const recent = [...state.generations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
    return `
      <section class="panel panel--compact" aria-labelledby="generator-history-title">
        <div class="panel__head">
          <h2 id="generator-history-title">Generation history</h2>
          <button type="button" class="text-button" data-route="history">Full history ${icon("chevronRight")}</button>
        </div>
        <ul class="row-list">
          ${recent
            .map(
              (g) => `
            <li class="row-item">
              <span class="row-item__lead row-item__lead--icon">${icon("sparkle")}</span>
              <span class="row-item__body">
                <span class="row-item__title">${escapeHtml(g.type)}</span>
                <span class="row-item__meta">${escapeHtml(g.excerpt.slice(0, 56))}&hellip;</span>
              </span>
              <span class="row-item__end row-item__end--muted">${relativeTime(g.createdAt, new Date())}</span>
            </li>`,
            )
            .join("")}
        </ul>
      </section>`;
  }

  function render() {
    const draft = state.generatorDraft;
    const typeOptions = data.CONTENT_TYPES.map(
      (t) => `<option value="${t}" ${t === draft.contentType ? "selected" : ""}>${t}</option>`,
    ).join("");
    const toneOptions = data.TONES.map(
      (t) => `<option value="${t}" ${t === draft.tone ? "selected" : ""}>${t}</option>`,
    ).join("");
    const languageOptions = data.LANGUAGES.map(
      (l) => `<option value="${l}" ${l === draft.language ? "selected" : ""}>${l}</option>`,
    ).join("");

    return `
      <div class="view-header">
        <div>
          <p class="eyebrow">Nexa AI</p>
          <h1>Content generator</h1>
          <p class="view-header__lead">Describe what you need — Nexa drafts a first version in seconds.</p>
        </div>
      </div>

      <div class="generator-grid">
        <section class="panel generator-form" aria-labelledby="generator-form-title">
          <h2 id="generator-form-title" class="visually-hidden">Generation settings</h2>
          <form id="generator-form" novalidate>
            <div class="field">
              <label for="gen-type">Content type</label>
              <select id="gen-type" name="contentType">${typeOptions}</select>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="gen-tone">Tone</label>
                <select id="gen-tone" name="tone">${toneOptions}</select>
              </div>
              <div class="field">
                <label for="gen-language">Language</label>
                <select id="gen-language" name="language">${languageOptions}</select>
              </div>
            </div>
            <div class="field">
              <label for="gen-prompt">Prompt</label>
              <textarea id="gen-prompt" name="prompt" rows="6" placeholder="e.g. Announce our new resistance-band bundle to a fitness-focused audience." required>${escapeHtml(draft.prompt || "")}</textarea>
              <p class="field__error" data-error="prompt" hidden>Add a few more words so Nexa has something to work with (at least 12 characters).</p>
            </div>
            <button type="submit" class="button button--primary button--block" ${isGenerating ? "disabled" : ""}>
              ${icon("sparkle")} ${isGenerating ? "Generating…" : "Generate"}
            </button>
          </form>
        </section>

        <section class="generator-result" aria-live="polite">
          ${resultPanel()}
        </section>
      </div>

      ${historyRail()}
    `;
  }

  function runGeneration(root, draftOverride) {
    const draft = draftOverride || {
      contentType: root.querySelector("#gen-type").value,
      tone: root.querySelector("#gen-tone").value,
      language: root.querySelector("#gen-language").value,
      prompt: root.querySelector("#gen-prompt").value,
    };

    const errorEl = root.querySelector('[data-error="prompt"]');
    const promptField = root.querySelector("#gen-prompt");
    if (!draftOverride && draft.prompt.trim().length < 12) {
      if (errorEl) errorEl.hidden = false;
      if (promptField) {
        promptField.setAttribute("aria-invalid", "true");
        promptField.focus();
      }
      return;
    }

    nexaState.setGeneratorDraft(draft);
    isGenerating = true;
    nexaState.notify("generator-loading");

    setTimeout(() => {
      const { text, wordCount } = composeContent(draft);
      lastResult = { text, wordCount, meta: { ...draft } };
      lastDraftSnapshot = draft;
      isGenerating = false;
      nexaState.addGeneration({
        projectId: null,
        type: draft.contentType,
        tone: draft.tone,
        language: draft.language,
        prompt: draft.prompt.trim(),
        excerpt: text,
        wordCount,
      });
      toast("Content generated.", "success");
    }, 1100);
  }

  function mount(root) {
    const form = root.querySelector("#generator-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        runGeneration(root);
      });
      ["contentType", "tone", "language", "prompt"].forEach((name) => {
        const fieldEl = form.elements[name];
        if (!fieldEl) return;
        fieldEl.addEventListener("change", () => {
          nexaState.setGeneratorDraft({ [name]: fieldEl.value });
        });
      });
    }
  }

  function handleAction(action, target, root) {
    if (action === "copy-result" && lastResult) {
      copyToClipboard(lastResult.text).then((ok) => {
        toast(ok ? "Copied to clipboard." : "Couldn't copy — try selecting the text.", ok ? "success" : "warning");
      });
      return true;
    }
    if (action === "regenerate" && lastDraftSnapshot) {
      isGenerating = true;
      nexaState.notify("generator-loading");
      setTimeout(() => {
        const { text, wordCount } = composeContent(lastDraftSnapshot);
        lastResult = { text, wordCount, meta: { ...lastDraftSnapshot } };
        isGenerating = false;
        nexaState.addGeneration({
          projectId: null,
          type: lastDraftSnapshot.contentType,
          tone: lastDraftSnapshot.tone,
          language: lastDraftSnapshot.language,
          prompt: lastDraftSnapshot.prompt.trim(),
          excerpt: text,
          wordCount,
        });
        toast("Regenerated.", "success");
      }, 900);
      return true;
    }
    return false;
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.views = window.Nexa.views || {};
  window.Nexa.views.generator = { render, mount, handleAction, title: "AI Generator" };
})();
