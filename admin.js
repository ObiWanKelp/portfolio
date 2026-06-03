// ============================================================
//  admin.js — Admin Panel Logic
// ============================================================
//
//  PASSWORD SETUP
//  --------------
//  Don't store the plain password here. Instead, store its
//  SHA-256 hex digest. To generate one, open any browser
//  console and run:
//
//    async function hash(s) {
//      const buf = await crypto.subtle.digest(
//        "SHA-256", new TextEncoder().encode(s));
//      return [...new Uint8Array(buf)]
//        .map(b => b.toString(16).padStart(2,"0")).join("");
//    }
//    hash("yourPassword").then(console.log);
//
//  Paste the resulting 64-char hex string below.
//  The default below is the hash of "aditya2025".
// ============================================================

const ADMIN_PASSWORD_HASH =
  "f29bdfd7e378e82474fd57acf1fed403842d4945901a7d51fdfd3a79a71fc270";

/* ── Helpers ────────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

const toast = (msg, type = "success") => {
  const el = $("toast");
  el.textContent = msg;
  el.className = `toast show ${type}`;
  setTimeout(() => el.classList.remove("show"), 3000);
};

async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ── Brute-force lockout ────────────────────────────────────── */
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

function getLockout() {
  const raw = sessionStorage.getItem("admin_lockout");
  return raw ? JSON.parse(raw) : { attempts: 0, until: 0 };
}
function setLockout(data) {
  sessionStorage.setItem("admin_lockout", JSON.stringify(data));
}
function isLockedOut() {
  const { until } = getLockout();
  return Date.now() < until;
}
function recordFailedAttempt() {
  const lock = getLockout();
  lock.attempts += 1;
  if (lock.attempts >= MAX_ATTEMPTS) {
    lock.until = Date.now() + LOCKOUT_MS;
    lock.attempts = 0;
  }
  setLockout(lock);
}
function clearLockout() {
  sessionStorage.removeItem("admin_lockout");
}

/* ── Session ────────────────────────────────────────────────── */
function isLoggedIn() {
  return sessionStorage.getItem("admin_auth") === "true";
}

function showDash() {
  $("loginScreen").classList.add("hidden");
  $("adminDash").classList.remove("hidden");
  initAdmin();
}

// Check on load — no initAdmin call here beyond showDash
if (isLoggedIn()) {
  showDash();
}

/* ── Login ──────────────────────────────────────────────────── */
$("loginBtn").addEventListener("click", doLogin);
$("passwordInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});

async function doLogin() {
  if (isLockedOut()) {
    const { until } = getLockout();
    const mins = Math.ceil((until - Date.now()) / 60000);
    $("loginError").textContent =
      `Too many attempts. Try again in ${mins} min.`;
    return;
  }

  const val = $("passwordInput").value;
  const digest = await sha256(val);

  if (digest === ADMIN_PASSWORD_HASH) {
    clearLockout();
    sessionStorage.setItem("admin_auth", "true");
    showDash();
  } else {
    recordFailedAttempt();
    const lock = getLockout();
    const remaining = MAX_ATTEMPTS - lock.attempts;
    $("loginError").textContent = isLockedOut()
      ? "Too many attempts. Locked for 5 minutes."
      : `Incorrect password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`;
    $("passwordInput").value = "";
    $("passwordInput").classList.add("shake");
    setTimeout(() => $("passwordInput").classList.remove("shake"), 500);
  }
}

/* ── Logout ─────────────────────────────────────────────────── */
$("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("admin_auth");
  location.reload();
});

/* ── Data Access ─────────────────────────────────────────────── */
function getProjects() {
  const saved = localStorage.getItem("portfolio_projects");
  return saved ? JSON.parse(saved) : [...PORTFOLIO_DATA.projects];
}
function setProjects(data) {
  localStorage.setItem("portfolio_projects", JSON.stringify(data));
}
function getSkills() {
  const saved = localStorage.getItem("portfolio_skills");
  return saved ? JSON.parse(saved) : [...PORTFOLIO_DATA.skills];
}
function setSkills(data) {
  localStorage.setItem("portfolio_skills", JSON.stringify(data));
}
function getProfile() {
  const saved = localStorage.getItem("portfolio_profile");
  if (saved) return JSON.parse(saved);
  return {
    bio: "IT student passionate about building clean web interfaces and exploring data-driven problem solving. Currently focused on HTML, CSS, JavaScript, and Python — actively crafting projects to sharpen full-stack and data analysis skills.",
    phrases: [
      "web experiences.",
      "data pipelines.",
      "clean interfaces.",
      "full-stack apps.",
      "cool things. ✨",
    ],
  };
}
function setProfile(data) {
  localStorage.setItem("portfolio_profile", JSON.stringify(data));
}

/* ── Init (called once after login) ────────────────────────── */
function initAdmin() {
  renderProjectsTable();
  renderSkillsAdmin();
  loadProfile();
  initSidebar();
  initProjectForm();
  initSkillForm();
  initProfileSave();
}

/* ── Sidebar Navigation ─────────────────────────────────────── */
function initSidebar() {
  document.querySelectorAll(".sidebar-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".sidebar-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = document.getElementById("panel-" + btn.dataset.panel);
      if (panel) panel.classList.add("active");
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   PROJECTS
═══════════════════════════════════════════════════════════════ */
function renderProjectsTable() {
  const projects = getProjects();
  const tbody = $("projectsBody");
  tbody.innerHTML = projects
    .map(
      (p) => `
    <tr data-id="${p.id}">
      <td>${String(p.id).padStart(2, "0")}</td>
      <td class="td-title">${p.title}</td>
      <td><span class="td-badge ${p.category}">${p.category}</span></td>
      <td class="${p.featured ? "td-yes" : "td-no"}">${p.featured ? "✓ Yes" : "—"}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" data-action="edit-project" data-id="${p.id}">Edit</button>
          <button class="btn-del"  data-action="del-project"  data-id="${p.id}">Delete</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

// Event delegation — no inline onclick globals
$("projectsBody").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  if (btn.dataset.action === "edit-project") editProject(id);
  if (btn.dataset.action === "del-project") deleteProject(id);
});

function initProjectForm() {
  $("addProjectBtn").addEventListener("click", () => {
    $("editProjectId").value = "";
    $("projectFormTitle").textContent = "New Project";
    $("pTitle").value = "";
    $("pDesc").value = "";
    $("pUrl").value = "";
    $("pCat").value = "web";
    $("pTags").value = "";
    $("pFeatured").checked = false;
    $("projectForm").classList.remove("hidden");
    $("pTitle").focus();
  });

  $("cancelProjectBtn").addEventListener("click", () => {
    $("projectForm").classList.add("hidden");
  });

  $("saveProjectBtn").addEventListener("click", saveProject);
}

function editProject(id) {
  const p = getProjects().find((x) => x.id === id);
  if (!p) return;
  $("editProjectId").value = id;
  $("projectFormTitle").textContent = "Edit Project";
  $("pTitle").value = p.title;
  $("pDesc").value = p.description;
  $("pUrl").value = p.url;
  $("pCat").value = p.category;
  $("pTags").value = p.tags.join(", ");
  $("pFeatured").checked = p.featured;
  $("projectForm").classList.remove("hidden");
  $("pTitle").focus();
}

function saveProject() {
  const title = $("pTitle").value.trim();
  const desc = $("pDesc").value.trim();
  const url = $("pUrl").value.trim();
  if (!title || !desc || !url) {
    toast("Please fill in Title, Description and URL.", "error");
    return;
  }

  const projects = getProjects();
  const editId = $("editProjectId").value;
  const newData = {
    id: editId ? parseInt(editId) : Date.now(),
    title,
    description: desc,
    url,
    category: $("pCat").value,
    tags: $("pTags")
      .value.split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    featured: $("pFeatured").checked,
  };

  if (editId) {
    const idx = projects.findIndex((p) => p.id === parseInt(editId));
    if (idx > -1) projects[idx] = newData;
  } else {
    projects.push(newData);
  }

  setProjects(projects);
  renderProjectsTable();
  $("projectForm").classList.add("hidden");
  toast(editId ? "Project updated ✓" : "Project added ✓");
}

function deleteProject(id) {
  if (!confirm("Delete this project?")) return;
  setProjects(getProjects().filter((p) => p.id !== id));
  renderProjectsTable();
  toast("Project deleted.", "error");
}

/* ══════════════════════════════════════════════════════════════
   SKILLS
═══════════════════════════════════════════════════════════════ */
function renderSkillsAdmin() {
  const skills = getSkills();
  $("skillsAdminGrid").innerHTML = skills
    .map(
      (g, i) => `
    <div class="skill-admin-card">
      <div class="skill-admin-header">
        <div class="skill-admin-title">
          <span>${g.icon}</span> ${g.category}
        </div>
        <div class="action-btns">
          <button class="btn-edit" data-action="edit-skill" data-idx="${i}">Edit</button>
          <button class="btn-del"  data-action="del-skill"  data-idx="${i}">Del</button>
        </div>
      </div>
      <div class="skill-admin-items">
        ${g.items.map((s) => `<span class="skill-admin-pill">${s}</span>`).join("")}
      </div>
    </div>
  `,
    )
    .join("");
}

// Event delegation for skills grid
$("skillsAdminGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx);
  if (btn.dataset.action === "edit-skill") editSkillGroup(idx);
  if (btn.dataset.action === "del-skill") deleteSkillGroup(idx);
});

function initSkillForm() {
  $("addSkillGroupBtn").addEventListener("click", () => {
    $("editSkillIdx").value = "";
    $("skillFormTitle").textContent = "New Skill Group";
    $("sCat").value = "";
    $("sIcon").value = "";
    $("sItems").value = "";
    $("skillForm").classList.remove("hidden");
    $("sCat").focus();
  });
  $("cancelSkillBtn").addEventListener("click", () =>
    $("skillForm").classList.add("hidden"),
  );
  $("saveSkillBtn").addEventListener("click", saveSkillGroup);
}

function editSkillGroup(idx) {
  const g = getSkills()[idx];
  if (!g) return;
  $("editSkillIdx").value = idx;
  $("skillFormTitle").textContent = "Edit Skill Group";
  $("sCat").value = g.category;
  $("sIcon").value = g.icon;
  $("sItems").value = g.items.join(", ");
  $("skillForm").classList.remove("hidden");
  $("sCat").focus();
}

function saveSkillGroup() {
  const cat = $("sCat").value.trim();
  const icon = $("sIcon").value.trim();
  const items = $("sItems")
    .value.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!cat || !items.length) {
    toast("Category and at least one skill required.", "error");
    return;
  }

  const skills = getSkills();
  const idx = $("editSkillIdx").value;
  const newG = { category: cat, icon: icon || "•", items };

  if (idx !== "") skills[parseInt(idx)] = newG;
  else skills.push(newG);

  setSkills(skills);
  renderSkillsAdmin();
  $("skillForm").classList.add("hidden");
  toast(idx !== "" ? "Skill group updated ✓" : "Skill group added ✓");
}

function deleteSkillGroup(idx) {
  if (!confirm("Delete this skill group?")) return;
  const skills = getSkills();
  skills.splice(idx, 1);
  setSkills(skills);
  renderSkillsAdmin();
  toast("Skill group deleted.", "error");
}

/* ══════════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════════ */
function loadProfile() {
  const p = getProfile();
  $("profileBio").value = p.bio;
  $("profilePhrases").value = p.phrases.join("\n");
}

function initProfileSave() {
  $("saveProfileBtn").addEventListener("click", () => {
    const bio = $("profileBio").value.trim();
    const phrases = $("profilePhrases")
      .value.split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!bio || !phrases.length) {
      toast("Bio and at least one phrase required.", "error");
      return;
    }
    setProfile({ bio, phrases });
    toast("Profile saved ✓");
  });
}
