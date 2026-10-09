/* Framework-agnostic render helpers for the design system.
 * The current app is vanilla JS, so these helpers provide a small component
 * contract without introducing a build step or a rendering dependency.
 */
(function attachDesignSystem(global) {
  const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const attrs = (input = {}) => Object.entries(input)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => value === true ? key : `${key}="${escapeHtml(value)}"`)
    .join(" ");

  const button = ({ label = "", variant = "default", size = "default", icon = "", className = "", attributes = {} } = {}) =>
    `<button class="ds-button ds-button--${variant} ${size !== "default" ? `ds-button--${size}` : ""} ${className}" ${attrs(attributes)}>${icon}${label ? `<span>${escapeHtml(label)}</span>` : ""}</button>`;

  const pageHeader = ({ title, subtitle = "", actions = "", className = "" } = {}) =>
    `<div class="ds-page-header ${className}"><div class="ds-page-header__copy"><h1 class="ds-page-title">${escapeHtml(title)}</h1>${subtitle ? `<p class="ds-page-subtitle">${escapeHtml(subtitle)}</p>` : ""}</div>${actions ? `<div class="ds-page-actions">${actions}</div>` : ""}</div>`;

  const card = ({ className = "", header = "", body = "", footer = "" } = {}) =>
    `<article class="ds-card ${className}">${header ? `<div class="ds-card__header">${header}</div>` : ""}${body ? `<div class="ds-card__body">${body}</div>` : ""}${footer ? `<div class="ds-card__footer">${footer}</div>` : ""}</article>`;

  const sectionTitle = ({ title, description = "", actions = "", className = "" } = {}) =>
    `<div class="ds-section-title ${className}"><div><h2 class="ds-section-title__heading">${escapeHtml(title)}</h2>${description ? `<p class="ds-section-title__description">${escapeHtml(description)}</p>` : ""}</div>${actions ? `<div class="ds-section-title__actions">${actions}</div>` : ""}</div>`;

  const badge = ({ label = "", tone = "neutral", className = "" } = {}) =>
    `<span class="ds-badge ds-badge--${tone} ${className}">${escapeHtml(label)}</span>`;

  const metricCard = ({ label, value, note = "", icon = "", tone = "blue", trend = "", sparkline = [], sparklineValues = [], className = "" } = {}) =>
    `<article class="ds-metric-card ${className}"><span class="ds-metric-card__icon ds-metric-card__icon--${tone}">${icon}</span><div class="ds-metric-card__copy"><span class="ds-metric-card__label">${escapeHtml(label)}</span><strong class="ds-metric-card__value">${escapeHtml(value)}</strong>${trend ? `<div class="ds-metric-card__trend">${trend}</div>` : `<small class="ds-metric-card__note">${escapeHtml(note)}</small>`}</div>${sparkline.length ? `<span class="ds-metric-card__sparkline" aria-label="${escapeHtml(label)}近 ${sparkline.length} 天趋势">${sparkline.map((height,index) => { const point = sparklineValues[index] ?? height; return `<i tabindex="0" data-value="${escapeHtml(String(point))}" title="${escapeHtml(String(point))}" style="height:${Number(height)}%"><span class="sparkline-tooltip">${escapeHtml(String(point))}</span></i>`; }).join("")}</span>` : ""}</article>`;

  global.DesignSystem = Object.freeze({ escapeHtml, button, pageHeader, card, sectionTitle, badge, metricCard });
})(window);
