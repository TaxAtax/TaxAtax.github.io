(function () {
  'use strict';

  const TOPBAR_OFFSET = 80;
  const mq = window.matchMedia('(max-width: 900px)');

  const content   = document.querySelector('.content');
  const navEl     = document.getElementById('sidebarNav');
  const sidebar   = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');

  const sections = Array.from(content.querySelectorAll('section[id]'));
  if (!sections.length) return;

  const linkMap = new Map();

  sections.forEach(section => {
    const a = document.createElement('a');
    a.href = '#' + section.id;
    a.textContent = section.dataset.title || section.id;
    a.addEventListener('click', closeDrawer);   // 移动端点击后收起
    navEl.appendChild(a);
    linkMap.set(section.id, a);
  });

  let activeId = null;
  let ticking = false;

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;

    linkMap.forEach((a, key) => a.classList.toggle('active', key === id));

    const link = linkMap.get(id);
    if (link && !mq.matches) {
      const box = sidebar.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      if (r.top < box.top || r.bottom > box.bottom) {
        link.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function updateActive() {
    let current = sections[0].id;

    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= TOPBAR_OFFSET) {
        current = sections[i].id;
      } else {
        break;
      }
    }

    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom) current = sections[sections.length - 1].id;

    setActive(current);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActive();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', updateActive);
  let backdrop = null;

  function openDrawer() {
    sidebar.classList.add('open');
    document.body.classList.add('nav-open');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'backdrop';
      backdrop.addEventListener('click', closeDrawer);
      document.body.appendChild(backdrop);
    }
    backdrop.classList.add('show');
  }

  function closeDrawer() {
    sidebar.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (backdrop) backdrop.classList.remove('show');
  }

  menuToggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  const onMqChange = e => { if (!e.matches) closeDrawer(); };
  if (mq.addEventListener) mq.addEventListener('change', onMqChange);
  else mq.addListener(onMqChange);
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // 回退方案：临时 textarea + execCommand
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  content.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '复制';

    btn.addEventListener('click', () => {
      const codeEl = pre.querySelector('code');
      const text = (codeEl || pre).textContent;

      copyText(text)
        .then(() => {
          btn.textContent = '已复制';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = '复制';
            btn.classList.remove('copied');
          }, 1600);
        })
        .catch(() => {
          btn.textContent = '复制失败';
          setTimeout(() => { btn.textContent = '复制'; }, 1600);
        });
    });

    pre.appendChild(btn);
  });

const dlBtn = document.querySelector('.download-btn');
if (dlBtn) {
  dlBtn.addEventListener('click', () => {
    const label = dlBtn.querySelector('span');
    const text = label.textContent;
    label.textContent = '开始下载…';
    setTimeout(() => { label.textContent = text; }, 1500);
  });
}
  updateActive();
})();