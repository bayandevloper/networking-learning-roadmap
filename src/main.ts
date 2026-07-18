import "./style.css";
import { phases, faqs, githubProfile } from "./data";

const app = document.querySelector<HTMLDivElement>("#app");

const STORAGE_KEY = "networking-roadmap-progress-v1";

type ProgressState = Record<string, { lesson: boolean; project: boolean }>;

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore (private mode / storage disabled)
  }
}

let progress: ProgressState = loadProgress();

function lessonKey(phaseNum: number, idx: number) {
  return `${phaseNum}-${idx}`;
}

function getEntry(key: string) {
  return progress[key] ?? { lesson: false, project: false };
}

function setEntry(key: string, patch: Partial<{ lesson: boolean; project: boolean }>) {
  progress[key] = { ...getEntry(key), ...patch };
  saveProgress(progress);
}

function totalStats() {
  const totalLessons = phases.reduce((sum, p) => sum + p.lessons.length, 0);
  const totalProjects = totalLessons; // one project per lesson
  return { totalPhases: phases.length, totalLessons, totalProjects };
}

function overallProgress() {
  const stats = totalStats();
  let doneLessons = 0;
  let doneProjects = 0;
  phases.forEach((phase) => {
    phase.lessons.forEach((_, idx) => {
      const e = getEntry(lessonKey(phase.number, idx));
      if (e.lesson) doneLessons++;
      if (e.project) doneProjects++;
    });
  });
  const totalUnits = stats.totalLessons + stats.totalProjects;
  const doneUnits = doneLessons + doneProjects;
  const pct = totalUnits ? Math.round((doneUnits / totalUnits) * 100) : 0;
  return { doneLessons, doneProjects, pct, ...stats };
}

function phaseProgress(phase: (typeof phases)[number]) {
  let doneLessons = 0;
  let doneProjects = 0;
  phase.lessons.forEach((_, idx) => {
    const e = getEntry(lessonKey(phase.number, idx));
    if (e.lesson) doneLessons++;
    if (e.project) doneProjects++;
  });
  const total = phase.lessons.length * 2;
  const done = doneLessons + doneProjects;
  return { pct: total ? Math.round((done / total) * 100) : 0 };
}

function renderResources(resources: { label: string; url: string }[]) {
  if (!resources.length) return "";
  return `
    <div class="lesson-resources">
      <h4>📚 مصادر تعلّم مجانية</h4>
      <ul>
        ${resources
          .map((r) => `<li><a href="${r.url}" target="_blank" rel="noopener">${r.label}</a></li>`)
          .join("")}
      </ul>
    </div>
  `;
}

function renderLesson(
  lesson: (typeof phases)[number]["lessons"][number],
  idx: number,
  phaseNum: number
) {
  const key = lessonKey(phaseNum, idx);
  const entry = getEntry(key);
  return `
    <div class="lesson" data-idx="${idx}">
      <button class="lesson-toggle" type="button" aria-expanded="false">
        <span class="lesson-num">${idx + 1}</span>
        <span class="lesson-title">${lesson.title}</span>
        ${entry.lesson && entry.project ? '<span class="done-badge">✓ مكتمل</span>' : ""}
        <span class="chevron">˅</span>
      </button>
      <div class="lesson-body">
        <p class="lesson-summary">${lesson.summary}</p>
        <div class="lesson-full">
          <p>${lesson.fullContent}</p>
        </div>
        <div class="lesson-topics">
          <h4>ماذا ستتعلم</h4>
          <ul>${lesson.topics.map((t) => `<li>${t}</li>`).join("")}</ul>
        </div>
        ${renderResources(lesson.resources)}
        <div class="lesson-project">
          <h4>🛠️ المشروع التطبيقي: ${lesson.project.title}</h4>
          <p>${lesson.project.description}</p>
          <p class="deliverable"><strong>ماذا تسلّم؟</strong> ${lesson.project.deliverable}</p>
          ${
            lesson.tools
              ? `<div class="tools">${lesson.tools.map((t) => `<span class="tool-badge">${t}</span>`).join("")}</div>`
              : ""
          }
        </div>
        <div class="progress-checks">
          <label class="check-item">
            <input type="checkbox" class="mark-lesson" data-key="${key}" ${entry.lesson ? "checked" : ""} />
            أنهيت الدرس
          </label>
          <label class="check-item">
            <input type="checkbox" class="mark-project" data-key="${key}" ${entry.project ? "checked" : ""} />
            أنهيت المشروع
          </label>
        </div>
      </div>
    </div>
  `;
}

function renderPhase(phase: (typeof phases)[number]) {
  const prog = phaseProgress(phase);
  return `
    <section class="phase" id="phase-${phase.number}">
      <div class="phase-image-wrap">
        <img class="phase-image" src="${phase.image}" alt="${phase.title}" loading="lazy" />
      </div>
      <div class="phase-header">
        <div class="phase-badge">${phase.number}</div>
        <div class="phase-header-text">
          <h2>${phase.title}</h2>
          <p class="phase-intro">${phase.intro}</p>
          <div class="phase-progress-bar">
            <div class="phase-progress-fill" style="width:${prog.pct}%"></div>
          </div>
          <span class="phase-progress-label">${prog.pct}% مكتمل</span>
        </div>
      </div>
      <div class="lessons">
        ${phase.lessons.map((l, i) => renderLesson(l, i, phase.number)).join("")}
      </div>
    </section>
  `;
}

function renderNav() {
  return `
    <nav class="roadmap-nav">
      ${phases
        .map(
          (p) =>
            `<a href="#phase-${p.number}"><span class="nav-num">${p.number}</span>${p.title}</a>`
        )
        .join("")}
    </nav>
  `;
}

function renderFaqs() {
  return `
    <section class="faqs">
      <h2>أسئلة شائعة</h2>
      <div class="faq-list">
        ${faqs
          .map(
            (f, i) => `
          <div class="faq-item" data-idx="${i}">
            <button class="faq-toggle" type="button" aria-expanded="false">
              <span>${f.q}</span><span class="chevron">˅</span>
            </button>
            <div class="faq-answer"><p>${f.a}</p></div>
          </div>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderPortfolioCta() {
  return `
    <section class="portfolio-cta">
      <h2>معرض أعمالك جاهز على GitHub</h2>
      <p>
        وثّق كل مشروع تنجزه في مستودع منفصل على حسابك، مع ملف README يشرح المشكلة
        والحل والنتيجة — هذا ما يراه صاحب العمل فعليًا.
      </p>
      <a href="${githubProfile.url}" target="_blank" rel="noopener" class="cta-button secondary">
        عرض حساب GitHub: ${githubProfile.username} ↗
      </a>
    </section>
  `;
}

function render() {
  if (!app) return;
  const stats = totalStats();
  const overall = overallProgress();

  app.innerHTML = `
    <header class="hero">
      <div class="hero-inner">
        <p class="eyebrow">خريطة طريق مجانية</p>
        <h1>تعلّم الشبكات عبر مشاريع تطبيقية حقيقية</h1>
        <p class="hero-sub">
          مسار متكامل لتعلّم Networking من الصفر حتى الاحتراف، حيث كل درس مرتبط
          بمشروع عملي واحد يمنحك خبرة حقيقية تُضاف إلى معرض أعمالك — لا نظريات فقط.
        </p>
        <div class="hero-stats">
          <div class="stat"><strong>${stats.totalPhases}</strong><span>مراحل</span></div>
          <div class="stat"><strong>${stats.totalLessons}</strong><span>درسًا</span></div>
          <div class="stat"><strong>${stats.totalProjects}</strong><span>مشروعًا تطبيقيًا</span></div>
        </div>
        <div class="overall-progress">
          <div class="overall-progress-bar">
            <div class="overall-progress-fill" style="width:${overall.pct}%"></div>
          </div>
          <span class="overall-progress-label" id="overall-progress-label">تقدّمك: ${overall.pct}%</span>
        </div>
        <a href="#phase-1" class="cta-button">ابدأ المسار الآن ↓</a>
      </div>
    </header>

    <main class="container">
      <div class="intro-block">
        <h2>كيف تعمل هذه الخريطة؟</h2>
        <p>
          كل مرحلة أدناه تضم مجموعة دروس، كل درس فيه شرح كامل، مصادر تعلّم مجانية،
          ومشروع تطبيقي محدد المخرجات. أنجز المشاريع بالترتيب، وأشّر ما أنهيته —
          تقدّمك يُحفظ في متصفحك تلقائيًا، وستُشكّل هذه المشاريع معرض أعمالك في النهاية.
        </p>
      </div>

      ${renderNav()}

      <div class="phases">
        ${phases.map(renderPhase).join("")}
      </div>

      ${renderPortfolioCta()}

      ${renderFaqs()}

      <section class="closing">
        <h2>جاهز تبني خبرتك الحقيقية؟</h2>
        <p>ابدأ من المرحلة الأولى، وأنجز مشروعًا تلو الآخر — كل مشروع خطوة أقرب لسوق العمل.</p>
        <a href="#phase-1" class="cta-button">عودة إلى المرحلة الأولى</a>
      </section>
    </main>

    <footer class="site-footer">
      <p>خريطة طريق تعلم الشبكات — مصدر مفتوح للتعلّم الذاتي بالمشاريع التطبيقية.</p>
      <p><a href="${githubProfile.url}" target="_blank" rel="noopener">GitHub: ${githubProfile.username}</a></p>
    </footer>
  `;

  app.querySelectorAll<HTMLButtonElement>(".lesson-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lesson = btn.closest(".lesson");
      const isOpen = lesson?.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(!!isOpen));
    });
  });

  app.querySelectorAll<HTMLButtonElement>(".faq-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item?.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(!!isOpen));
    });
  });

  function refreshProgressUI() {
    const newOverall = overallProgress();
    const overallFill = app!.querySelector<HTMLElement>(".overall-progress-fill");
    const overallLabel = app!.querySelector<HTMLElement>("#overall-progress-label");
    if (overallFill) overallFill.style.width = `${newOverall.pct}%`;
    if (overallLabel) overallLabel.textContent = `تقدّمك: ${newOverall.pct}%`;

    phases.forEach((phase) => {
      const section = app!.querySelector(`#phase-${phase.number}`);
      if (!section) return;
      const prog = phaseProgress(phase);
      const fill = section.querySelector<HTMLElement>(".phase-progress-fill");
      const label = section.querySelector<HTMLElement>(".phase-progress-label");
      if (fill) fill.style.width = `${prog.pct}%`;
      if (label) label.textContent = `${prog.pct}% مكتمل`;
    });
  }

  app.querySelectorAll<HTMLInputElement>(".mark-lesson").forEach((cb) => {
    cb.addEventListener("change", () => {
      setEntry(cb.dataset.key!, { lesson: cb.checked });
      refreshProgressUI();
      const lessonEl = cb.closest(".lesson");
      const badge = lessonEl?.querySelector(".done-badge");
      const entry = getEntry(cb.dataset.key!);
      if (entry.lesson && entry.project && !badge) {
        lessonEl?.querySelector(".lesson-title")?.insertAdjacentHTML(
          "afterend",
          '<span class="done-badge">✓ مكتمل</span>'
        );
      } else if ((!entry.lesson || !entry.project) && badge) {
        badge.remove();
      }
    });
  });

  app.querySelectorAll<HTMLInputElement>(".mark-project").forEach((cb) => {
    cb.addEventListener("change", () => {
      setEntry(cb.dataset.key!, { project: cb.checked });
      refreshProgressUI();
      const lessonEl = cb.closest(".lesson");
      const badge = lessonEl?.querySelector(".done-badge");
      const entry = getEntry(cb.dataset.key!);
      if (entry.lesson && entry.project && !badge) {
        lessonEl?.querySelector(".lesson-title")?.insertAdjacentHTML(
          "afterend",
          '<span class="done-badge">✓ مكتمل</span>'
        );
      } else if ((!entry.lesson || !entry.project) && badge) {
        badge.remove();
      }
    });
  });
}

render();
