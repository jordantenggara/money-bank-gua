import type { MonthlyBudgetSummary } from "./types.ts";
type FeedbackKind = "success" | "error";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const percentageFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function renderSummaryItem(id: string, label: string, value: string): string {
  return `<div class="budget-summary__item"><dt>${label}</dt><dd id="${id}">${value}</dd></div>`;
}

export function renderBudgetSummary(summary: MonthlyBudgetSummary): string {
  const hasBudget = summary.totalBudget !== null;
  const budget = hasBudget
    ? escapeHtml(formatCurrency(summary.totalBudget as number))
    : "Belum diatur";
  const expense = escapeHtml(formatCurrency(summary.totalExpense));
  const remaining =
    summary.remainingBudget === null
      ? "&mdash;"
      : escapeHtml(formatCurrency(summary.remainingBudget));
  const usage =
    summary.usagePercentage === null
      ? "&mdash;"
      : `${escapeHtml(percentageFormatter.format(summary.usagePercentage))}%`;

  return `<div id="budget-summary-content" class="budget-summary" data-budget-month="${escapeHtml(summary.month)}" data-budget-status="${summary.status}">
  <dl class="budget-summary__totals">
    ${renderSummaryItem("budget-total", "Total budget", budget)}
    ${renderSummaryItem("budget-expense", "Total expense", expense)}
    ${renderSummaryItem("budget-remaining", "Remaining budget", remaining)}
  </dl>
  <div id="budget-usage-indicator" class="budget-summary__indicator" data-budget-status="${summary.status}">
    <p>Usage: <span id="budget-usage">${usage}</span></p>
    <p>Status: <strong id="budget-status">${summary.status}</strong></p>
  </div>
</div>`;
}

export function renderBudgetFeedback(
  kind: FeedbackKind,
  message: string,
  fieldErrors?: Record<string, string[]>,
): string {
  const errors = fieldErrors
    ? Object.entries(fieldErrors).flatMap(([field, messages]) =>
        messages.map(
          (item) =>
            `<li data-budget-field="${escapeHtml(field)}">${escapeHtml(item)}</li>`,
        ),
      )
    : [];
  const errorList = errors.length
    ? `<ul class="budget-feedback__errors">${errors.join("")}</ul>`
    : "";
  const role = kind === "error" ? "alert" : "status";

  return `<div id="budget-form-feedback-message" class="budget-feedback budget-feedback--${kind}" data-budget-feedback="${kind}" role="${role}"><p>${escapeHtml(message)}</p>${errorList}</div>`;
}

export function htmlResponse(
  html: string,
  init: { status?: number; headers?: HeadersInit } = {},
): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", "private, no-store");

  return new Response(html, { status: init.status ?? 200, headers });
}
