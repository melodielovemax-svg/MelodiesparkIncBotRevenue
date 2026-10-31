"use strict";
const state = { user: null, view: "overview", csrf: "", editing: null };
const names = {
  overview: "Command Center",
  products: "Product Factory",
  customers: "CRM & Customers",
  work_orders: "Work Orders",
  agents: "Agent Registry",
  integrations: "Integrations",
  network: "Network Health",
  capabilities: "MCP & Monitoring",
  finance: "Financial Core",
  cases: "Legal Nexus",
  audit: "Evidence Nexus",
  security: "PowerShield",
};
const descriptions = {
  products:
    "Manage draft digital products and services. Publishing and checkout remain gated.",
  customers:
    "Manage customer records without fabricating sales or subscriptions.",
  work_orders: "Track work to be reviewed, approved and completed.",
  agents:
    "Register agents for governance. No autonomous execution is configured.",
  integrations:
    "Maintain integration inventory. Connections are not activated from this screen.",
  cases: "Track governance and legal review cases. This is not legal advice.",
};
const $ = (id) => document.getElementById(id);
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
function add(parent, ...children) {
  children.forEach((c) => parent.append(c));
  return parent;
}
function badge(text) {
  return el("span", "badge " + text, text);
}
function clear(node) {
  node.replaceChildren();
}
function stamp(time) {
  return time
    ? new Date(time).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not checked";
}
function toast(message) {
  const t = $("toast");
  t.textContent = message;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}
async function api(path, options = {}) {
  const response = await fetch("/api/" + path, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.method && options.method !== "GET"
        ? { "X-CSRF-Token": state.csrf }
        : {}),
    },
    ...options,
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw Error("Unexpected server response");
  }
  if (!response.ok) {
    if (response.status === 401 && path !== "auth/login") {
      showLogin();
      throw Error("Session expired. Please sign in again.");
    }
    throw Error(
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail || "Request failed"),
    );
  }
  return data;
}
function showLogin() {
  state.user = null;
  $("shell").hidden = true;
  $("login").hidden = false;
  $("login-error").textContent = "";
}
function showShell(user) {
  state.user = user;
  state.csrf = user.csrf_token;
  $("login").hidden = true;
  $("shell").hidden = false;
  $("user-name").textContent = user.email;
  $("avatar").textContent = user.email[0];
  navigate(state.view);
}
function page(title, subtitle, eyebrow = "OPERATIONS") {
  const main = $("main");
  clear(main);
  const head = el("div", "page-head");
  const left = el("div");
  add(
    left,
    el("div", "eyebrow", eyebrow),
    el("h1", "", title),
    el("p", "", subtitle),
  );
  const actions = el("div", "head-actions");
  add(head, left, actions);
  main.append(head);
  return { main, actions };
}
function panel(title, subtitle = "") {
  const p = el("section", "panel");
  const h = el("div", "panel-head");
  const text = el("div");
  add(text, el("h2", "", title));
  if (subtitle) add(text, el("small", "", subtitle));
  h.append(text);
  p.append(h);
  return p;
}
function row(title, sub, status) {
  const r = el("div", "status-row");
  const left = el("div");
  add(left, el("div", "row-title", title), el("div", "row-sub", sub));
  add(r, left, badge(status));
  return r;
}
function empty(title, copy) {
  const e = el("div", "empty");
  add(
    e,
    el("div", "empty-icon", "◇"),
    el("strong", "", title),
    el("p", "", copy),
  );
  return e;
}
function refreshButton() {
  const b = el("button", "outline-btn", "↻  Refresh");
  b.type = "button";
  b.onclick = () => navigate(state.view);
  return b;
}
function dateLabel(data) {
  return el("span", "stamp", "Checked " + stamp(data.checked_at));
}
function metric(title, value, foot, icon) {
  const card = el("div", "metric");
  const top = el("div", "metric-top");
  add(top, el("span", "", title), el("span", "metric-icon", icon));
  add(
    card,
    top,
    el("div", "metric-value", String(value)),
    el("div", "metric-foot", foot),
  );
  return card;
}
async function overview() {
  const data = await api("overview");
  const { main, actions } = page(
    "Command Center",
    "A clear view of what is real, what is pending, and what is protected.",
    "EXECUTIVE OVERVIEW",
  );
  add(actions, dateLabel(data), refreshButton());
  const banner = el("section", "intro-banner");
  const intro = el("div");
  add(
    intro,
    el("div", "eyebrow", "CONTROLLED BY DESIGN"),
    el("h2", "", "Operate with evidence. Move with intention."),
    el(
      "p",
      "",
      "Financial actions stay disabled until verified integrations and explicit approval are in place.",
    ),
  );
  add(banner, intro, el("span", "banner-mark", "✳"));
  main.append(banner);
  const metrics = el("div", "metrics");
  add(
    metrics,
    metric(
      "Products & services",
      data.counts.products || 0,
      "Database records · not sales",
      "◇",
    ),
    metric(
      "Customer records",
      data.counts.customers || 0,
      "No revenue inferred",
      "♧",
    ),
    metric(
      "Registered agents",
      data.counts.agents || 0,
      "No execution enabled",
      "✳",
    ),
    metric(
      "Audit events",
      data.audit_events,
      "Hash-chain " + data.audit_integrity.toLowerCase(),
      "▥",
    ),
  );
  main.append(metrics);
  const grid = el("div", "grid-2");
  const ops = panel(
    "Operational posture",
    "Current control and integration status",
  );
  const b = el("div", "panel-body");
  add(
    b,
    row(
      "Financial transactions",
      "No automatic transfers, payouts or broadcasts",
      data.financial_status,
    ),
    row(
      "Revenue verification",
      "No provider-confirmed payment evidence",
      data.revenue_status,
    ),
    row("Production release", "Human approval required", data.release_status),
    row("Audit history", "Database hash-chain integrity", data.audit_integrity),
  );
  ops.append(b);
  const recent = panel("Workspace inventory", "Real records in this instance");
  const rb = el("div", "panel-body");
  for (const [kind, label] of [
    ["work_orders", "Open work orders"],
    ["integrations", "Integration records"],
    ["cases", "Governance cases"],
  ])
    add(
      rb,
      row(
        label,
        `${data.counts[kind] || 0} records in database`,
        data.counts[kind] || 0 ? "DRAFT" : "UNVERIFIED",
      ),
    );
  recent.append(rb);
  add(grid, ops, recent);
  main.append(grid);
}
function field(label, name, value = "", type = "text") {
  const wrap = el(
    "div",
    "form-field" + (name === "description" ? " full" : ""),
  );
  const id = "field-" + name;
  const lab = el("label", "", label);
  lab.htmlFor = id;
  const input =
    name === "description"
      ? el("textarea")
      : name === "status"
        ? el("select")
        : el("input");
  input.id = id;
  input.name = name;
  if (input.tagName === "INPUT") {
    input.type = type;
    input.maxLength = name === "title" ? 120 : 2000;
    input.required = name === "title";
  }
  if (name === "description") input.maxLength = 2000;
  if (name === "status") {
    for (const status of [
      "DRAFT",
      "UNVERIFIED",
      "BLOCKED",
      "PENDING_APPROVAL",
      "DISABLED",
      "COMPLETED",
    ]) {
      const o = el("option", "", status.replaceAll("_", " "));
      o.value = status;
      input.append(o);
    }
  }
  input.value = value;
  add(wrap, lab, input);
  return wrap;
}
async function records(kind) {
  const data = await api("records/" + kind);
  const { main, actions } = page(
    names[kind],
    descriptions[kind],
    "WORKSPACE / " + kind.replaceAll("_", " ").toUpperCase(),
  );
  add(actions, dateLabel(data), refreshButton());
  if (state.user.role === "admin") {
    const create = el("button", "primary-btn", "+ New record");
    create.onclick = () => {
      state.editing = state.editing ? "" : "new";
      records(kind);
    };
    actions.append(create);
  }
  if (state.editing) {
    const editing = state.editing;
    const current = typeof editing === "object" ? editing : null;
    const form = el("form", "panel form-panel");
    add(form, el("h2", "", current ? "Edit record" : "Create a draft record"));
    const grid = el("div", "form-grid");
    add(
      grid,
      field("Name / title", "title", current?.title || ""),
      field("Status", "status", current?.status || "DRAFT"),
      field("Description", "description", current?.description || ""),
    );
    form.append(grid);
    const acts = el("div", "form-actions");
    const save = el(
      "button",
      "primary-btn",
      current ? "Save changes" : "Create record",
    );
    save.type = "submit";
    const cancel = el("button", "outline-btn", "Cancel");
    cancel.type = "button";
    cancel.onclick = () => {
      state.editing = null;
      records(kind);
    };
    add(acts, save, cancel);
    form.append(acts);
    const error = el("div", "error");
    error.setAttribute("role", "alert");
    form.append(error);
    form.onsubmit = async (ev) => {
      ev.preventDefault();
      save.disabled = true;
      const body = Object.fromEntries(new FormData(form).entries());
      try {
        await api("records/" + kind + (current ? "/" + current.id : ""), {
          method: current ? "PATCH" : "POST",
          body: JSON.stringify(body),
        });
        state.editing = null;
        toast(current ? "Record updated" : "Record created");
        records(kind);
      } catch (e) {
        error.textContent = e.message;
        save.disabled = false;
      }
    };
    main.append(form);
  }
  const p = panel(
    "Records",
    `${data.items.length} shown · most recent first · maximum 100`,
  );
  if (!data.items.length)
    p.append(
      empty(
        "No records yet",
        "Records created by your team will appear here. Nothing is pre-populated or simulated.",
      ),
    );
  else {
    const scroll = el("div", "table-scroll");
    const table = el("table");
    const thead = el("thead");
    const header = el("tr");
    for (const h of ["NAME / DESCRIPTION", "STATUS", "UPDATED", ""])
      header.append(el("th", "", h));
    thead.append(header);
    const tbody = el("tbody");
    for (const item of data.items) {
      const tr = el("tr");
      const first = el("td");
      add(
        first,
        el("strong", "", item.title),
        el("span", "desc", item.description || "No description"),
      );
      add(
        tr,
        first,
        add(el("td"), badge(item.status)),
        el("td", "", stamp(item.updated_at)),
      );
      const action = el("td");
      if (state.user.role === "admin") {
        const edit = el("button", "small-btn", "Edit");
        edit.onclick = () => {
          state.editing = item;
          records(kind);
        };
        action.append(edit);
      }
      tr.append(action);
      tbody.append(tr);
    }
    add(table, thead, tbody);
    scroll.append(table);
    p.append(scroll);
  }
  main.append(p);
}
async function network() {
  const data = await api("network");
  const { main, actions } = page(
    "Network Health",
    "Read-only TCP diagnostics for configured local services.",
    "LIVE DIAGNOSTICS",
  );
  add(actions, dateLabel(data), refreshButton());
  main.append(
    el(
      "div",
      "notice",
      "These checks test local socket availability only; they do not confirm provider authentication or service readiness.",
    ),
  );
  const p = panel("Local endpoints", data.scope);
  const body = el("div", "panel-body");
  for (const item of data.items)
    body.append(row(item.service, item.endpoint, item.status));
  p.append(body);
  main.append(p);
}
async function capabilities() {
  const data = await api("capabilities");
  const { main, actions } = page(
    "MCP & Monitoring",
    "Integration architecture and verification gates, without simulated provider activity.",
    "INTELLIGENCE LAYER",
  );
  add(actions, dateLabel(data), refreshButton());
  const p = panel(
    "Provider capabilities",
    "External connections require configuration and review",
  );
  const body = el("div", "panel-body");
  for (const item of data.items)
    body.append(row(item.name, item.reason, item.status));
  p.append(body);
  main.append(p);
}
async function finance() {
  const data = await api("finance");
  const { main, actions } = page(
    "Financial Core",
    "Evidence-backed controls for revenue and reconciliation.",
    "GOVERNANCE / FINANCE",
  );
  add(actions, dateLabel(data), refreshButton());
  main.append(
    el(
      "div",
      "notice warning",
      "No payments, subscriptions or reconciliation data are connected. Values are intentionally unavailable rather than shown as zero revenue.",
    ),
  );
  const p = panel("Provider readiness", "Financial execution is not available");
  const b = el("div", "panel-body");
  add(
    b,
    row(
      "Verified revenue",
      "Not available · no confirmed provider events",
      data.status,
    ),
    row(
      "Reconciliation",
      "Provider statements and callbacks required",
      data.reconciliation,
    ),
    row(
      "Interac e-Transfer",
      "Bank permissions and callbacks have not been verified",
      data.interac,
    ),
    row("Subscriptions", "No billing provider connected", data.subscriptions),
  );
  p.append(b);
  main.append(p);
}
async function audit() {
  const data = await api("audit");
  const { main, actions } = page(
    "Evidence Nexus",
    "Append-only event history for local record changes.",
    "GOVERNANCE / EVIDENCE",
  );
  add(actions, dateLabel(data), refreshButton());
  main.append(
    el(
      "div",
      "notice",
      "Hash-linked events are tamper-evident within this database. External anchoring and protected backups are required for stronger immutability.",
    ),
  );
  const p = panel(
    "Audit trail",
    `Chain integrity: ${data.integrity} · ${data.items.length} latest events`,
  );
  if (!data.items.length)
    p.append(
      empty(
        "No events recorded",
        "Creating or updating a record adds a hash-linked audit event.",
      ),
    );
  else {
    const scroll = el("div", "table-scroll");
    const table = el("table");
    const header = el("tr");
    for (const h of ["EVENT", "SUBJECT", "TIMESTAMP", "HASH"])
      header.append(el("th", "", h));
    const thead = add(el("thead"), header);
    const tbody = el("tbody");
    for (const event of data.items) {
      const tr = el("tr");
      add(
        tr,
        add(el("td"), el("strong", "", event.action)),
        el("td", "", event.subject),
        el("td", "", stamp(event.at)),
        el("td", "mono", event.hash.slice(0, 20) + "…"),
      );
      tbody.append(tr);
    }
    add(table, thead, tbody);
    scroll.append(table);
    p.append(scroll);
  }
  main.append(p);
}
async function security() {
  const [overview, autos] = await Promise.all([
    api("overview"),
    api("automations"),
  ]);
  const { main, actions } = page(
    "PowerShield",
    "Security controls and automation policy, visible by default.",
    "SECURITY POSTURE",
  );
  add(actions, dateLabel(overview), refreshButton());
  const grid = el("div", "grid-2");
  const p = panel("Non-negotiable controls", "Server-side policy flags");
  const body = el("div", "panel-body");
  const policy = el("div", "policy-grid");
  for (const [key, value] of Object.entries(overview.policy)) {
    const item = el("div", "policy-item");
    add(
      item,
      el("span", "", key.replaceAll("_", " ")),
      badge(value === true ? "COMPLETED" : "DISABLED"),
    );
    policy.append(item);
  }
  body.append(policy);
  p.append(body);
  const a = panel(
    "Automation registry",
    "Declared states · not execution evidence",
  );
  const ab = el("div", "panel-body");
  for (const item of autos.items)
    ab.append(row(item.id, item.description, item.status));
  a.append(ab);
  add(grid, p, a);
  main.append(grid);
  if (state.user.role === "admin") {
    const users = await api("users");
    const team = panel(
      "Access management",
      "Provisioned team members · passwords are never displayed",
    );
    const body = el("div", "panel-body");
    for (const item of users.items)
      body.append(
        row(
          item.email,
          "Access: " + item.role + " · Added " + stamp(item.created_at),
          "COMPLETED",
        ),
      );
    const form = el("form", "form-grid");
    form.style.marginTop = "22px";
    const email = field("New member email", "email");
    email.querySelector("input").type = "email";
    email.querySelector("input").required = true;
    const password = field("Initial password (14+ characters)", "password");
    password.querySelector("input").type = "password";
    password.querySelector("input").minLength = 14;
    password.querySelector("input").required = true;
    const role = el("div", "form-field");
    const label = el("label", "", "Access level");
    label.htmlFor = "new-role";
    const select = el("select");
    select.id = "new-role";
    select.name = "role";
    for (const value of ["viewer", "admin"]) {
      const option = el("option", "", value);
      option.value = value;
      select.append(option);
    }
    add(role, label, select);
    const action = el("div", "form-field");
    add(action, el("label", "", "Provision account"));
    const button = el("button", "primary-btn", "Add team member");
    button.type = "submit";
    action.append(button);
    add(form, email, password, role, action);
    const error = el("div", "error");
    error.setAttribute("role", "alert");
    error.style.gridColumn = "1 / -1";
    form.append(error);
    form.onsubmit = async (ev) => {
      ev.preventDefault();
      button.disabled = true;
      try {
        const values = Object.fromEntries(new FormData(form).entries());
        await api("users", { method: "POST", body: JSON.stringify(values) });
        toast("Team member created");
        security();
      } catch (e) {
        error.textContent = e.message;
        button.disabled = false;
      }
    };
    body.append(form);
    team.append(body);
    main.append(team);
  }
}
async function navigate(view) {
  if (!names[view]) view = "overview";
  if (state.view !== view) state.editing = null;
  state.view = view;
  document
    .querySelectorAll(".nav-item")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.view === view),
    );
  $("crumb").textContent = names[view].toUpperCase();
  $("sidebar").classList.remove("open");
  $("main").replaceChildren(el("div", "muted", "Loading live data…"));
  try {
    if (view === "overview") await overview();
    else if (
      [
        "products",
        "customers",
        "agents",
        "integrations",
        "work_orders",
        "cases",
      ].includes(view)
    )
      await records(view);
    else if (view === "network") await network();
    else if (view === "capabilities") await capabilities();
    else if (view === "finance") await finance();
    else if (view === "audit") await audit();
    else if (view === "security") await security();
  } catch (e) {
    if (state.user)
      $("main").replaceChildren(
        el("div", "notice danger", "Unable to load: " + e.message),
      );
  }
}
document
  .querySelectorAll(".nav-item")
  .forEach((btn) => (btn.onclick = () => navigate(btn.dataset.view)));
$("open-menu").onclick = () => $("sidebar").classList.add("open");
$("close-menu").onclick = () => $("sidebar").classList.remove("open");
$("theme-toggle").onclick = () => {
  document.documentElement.classList.toggle("light");
  localStorage.setItem(
    "mmd_theme",
    document.documentElement.classList.contains("light") ? "light" : "dark",
  );
};
if (localStorage.getItem("mmd_theme") === "light")
  document.documentElement.classList.add("light");
$("login-form").onsubmit = async (e) => {
  e.preventDefault();
  $("login-error").textContent = "";
  const form = e.currentTarget;
  const btn = form.querySelector("button");
  btn.disabled = true;
  try {
    const user = await api("auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value,
      }),
    });
    form.reset();
    showShell(user);
  } catch (err) {
    $("login-error").textContent = err.message;
  } finally {
    btn.disabled = false;
  }
};
$("logout").onclick = async () => {
  try {
    await api("auth/logout", { method: "POST" });
  } finally {
    showLogin();
  }
};
(async () => {
  try {
    showShell(await api("auth/me"));
  } catch {
    showLogin();
  }
})();
