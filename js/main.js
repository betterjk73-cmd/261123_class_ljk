// 결혼식 날짜 (여기만 바꾸면 달력과 카운트다운이 함께 바뀝니다)
const WEDDING_DATE = new Date(2027, 3, 17, 12, 30); // 월은 0부터 시작 → 3 = 4월

document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  startCountdown();
  initFadeIn();
  initGallery();
  initAccordion();
  initCopyButtons();
  initShare();
});

/* -------------------------
   달력 그리기
   ------------------------- */
function renderCalendar() {
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const day = WEDDING_DATE.getDate();

  document.getElementById("calendarMonth").textContent = `${year}. ${String(month + 1).padStart(2, "0")}`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const body = document.getElementById("calendarBody");

  let html = "<tr>";
  for (let i = 0; i < firstDay; i++) html += "<td></td>";

  for (let date = 1; date <= lastDate; date++) {
    const weekday = (firstDay + date - 1) % 7;
    const classes = [];
    if (weekday === 0) classes.push("sun");
    if (weekday === 6) classes.push("sat");
    if (date === day) classes.push("is-day");

    html += `<td class="${classes.join(" ")}"><span>${date}</span></td>`;
    if (weekday === 6 && date !== lastDate) html += "</tr><tr>";
  }
  html += "</tr>";
  body.innerHTML = html;
}

/* -------------------------
   D-day 카운트다운
   ------------------------- */
function startCountdown() {
  const els = {
    days: document.getElementById("cdDays"),
    hours: document.getElementById("cdHours"),
    minutes: document.getElementById("cdMinutes"),
    seconds: document.getElementById("cdSeconds"),
    text: document.getElementById("countdownText"),
  };

  function update() {
    const diff = WEDDING_DATE - new Date();

    if (diff <= 0) {
      els.days.textContent = els.hours.textContent = els.minutes.textContent = els.seconds.textContent = 0;
      els.text.innerHTML = "민준 ♥ 서연, <em>결혼했습니다</em>";
      return;
    }

    const days = Math.floor(diff / 86400000);
    els.days.textContent = days;
    els.hours.textContent = Math.floor((diff / 3600000) % 24);
    els.minutes.textContent = Math.floor((diff / 60000) % 60);
    els.seconds.textContent = Math.floor((diff / 1000) % 60);
    els.text.innerHTML = `민준 ♥ 서연의 결혼식이 <em>${days + 1}일</em> 남았습니다`;
  }

  update();
  setInterval(update, 1000);
}

/* -------------------------
   스크롤 시 섹션 서서히 등장
   ------------------------- */
function initFadeIn() {
  const targets = document.querySelectorAll(".fade-in");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* -------------------------
   갤러리 라이트박스
   ------------------------- */
function initGallery() {
  const items = [...document.querySelectorAll(".gallery__item")];
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightboxImage");
  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    // 실제 사진을 쓸 때는 이 부분을 <img> 로 바꾸면 됩니다
    image.style.background = getComputedStyle(item).backgroundImage;
    image.querySelector("span").textContent = item.textContent.trim();
  }

  function open(index) {
    show(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  items.forEach((item, i) => item.addEventListener("click", () => open(i)));
  lightbox.querySelector(".lightbox__close").addEventListener("click", close);
  lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox__nav--next").addEventListener("click", () => show(current + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}

/* -------------------------
   계좌번호 아코디언
   ------------------------- */
function initAccordion() {
  document.querySelectorAll(".accordion__head").forEach((head) => {
    head.addEventListener("click", () => {
      const body = head.nextElementSibling;
      const isOpen = head.getAttribute("aria-expanded") === "true";

      head.setAttribute("aria-expanded", String(!isOpen));
      body.style.maxHeight = isOpen ? null : body.scrollHeight + "px";
    });
  });
}

/* -------------------------
   복사 기능 + 토스트
   ------------------------- */
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // file:// 로 열었을 때 등 clipboard API를 못 쓰는 경우 대비
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  return Promise.resolve();
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-show"), 2000);
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      copyText(btn.dataset.copy)
        .then(() => showToast("복사되었습니다"))
        .catch(() => showToast("복사에 실패했습니다"));
    });
  });
}

function initShare() {
  document.getElementById("shareBtn").addEventListener("click", () => {
    copyText(location.href)
      .then(() => showToast("청첩장 링크가 복사되었습니다"))
      .catch(() => showToast("복사에 실패했습니다"));
  });
}
