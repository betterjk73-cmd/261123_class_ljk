// MELLOW BEAN — 페이지 동작

document.addEventListener('DOMContentLoaded', () => {
  setupNavToggle();
  setupActiveNav();
  showOpenStatus();
  setInterval(showOpenStatus, 30 * 1000); // 30초마다 시간·상태 갱신
  document.getElementById('year').textContent = new Date().getFullYear();
});

// 모바일 메뉴 열고 닫기
function setupNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const label = toggle.querySelector('.sr-only');

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? '메뉴 닫기' : '메뉴 열기';
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));

  // 메뉴 바깥을 누르거나 Esc 키를 누르면 닫기
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // 태블릿을 돌리거나 창을 넓혀서 데스크톱 메뉴가 되면 열린 상태 초기화
  window.matchMedia('(min-width: 641px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

// 스크롤 위치에 따라 현재 섹션 메뉴 강조
function setupActiveNav() {
  const links = document.querySelectorAll('.site-nav a');
  const sections = [...links].map((link) => document.querySelector(link.getAttribute('href')));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => section && observer.observe(section));
}

// 영업시간 기준으로 "영업중 / 준비중" 스티커와 오늘 요일 표시
const HOURS = {
  weekday: { open: 10, close: 21 }, // 월~금
  weekend: { open: 11, close: 22 }, // 토·일
};

function isFirstMonday(date) {
  return date.getDay() === 1 && date.getDate() <= 7;
}

function showOpenStatus() {
  const now = new Date();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  const { open, close } = isWeekend ? HOURS.weekend : HOURS.weekday;
  const hour = now.getHours() + now.getMinutes() / 60;

  // 오늘 요일 행 강조
  document.querySelectorAll('.hours tr[data-days]').forEach((row) => {
    const days = row.dataset.days.split(',').map(Number);
    row.classList.toggle('is-today', days.includes(day));
  });

  let status;
  let closed = true;
  if (isFirstMonday(now)) {
    status = '오늘은<br>쉬어요';
  } else if (hour >= open && hour < close) {
    status = '지금<br>영업중';
    closed = false;
  } else {
    status = '지금은<br>준비중';
  }

  const sticker = document.getElementById('open-status');
  sticker.innerHTML =
    `<span class="sticker-date">${formatDate(now)}</span>` +
    `<span class="sticker-status">${status}</span>` +
    `<span class="sticker-time">${formatTime(now)}</span>`;
  sticker.classList.toggle('is-closed', closed);
}

// 11.25 (수)
function formatDate(date) {
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}.${date.getDate()} (${week[date.getDay()]})`;
}

// 20:45
function formatTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
