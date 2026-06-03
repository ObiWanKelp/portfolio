// ============================================================
//  main.js
// ============================================================

// data.js (loaded before this script) defines window.PORTFOLIO_DATA.
// Do NOT redefine it here — that would overwrite the real portfolio content.

/* ── 1. Particle Canvas ─────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W,
    H,
    particles = [],
    mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(rand) {
      this.x = Math.random() * W;
      this.y = rand ? Math.random() * H : H + 10;
      this.size = Math.random() * 1.5 + 0.3;
      this.speed = Math.random() * 0.4 + 0.1;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.vx = (Math.random() - 0.5) * 0.2;
    }
    update() {
      this.y -= this.speed;
      this.x += this.vx;
      const dx = this.x - mouse.x,
        dy = this.y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        const a = Math.atan2(dy, dx);
        this.x += Math.cos(a) * 0.5;
        this.y += Math.sin(a) * 0.5;
      }
      if (this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(120,160,255,${this.opacity})`;
      ctx.fill();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    for (let i = 0; i < particles.length; i++)
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x,
          dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100,140,255,${0.06 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    requestAnimationFrame(animate);
  }

  resize();
  for (let i = 0; i < 80; i++) particles.push(new Particle());
  animate();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
})();

/* ── 2. Custom Cursor ───────────────────────────────────────── */
(function () {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;
  let rx = 0,
    ry = 0,
    mx = 0,
    my = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top = my + "px";
  });
  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(loop);
  })();
  document.addEventListener("mouseover", (e) => {
    ring.classList.toggle(
      "hovered",
      !!e.target.closest("a,button,.proj-card,.filter-btn"),
    );
  });
})();

/* ── 3. Typing Effect ───────────────────────────────────────── */
(function () {
  const el = document.getElementById("typedText");
  if (!el) return;
  const saved = localStorage.getItem("portfolio_profile");
  const phrases = saved
    ? JSON.parse(saved).phrases || []
    : [
        "web experiences.",
        "data pipelines.",
        "clean interfaces.",
        "full-stack apps.",
        "cool things. ✨",
      ];
  let pi = 0,
    ci = 0,
    del = false;
  function tick() {
    const p = phrases[pi];
    el.textContent = del ? p.slice(0, ci--) : p.slice(0, ci++);
    if (!del && ci === p.length + 1) {
      del = true;
      setTimeout(tick, 1800);
    } else if (del && ci === 0) {
      del = false;
      pi = (pi + 1) % phrases.length;
      setTimeout(tick, 400);
    } else setTimeout(tick, del ? 45 : 90);
  }
  setTimeout(tick, 800);
})();

/* ── 4. Greeting ────────────────────────────────────────────── */
(function () {
  const el = document.getElementById("dynamic-greeting");
  if (!el) return;
  const h = new Date().getHours();
  el.textContent =
    h < 12
      ? "Good morning 🌤"
      : h < 17
        ? "Hello there 👋"
        : h < 21
          ? "Good evening 🌙"
          : "Late night coder? 🦉";
})();

/* ── 5. Navbar ──────────────────────────────────────────────── */
(function () {
  const nav = document.getElementById("navbar");
  let last = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    if (y > last + 5 && y > 120) nav.classList.add("nav-hidden");
    else if (y < last) nav.classList.remove("nav-hidden");
    last = y;
  });
  const btn = document.getElementById("hamburger"),
    links = document.getElementById("navLinks");
  btn.addEventListener("click", () => {
    links.classList.toggle("open");
    btn.classList.toggle("active");
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      btn.classList.remove("active");
    }),
  );
  const secs = document.querySelectorAll("section[id]"),
    navls = document.querySelectorAll(".nav-link");
  window.addEventListener("scroll", () => {
    let cur = "";
    secs.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 120) cur = s.id;
    });
    navls.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + cur),
    );
  });
})();

/* ── 6. Render Skills ───────────────────────────────────────── */
function renderSkills() {
  const grid = document.getElementById("skillsGrid");
  if (!grid) return;
  const saved = localStorage.getItem("portfolio_skills");
  const skills = saved ? JSON.parse(saved) : PORTFOLIO_DATA.skills;

  grid.innerHTML = skills
    .map(
      (g) => `
    <div class="skill-card">
      <div class="skill-icon">${g.icon}</div>
      <h3 class="skill-cat">${g.category}</h3>
      <ul class="skill-items">
        ${g.items.map((item) => `<li><span class="skill-pill">${item}</span></li>`).join("")}
      </ul>
    </div>
  `,
    )
    .join("");
}

/* ── 7. Render Projects ─────────────────────────────────────── */
function renderProjects(filter = "all") {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  const saved = localStorage.getItem("portfolio_projects");
  const all = saved ? JSON.parse(saved) : PORTFOLIO_DATA.projects;
  const list =
    filter === "all" ? all : all.filter((p) => p.category === filter);

  grid.innerHTML = list
    .map(
      (p, i) => `
    <a href="${p.url}" target="_blank" rel="noopener noreferrer"
       class="proj-card${p.featured ? " featured" : ""}">
      ${p.featured ? '<span class="featured-badge">Featured</span>' : ""}
      <div class="proj-number">${String(p.id).padStart(2, "0")}</div>
      <h3 class="proj-title">${p.title}</h3>
      <p class="proj-desc">${p.description}</p>
      <div class="proj-tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      <span class="proj-link">View Project ↗</span>
    </a>
  `,
    )
    .join("");
}

/* ── 8. Init (filter bar + bio + render) ────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  // Filter bar
  var bar = document.getElementById("filterBar");
  if (bar) {
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      bar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      renderProjects(btn.dataset.filter);
    });
  }

  // Apply saved bio
  var savedProfile = localStorage.getItem("portfolio_profile");
  if (savedProfile) {
    var p = JSON.parse(savedProfile);
    var bioEl = document.getElementById("hero-bio");
    if (bioEl && p.bio) bioEl.textContent = p.bio;
  }

  renderSkills();
  renderProjects("all");
});
