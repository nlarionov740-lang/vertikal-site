(() => {
  // Стена на первом экране: ряды укладываются снизу вверх, последним встаёт оранжевый блок
  const wall = document.getElementById('wall');
  if (wall) {
    const small = matchMedia('(max-width:860px)').matches;
    const counts = small ? [2, 3, 5, 6] : [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4];
    const total = counts.length;
    counts.forEach((n, r) => {
      const row = document.createElement('div');
      row.className = 'row';
      const fromBottom = total - 1 - r;
      const brick = (cls, x) => {
        const b = document.createElement('i');
        b.className = cls;
        b.style.setProperty('--d', (fromBottom * 75 + x * 18) + 'ms');
        row.appendChild(b);
      };
      if (r === 0) brick('last', 0);
      // Перевязка швов: чётные ряды заканчиваются половинкой блока
      for (let i = 0; i < n; i++) brick(i % 3 === 1 ? 'alt' : '', i);
      if (fromBottom % 2 === 1) brick('half', n);
      wall.appendChild(row);
    });
    // Самый верхний оранжевый блок ложится последним
    const last = wall.querySelector('.last');
    if (last) last.style.setProperty('--d', (total * 75 + 260) + 'ms');
  }

  // Отвес
  const plumb = document.querySelector('.plumb');
  if (plumb && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let queued = false;
    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      plumb.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    };
    const ask = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
    update();
  } else if (plumb) {
    plumb.hidden = true;
  }

  // Меню на телефоне
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  if (btn && nav) {
    const set = (open) => {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Закрыть' : 'Меню';
    };
    btn.addEventListener('click', () => set(!nav.classList.contains('open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  }

  // Виды работ: открыт один
  const works = [...document.querySelectorAll('.work')];
  works.forEach((w) => {
    w.querySelector('button').addEventListener('click', () => {
      works.forEach((o) => {
        const on = o === w;
        o.classList.toggle('is-open', on);
        o.querySelector('button').setAttribute('aria-expanded', String(on));
      });
    });
  });

  // Заявка по шагам
  const form = document.getElementById('form');
  if (!form) return;
  const steps = [...form.querySelectorAll('.step')];
  const marks = [...form.querySelectorAll('.progress li')];
  const back = document.getElementById('back');
  const next = document.getElementById('next');
  const send = document.getElementById('send');
  const status = document.getElementById('status');
  let cur = 0;

  const err = (id, bad) => { document.getElementById(id).hidden = !bad; return !bad; };
  const checks = [
    () => err('err-work', !form.querySelector('[name=work]:checked')),
    () => err('err-city', !form.city.value.trim()),
    () => {
      const a = err('err-name', !form.name.value.trim());
      const b = err('err-phone', form.phone.value.replace(/\D/g, '').length < 10);
      const c = err('err-consent', !form.consent.checked);
      return a && b && c;
    },
  ];
  const show = (i) => {
    cur = i;
    steps.forEach((s, n) => { s.hidden = n !== i; });
    marks.forEach((m, n) => m.classList.toggle('on', n <= i));
    back.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    send.hidden = i !== steps.length - 1;
    status.hidden = true;
  };
  next.addEventListener('click', () => { if (checks[cur]()) show(cur + 1); });
  back.addEventListener('click', () => show(cur - 1));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checks[2]()) return;
    // Адресат заявок ещё не выбран, поэтому честно сообщаем, что ничего не ушло (см. TASKS.md)
    status.innerHTML = 'Заявка не отправлена: форма пока не подключена. Позвоните по номеру <a href="tel:+79504511611">+7 950 451-16-11</a> или напишите на <a href="mailto:gk_vertikal59@mail.ru">gk_vertikal59@mail.ru</a>.';
    status.hidden = false;
  });
})();
