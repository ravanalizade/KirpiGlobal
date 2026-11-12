/* KirpiGlobal landing: formalar, paket dialoqu, yol gedən kirpi */
(function () {
  'use strict';

  // Google Apps Script "Web app" ünvanı. Quraşdırma: apps-script/QURAŞDIRMA.md
  var FORM_URL = '[FORM_URL]';

  var SEND_ERROR = 'Göndərmək alınmadı. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.';
  var SEND_TIMEOUT_MS = 20000;

  /* ---------- Nömrə ---------- */

  // "+994 50 123 45 67", "050 123 45 67", "501234567" -> "+994501234567"
  function parsePhone(raw) {
    var value = String(raw || '').trim();
    if (!value) return { error: 'Mobil nömrənizi yazın, məsələn 50 123 45 67.' };
    if (/[^\d\s()+.\-]/.test(value)) {
      return { error: 'Nömrədə yalnız rəqəm olmalıdır, məsələn 50 123 45 67.' };
    }
    var digits = value.replace(/\D/g, '');
    var international = value.charAt(0) === '+' || digits.indexOf('00') === 0;
    if (digits.indexOf('00994') === 0) digits = digits.slice(5);
    else if (digits.indexOf('994') === 0 && (international || digits.length >= 12)) digits = digits.slice(3);
    else if (international) {
      return { error: 'Azərbaycan nömrəsi yazın: +994 ilə başlamalıdır, məsələn +994 50 123 45 67.' };
    }
    // "050 123 45 67" və "+994 050 123 45 67": əvvəldəki 0 atılır
    if (digits.charAt(0) === '0' && digits.length === 10) digits = digits.slice(1);

    if (digits.length !== 9) {
      return { error: 'Nömrə 9 rəqəmdən ibarət olmalıdır, məsələn 50 123 45 67. Siz ' + digits.length + ' rəqəm yazmısınız.' };
    }
    if (digits.charAt(0) === '0') {
      return { error: 'Operator kodu 0 ilə başlaya bilməz. Nömrəni 50 123 45 67 kimi yazın.' };
    }
    return { value: '+994' + digits };
  }

  /* ---------- Formalar ---------- */

  function setFieldError(input, message) {
    var box = document.getElementById(input.id + '-err');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      box.textContent = message;
      box.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      box.textContent = '';
      box.hidden = true;
    }
  }

  // Sahələri yoxlayır. Hər şey düzdürsə göndəriləcək datanı, yoxsa null qaytarır.
  function readForm(form) {
    var data = { type: form.dataset.type, name: '', phone: '', target: '', package: '', website: '' };
    var firstBad = null;

    function check(input, message) {
      setFieldError(input, message);
      if (message && !firstBad) firstBad = input;
    }

    var name = form.elements.name;
    if (name) {
      data.name = name.value.trim().replace(/\s+/g, ' ');
      check(name, data.name.length < 2 ? 'Adınızı və soyadınızı yazın.' : '');
    }
    var target = form.elements.target;
    if (target) {
      data.target = target.value.trim().replace(/\s+/g, ' ');
      check(target, data.target.length < 2 ? 'Universitetin və ya ölkənin adını yazın, məsələn Almaniya.' : '');
    }
    var phone = parsePhone(form.elements.phone.value);
    check(form.elements.phone, phone.error || '');
    data.phone = phone.value || '';

    if (form.elements.package) data.package = form.elements.package.value;
    data.website = form.elements.website.value;

    if (firstBad) {
      firstBad.focus();
      return null;
    }
    return data;
  }

  function send(data) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, SEND_TIMEOUT_MS);
    // text/plain: brauzer CORS "preflight" sorğusu göndərmir, Apps Script isə mətni JSON kimi oxuyur.
    return fetch(FORM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
      redirect: 'follow',
      signal: controller.signal
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }).then(function (result) {
      if (!result || result.ok !== true) throw new Error((result && result.error) || 'Rədd edildi');
    }).finally(function () { clearTimeout(timer); });
  }

  function showDone(form) {
    var done = document.getElementById('done-template').content.firstElementChild.cloneNode(true);
    form.hidden = true;
    form.after(done);
    var dialog = form.closest('dialog');
    if (dialog) dialog.classList.add('dialog--done');
    done.querySelector('[data-done-back]').addEventListener('click', function (event) {
      if (dialog) {
        event.preventDefault();
        dialog.close();
      }
    });
    done.querySelector('.done__title').focus();
  }

  function setupForm(form) {
    var button = form.querySelector('button[type="submit"]');
    var label = button.textContent;
    var formError = form.querySelector('.form__err');
    var sending = false;

    form.addEventListener('input', function (event) {
      if (event.target.getAttribute('aria-invalid')) setFieldError(event.target, '');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (sending) return;
      formError.hidden = true;
      var data = readForm(form);
      if (!data) return;

      // Honeypot doludursa bu botdur: heç nə göndərmirik, amma bunu ona bildirmirik.
      if (data.website) { showDone(form); return; }

      sending = true;
      button.disabled = true;
      button.textContent = 'Göndərilir...';
      send(data).then(function () {
        showDone(form);
      }).catch(function () {
        // Sahələrə toxunmuruq: yazılanlar yerində qalır.
        formError.textContent = SEND_ERROR;
        formError.hidden = false;
      }).finally(function () {
        sending = false;
        button.disabled = false;
        button.textContent = label;
      });
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('form[data-type]'), setupForm);

  /* ---------- Paket dialoqu ---------- */

  var dialog = document.getElementById('package-dialog');
  var dialogForm = dialog.querySelector('form');
  var opener = null;

  function openDialog(button) {
    opener = button;
    // Əvvəlki uğurlu göndərişdən sonra yenidən açılırsa, formanı təzələ.
    var oldDone = dialog.querySelector('.done');
    if (oldDone) {
      oldDone.remove();
      dialogForm.reset();
      dialogForm.hidden = false;
      dialog.classList.remove('dialog--done');
    }
    dialogForm.elements.package.value = button.dataset.package;
    document.getElementById('chosen-package').textContent = button.dataset.package;
    dialog.showModal(); // fokusu içəridə saxlayır, Esc ilə bağlanır
    dialogForm.elements.name.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-package]'), function (button) {
    button.addEventListener('click', function () { openDialog(button); });
  });
  dialog.querySelector('[data-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close(); // kənardakı tünd fona klik
  });
  dialog.addEventListener('close', function () {
    if (opener) opener.focus();
    opener = null;
  });

  /* ---------- Yol gedən kirpi ---------- */

  var kirpi = document.getElementById('kirpi');
  var flipEl = document.getElementById('kirpi-flip');
  var legA = document.getElementById('kirpi-leg-a');
  var legB = document.getElementById('kirpi-leg-b');
  var cap = document.getElementById('kirpi-cap');
  var dock = document.getElementById('dock');
  var root = document.documentElement;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sideTrail = window.matchMedia('(min-width: 1360px)');

  var BASE_W = 150, BASE_H = 83; // formanın üstündəki yerin ölçüsü
  var DOCK_MS = 480, CAP_MS = 380, IDLE_MS = 140;

  var live = false;
  var frame = 0;
  var m = { vw: 0, vh: 0, max: 1, dockX: 0, dockY: 0 }; // ölçülər: yalnız resize zamanı yenilənir
  var scrollY = 0, lastY = 0, lastScrollAt = 0, lastTime = 0;
  var facing = 1;      // 1: irəli (sağa), -1: geri
  var blend = 0;       // 0: cığırda, 1: formanın üstündə
  var capDrop = 0;     // 0: papaq yoxdur, 1: başındadır
  var phase = 0;       // addım fazası

  function measure() {
    m.vw = root.clientWidth;
    m.vh = window.innerHeight;
    m.max = Math.max(1, root.scrollHeight - m.vh);
    var rect = dock.getBoundingClientRect();
    m.dockX = rect.left + window.scrollX;
    m.dockY = rect.top + window.scrollY;
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function render(now) {
    frame = 0;
    if (!live) return;
    var dt = Math.min(64, now - (lastTime || now));
    lastTime = now;

    var delta = scrollY - lastY;
    lastY = scrollY;
    var progress = Math.min(1, Math.max(0, scrollY / m.max));

    // Cığırdakı yer: scroll faizinə bağlıdır
    var scale, x, y, reserve;
    if (sideTrail.matches) {
      scale = 88 / BASE_W;
      var top = 96, bottom = 24;
      x = m.vw - 52 - 88 * 0.6;
      y = top + progress * (m.vh - top - bottom - BASE_H * scale);
      reserve = 0;
    } else {
      scale = 56 / BASE_W;
      x = 8 + progress * (m.vw - 16 - 56);
      y = m.vh - 9 - BASE_H * scale;
      reserve = 48;
    }

    // Formanın üstündəki yer ekranda tam görünürsə, kirpi ora keçir
    var dockX = m.dockX, dockY = m.dockY - scrollY;
    var atDock = dockY + BASE_H <= m.vh - reserve - 12;
    var blendTarget = atDock ? 1 : 0;
    var blending = blend !== blendTarget;
    if (blending) {
      var step = dt / DOCK_MS;
      blend = blendTarget ? Math.min(1, blend + step) : Math.max(0, blend - step);
    }
    var k = easeInOut(blend);
    var px = x + (dockX - x) * k;
    var py = y + (dockY - y) * k;
    var ps = scale + (1 - scale) * k;

    // İstiqamət: aşağı sürüşəndə irəli, yuxarı qayıdanda üzünü çevirir
    if (blend === 1) facing = 1;
    else if (blending && Math.abs(dockX - x) > 40) facing = (dockX > x) === (blendTarget === 1) ? 1 : -1;
    else if (delta > 0) facing = 1;
    else if (delta < 0) facing = -1;

    // Addım: yalnız hərəkət edəndə
    var moving = blending || now - lastScrollAt < IDLE_MS;
    if (delta) phase += Math.min(Math.abs(delta), 60) * 0.09;
    else if (blending) phase += dt * 0.022;
    var lift = moving ? Math.sin(phase) * 6 : 0;

    // Papaq: yerinə çatanda yuxarıdan düşür, geri qayıdanda çıxır
    var capTarget = blend === 1 ? 1 : 0;
    var capMoving = capDrop !== capTarget;
    if (capMoving) {
      var capStep = dt / CAP_MS;
      capDrop = capTarget ? Math.min(1, capDrop + capStep) : Math.max(0, capDrop - capStep * 2);
    }

    kirpi.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0) scale(' + ps.toFixed(4) + ')';
    flipEl.style.transform = facing < 0 ? 'scaleX(-1)' : 'none';
    legA.setAttribute('transform', 'translate(0 ' + (-Math.max(0, lift)).toFixed(1) + ')');
    legB.setAttribute('transform', 'translate(0 ' + (-Math.max(0, -lift)).toFixed(1) + ')');
    cap.setAttribute('visibility', capDrop > 0 ? 'visible' : 'hidden');
    cap.setAttribute('transform', 'translate(0 ' + (-(1 - capDrop * capDrop) * 150).toFixed(1) + ')');

    if (moving || capMoving) frame = requestAnimationFrame(render);
    else lastTime = 0; // dayandı: növbəti scroll-a qədər kadr istəmirik
  }

  function requestRender() {
    if (live && !frame) frame = requestAnimationFrame(render);
  }

  function onScroll() {
    // Scroll hadisəsində yalnız rəqəmi yadda saxlayırıq, işi requestAnimationFrame görür
    scrollY = window.scrollY;
    lastScrollAt = performance.now();
    requestRender();
  }

  function onResize() {
    if (!live) return;
    measure();
    requestRender();
  }

  function setLive(on) {
    if (on === live) return;
    live = on;
    root.classList.toggle('kirpi-live', on);
    if (on) {
      measure();
      scrollY = lastY = window.scrollY;
      // Səhifə artıq sonda açılıbsa, kirpi birbaşa yerində və papaqlı olsun
      blend = capDrop = (m.dockY - scrollY + BASE_H <= m.vh - (sideTrail.matches ? 0 : 48) - 12) ? 1 : 0;
      requestRender();
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  reduceMotion.addEventListener('change', function () { setLive(!reduceMotion.matches); });
  setLive(!reduceMotion.matches);
})();
