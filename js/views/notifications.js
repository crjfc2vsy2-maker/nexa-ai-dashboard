/*
 * Nexa.views.notifications — notification centre with an all/unread filter,
 * per-item toggling, and a "mark all as read" action.
 */
(function () {
  "use strict";

  const nexaState = window.Nexa.state;
  const { state } = nexaState;
  const { escapeHtml, relativeTime } = window.Nexa.utils;
  const icon = window.Nexa.icons.svg;

  const TYPE_ICON = { info: "info", success: "checkCircle", warning: "alert" };

  function visibleNotifications() {
    if (state.notifFilter === "unread") return state.notifications.filter((n) => !n.read);
    return state.notifications;
  }

  function notificationItem(notification) {
    return `
      <li class="notification-item notification-item--${notification.type} ${notification.read ? "" : "is-unread"}">
        <span class="notification-item__icon">${icon(TYPE_ICON[notification.type] || "info")}</span>
        <span class="notification-item__body">
          <span class="notification-item__title">${escapeHtml(notification.title)}</span>
          <span class="notification-item__text">${escapeHtml(notification.body)}</span>
          <time class="notification-item__time">${relativeTime(notification.createdAt, new Date())}</time>
        </span>
        <button type="button" class="text-button" data-action="toggle-notification" data-id="${notification.id}">
          ${notification.read ? "Mark unread" : "Mark read"}
        </button>
      </li>`;
  }

  function emptyState() {
    return `
      <div class="empty-state">
        ${icon("checkCircle")}
        <h3>You're all caught up</h3>
        <p>No unread notifications right now.</p>
      </div>`;
  }

  function render() {
    const list = visibleNotifications();
    const unreadCount = nexaState.unreadNotificationCount();

    return `
      <div class="view-header">
        <div>
          <p class="eyebrow">Inbox</p>
          <h1>Notifications</h1>
          <p class="view-header__lead">${unreadCount === 0 ? "No unread notifications." : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`}</p>
        </div>
        <div class="quick-actions">
          <button type="button" class="button button--ghost" data-action="mark-all-read" ${unreadCount === 0 ? "disabled" : ""}>${icon("check")} Mark all as read</button>
        </div>
      </div>

      <div class="pill-row" role="tablist" aria-label="Filter notifications">
        <button type="button" class="pill ${state.notifFilter === "all" ? "is-active" : ""}" data-action="notif-filter" data-value="all">All</button>
        <button type="button" class="pill ${state.notifFilter === "unread" ? "is-active" : ""}" data-action="notif-filter" data-value="unread">Unread</button>
      </div>

      ${list.length === 0 ? emptyState() : `<ul class="notification-list">${list.map(notificationItem).join("")}</ul>`}
    `;
  }

  function mount() {}

  function handleAction(action, target) {
    if (action === "notif-filter") {
      nexaState.setNotifFilter(target.dataset.value);
      return true;
    }
    if (action === "toggle-notification") {
      nexaState.toggleNotificationRead(target.dataset.id);
      return true;
    }
    if (action === "mark-all-read") {
      nexaState.markAllNotificationsRead();
      window.Nexa.ui.toast("All notifications marked as read.", "success");
      return true;
    }
    return false;
  }

  window.Nexa = window.Nexa || {};
  window.Nexa.views = window.Nexa.views || {};
  window.Nexa.views.notifications = { render, mount, handleAction, title: "Notifications" };
})();
