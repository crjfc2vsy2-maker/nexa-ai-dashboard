/*
 * Nexa.views.settings — Profile / Workspace / Notifications / Plan tabs.
 * Everything here is session-only state (no backend), but the forms
 * validate and persist within the demo the same way a real settings page would.
 */
(function () {
  "use strict";

  const nexaState = window.Nexa.state;
  const { state } = nexaState;
  const data = window.Nexa.data;
  const { escapeHtml, formatNumber } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;
  const { toast, avatar } = window.Nexa.ui;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function switchField(name, checked, label, hint) {
    return `
      <label class="switch-field">
        <span class="switch-field__text">
          <span class="switch-field__label">${label}</span>
          ${hint ? `<span class="switch-field__hint">${hint}</span>` : ""}
        </span>
        <span class="switch">
          <input type="checkbox" name="${name}" ${checked ? "checked" : ""} />
          <span class="switch__track"><span class="switch__thumb"></span></span>
        </span>
      </label>`;
  }

  function profileTab() {
    const s = state.settings;
    return `
      <div class="tab-panel" data-tab-panel="profile" role="tabpanel" aria-labelledby="tab-profile">
        <form id="profile-form" class="settings-form" novalidate>
          <div class="settings-form__avatar">
            ${avatar(data.USER.initials, "a", "lg")}
            <div>
              <p class="settings-form__avatar-name">${escapeHtml(s.name)}</p>
              <p class="settings-form__avatar-role">${escapeHtml(s.role)}</p>
            </div>
          </div>
          <div class="field">
            <label for="settings-name">Full name</label>
            <input id="settings-name" name="name" type="text" value="${escapeHtml(s.name)}" required />
            <p class="field__error" data-error="name" hidden>Your name can't be empty.</p>
          </div>
          <div class="field">
            <label for="settings-email">Email</label>
            <input id="settings-email" name="email" type="email" value="${escapeHtml(s.email)}" required />
            <p class="field__error" data-error="email" hidden>Enter a valid email address.</p>
          </div>
          <div class="field">
            <label for="settings-role">Role</label>
            <input id="settings-role" name="role" type="text" value="${escapeHtml(s.role)}" />
          </div>
          <button type="submit" class="button button--primary">Save changes</button>
        </form>
      </div>`;
  }

  function workspaceTab() {
    const s = state.settings;
    return `
      <div class="tab-panel" data-tab-panel="workspace" role="tabpanel" aria-labelledby="tab-workspace" hidden>
        <form id="workspace-form" class="settings-form" novalidate>
          <div class="field">
            <label for="settings-workspace">Workspace name</label>
            <input id="settings-workspace" name="workspace" type="text" value="${escapeHtml(s.workspace)}" required />
          </div>
          <div class="field">
            <span class="field__label-static">Appearance</span>
            <div class="segmented" role="group" aria-label="Theme">
              <button type="button" class="segmented__btn ${state.theme === "dark" ? "is-active" : ""}" data-action="set-theme" data-value="dark">${icon("moon")} Dark</button>
              <button type="button" class="segmented__btn ${state.theme === "light" ? "is-active" : ""}" data-action="set-theme" data-value="light">${icon("sun")} Light</button>
            </div>
          </div>
          <button type="submit" class="button button--primary">Save changes</button>
        </form>
      </div>`;
  }

  function notificationsTab() {
    const s = state.settings;
    return `
      <div class="tab-panel" data-tab-panel="notifs" role="tabpanel" aria-labelledby="tab-notifs" hidden>
        <form id="settings-notifs-form" class="settings-form">
          ${switchField("notifyGenerationComplete", s.notifyGenerationComplete, "Generation complete alerts", "Get notified when a generation finishes.")}
          ${switchField("notifyWeeklySummary", s.notifyWeeklySummary, "Weekly summary", "A recap of activity across your workspace.")}
          ${switchField("notifyEmailDigest", s.notifyEmailDigest, "Email digest", "Mirror in-app notifications to your inbox.")}
        </form>
      </div>`;
  }

  function planTab() {
    const credits = data.STATS.find((s) => s.id === "credits");
    const pct = Math.round((credits.value / credits.total) * 100);
    return `
      <div class="tab-panel" data-tab-panel="plan" role="tabpanel" aria-labelledby="tab-plan" hidden>
        <div class="plan-card">
          <div class="plan-card__head">
            <div>
              <p class="eyebrow">Current plan</p>
              <h3>${data.WORKSPACE.plan}</h3>
            </div>
            <button type="button" class="button button--primary" data-action="upgrade-plan">Upgrade plan</button>
          </div>
          <p class="plan-card__seats">${data.WORKSPACE.seatsUsed} of ${data.WORKSPACE.seatsTotal} seats used</p>
          <div class="progress-track"><div class="progress-fill" style="width:${(data.WORKSPACE.seatsUsed / data.WORKSPACE.seatsTotal) * 100}%"></div></div>
        </div>
        <div class="plan-card">
          <p class="eyebrow">Word credits</p>
          <p class="plan-card__credits">${formatNumber(credits.value)} <span>/ ${formatNumber(credits.total)}</span></p>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <p class="plan-card__hint">${credits.period}</p>
        </div>
      </div>`;
  }

  function render() {
    return `
      <div class="view-header">
        <div>
          <p class="eyebrow">Account</p>
          <h1>Settings</h1>
          <p class="view-header__lead">Manage your profile, workspace, and notification preferences.</p>
        </div>
      </div>

      <div class="tabs" data-tabs>
        <div class="tablist" role="tablist" aria-label="Settings sections">
          <button type="button" id="tab-profile" class="tab" role="tab" data-tab-trigger="profile" aria-selected="true" tabindex="0">Profile</button>
          <button type="button" id="tab-workspace" class="tab" role="tab" data-tab-trigger="workspace" aria-selected="false" tabindex="-1">Workspace</button>
          <button type="button" id="tab-notifs" class="tab" role="tab" data-tab-trigger="notifs" aria-selected="false" tabindex="-1">Notifications</button>
          <button type="button" id="tab-plan" class="tab" role="tab" data-tab-trigger="plan" aria-selected="false" tabindex="-1">Plan &amp; usage</button>
        </div>
        ${profileTab()}
        ${workspaceTab()}
        ${notificationsTab()}
        ${planTab()}
      </div>
    `;
  }

  function mount(root) {
    const profileForm = root.querySelector("#profile-form");
    if (profileForm) {
      profileForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = profileForm.elements.name.value.trim();
        const email = profileForm.elements.email.value.trim();
        const nameError = profileForm.querySelector('[data-error="name"]');
        const emailError = profileForm.querySelector('[data-error="email"]');
        let valid = true;

        if (!name) {
          nameError.hidden = false;
          valid = false;
        } else {
          nameError.hidden = true;
        }
        if (!EMAIL_RE.test(email)) {
          emailError.hidden = false;
          valid = false;
        } else {
          emailError.hidden = true;
        }
        if (!valid) return;

        nexaState.updateSettings({ name, email, role: profileForm.elements.role.value.trim() });
        toast("Profile updated.", "success");
      });
    }

    const workspaceForm = root.querySelector("#workspace-form");
    if (workspaceForm) {
      workspaceForm.addEventListener("submit", (event) => {
        event.preventDefault();
        nexaState.updateSettings({ workspace: workspaceForm.elements.workspace.value.trim() });
        toast("Workspace updated.", "success");
      });
    }

    const notifsForm = root.querySelector("#settings-notifs-form");
    if (notifsForm) {
      notifsForm.addEventListener("change", (event) => {
        const input = event.target;
        if (input.name) {
          nexaState.updateSettings({ [input.name]: input.checked });
          toast("Preferences saved.", "info");
        }
      });
    }
  }

  function handleAction(action, target) {
    if (action === "set-theme") {
      nexaState.setTheme(target.dataset.value);
      return true;
    }
    if (action === "upgrade-plan") {
      toast("This is a concept product — no real billing is connected.", "info");
      return true;
    }
    return false;
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.views = window.Nexa.views || {};
  window.Nexa.views.settings = { render, mount, handleAction, title: "Settings" };
})();
