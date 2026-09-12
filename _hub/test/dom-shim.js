/* =========================================================
   DOM SHIM — mô phỏng trình duyệt tối thiểu (không cần thư viện)
   để chạy các script của trạm điều khiển trong Node và bắt lỗi
   runtime: parser HTML nhỏ, classList, sự kiện, canvas 2D giả,
   IntersectionObserver giả, requestAnimationFrame giả.
   ========================================================= */
'use strict';

const VOID_TAGS = new Set(['br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'canvas']);

function parseAttrs(str) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*"([^"]*)"|\s*=\s*'([^']*)'|\s*=\s*([^\s"'>]+))?/g;
  let m;
  while ((m = re.exec(str))) {
    const val = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : '';
    attrs[m[1].toLowerCase()] = val;
  }
  return attrs;
}

let UID = 0;

class El {
  constructor(tag) {
    this.tagName = String(tag || 'div').toUpperCase();
    this._uid = ++UID;
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
    this._text = '';
    this._html = '';
    this.listeners = {};
    this.style = {
      _p: {},
      setProperty(k, v) { this._p[k] = v; },
      removeProperty(k) { delete this._p[k]; },
      getPropertyValue(k) { return this._p[k] || ''; }
    };
    this._classList = new Set();
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.files = [];
    this.focused = false;
  }

  /* ---------- class ---------- */
  get classList() {
    const self = this;
    return {
      add(...c) { c.forEach((x) => self._classList.add(String(x))); self.attributes.class = [...self._classList].join(' '); },
      remove(...c) { c.forEach((x) => self._classList.delete(String(x))); self.attributes.class = [...self._classList].join(' '); },
      contains(c) { return self._classList.has(String(c)); },
      toggle(c, force) {
        const on = force === undefined ? !self._classList.has(String(c)) : !!force;
        if (on) this.add(c); else this.remove(c);
        return on;
      }
    };
  }
  get className() { return [...this._classList].join(' '); }
  set className(v) {
    this._classList = new Set(String(v).split(/\s+/).filter(Boolean));
    this.attributes.class = this.className;
  }

  /* ---------- thuộc tính ---------- */
  setAttribute(k, v) {
    this.attributes[String(k).toLowerCase()] = String(v);
    if (k === 'class') this.className = v;
    if (k === 'id') this.id = String(v);
  }
  getAttribute(k) {
    const key = String(k).toLowerCase();
    if (key === 'class') return this.className;
    return Object.prototype.hasOwnProperty.call(this.attributes, key) ? this.attributes[key] : null;
  }
  removeAttribute(k) { delete this.attributes[String(k).toLowerCase()]; }
  hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, String(k).toLowerCase()); }

  /* ---------- nội dung ---------- */
  get textContent() {
    if (this.children.length) return this.children.map((c) => c.textContent).join('') + this._text;
    return this._text;
  }
  set textContent(v) {
    this.children = [];
    this._html = '';
    this._text = String(v == null ? '' : v);
  }
  get innerHTML() { return this._html; }
  set innerHTML(v) {
    this._html = String(v == null ? '' : v);
    this.children = [];
    this._text = '';
    parseInto(this, this._html);
  }
  appendChild(child) {
    if (child && child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const i = this.children.indexOf(child);
    if (i >= 0) this.children.splice(i, 1);
    child.parentNode = null;
    return child;
  }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }

  /* ---------- truy vấn ---------- */
  descendants() {
    const out = [];
    const walk = (n) => { n.children.forEach((c) => { out.push(c); walk(c); }); };
    walk(this);
    return out;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  querySelectorAll(sel) {
    const parts = String(sel).split(',').map((s) => s.trim()).filter(Boolean);
    const all = this.descendants();
    const hit = new Set();
    let candidates = all.slice();
    parts.forEach((p) => {
      // hỗ trợ: 'a[href]', 'button:not([disabled])', '[data-x]', '#id', '.cls', 'tag',
      // và tổ hợp hậu duệ nhiều cấp: '#detail .detail-panel canvas'
      const tokens = p.split(/\s+/).filter(Boolean);
      if (!tokens.length) return;
      const last = tokens[tokens.length - 1];
      const ancestors = tokens.slice(0, -1);
      candidates = candidates.filter((el) => {
        if (!el._matchesSimple(last)) return false;
        let n = el.parentNode;
        // khớp các tổ tiên theo thứ tự ngược
        for (let a = ancestors.length - 1; a >= 0; a--) {
          let found = false;
          while (n) {
            if (n._matchesSelectorSet && n._matchesSelectorSet(ancestors[a])) { found = true; n = n.parentNode; break; }
            n = n.parentNode;
          }
          if (!found) return false;
        }
        return true;
      });
      candidates.forEach((el) => hit.add(el));
    });
    return all.filter((el) => hit.has(el));
  }
  _matchesSelectorSet(sel) {
    return String(sel).split(',').map((s) => s.trim()).some((s) => this._matchesSimple(s.split(/\s+/).pop()));
  }
  _matchesSimple(sel) {
    let s = String(sel || '').trim();
    if (!s) return false;
    const notMatch = /:not\(([^)]*)\)/.exec(s);
    if (notMatch) {
      const inner = notMatch[1];
      s = s.replace(notMatch[0], '');
      if (this._matchesSimple(inner)) return false;
    }
    s = s.replace(/:[a-zA-Z-]+(\([^)]*\))?/g, '');   // bỏ pseudo còn lại
    if (!s) return true;

    const tagM = /^[a-zA-Z][a-zA-Z0-9]*/.exec(s);
    if (tagM && this.tagName !== tagM[0].toUpperCase()) return false;

    const idM = /#([^.#\[]+)/.exec(s);
    if (idM && this.id !== idM[1]) return false;

    const cls = [...s.matchAll(/\.([^.#\[]+)/g)].map((m) => m[1]);
    for (const c of cls) if (!this._classList.has(c)) return false;

    const attrs = [...s.matchAll(/\[([^\]]+)\]/g)];
    for (const a of attrs) {
      const body = a[1];
      const eq = body.indexOf('=');
      const key = (eq < 0 ? body : body.slice(0, eq)).trim().replace(/^data-/, 'data-');
      if (eq < 0) { if (this.getAttribute(key) === null) return false; }
      else {
        const want = body.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (this.getAttribute(key) !== want) return false;
      }
    }
    return true;
  }
  closest(sel) {
    let n = this;
    while (n) { if (n._matchesSelectorSet && n._matchesSelectorSet(sel)) return n; n = n.parentNode; }
    return null;
  }
  contains(node) {
    let n = node;
    while (n) { if (n === this) return true; n = n.parentNode; }
    return false;
  }

  /* ---------- kích thước / hình vẽ ---------- */
  getBoundingClientRect() {
    return this._rect || { top: 0, left: 0, width: 320, height: 200, right: 320, bottom: 200 };
  }
  get clientWidth() { return this._rect ? this._rect.width : 320; }
  get clientHeight() { return this._rect ? this._rect.height : 200; }
  getContext(type) {
    if (type !== '2d') return null;
    if (!this._ctx) this._ctx = makeCtx();
    return this._ctx;
  }
  focus() { this.focused = true; global.document.activeElement = this; }
  blur() { this.focused = false; }
  scrollIntoView() {}
  click() {
    const ev = { type: 'click', target: this, relatedTarget: null, preventDefault() {}, stopPropagation() {} };
    if (this.listeners.click) this.listeners.click.slice().forEach((cb) => cb.call(this, ev));
    let n = this.parentNode;
    while (n) { if (n.listeners.click) n.listeners.click.slice().forEach((cb) => cb.call(n, ev)); n = n.parentNode; }
    if (global.document.listeners.click) global.document.listeners.click.slice().forEach((cb) => cb(ev));
  }

  /* ---------- sự kiện ---------- */
  addEventListener(type, cb) {
    (this.listeners[type] = this.listeners[type] || []).push(cb);
  }
  removeEventListener(type, cb) {
    const l = this.listeners[type];
    if (!l) return;
    const i = l.indexOf(cb);
    if (i >= 0) l.splice(i, 1);
  }
  dispatch(type, ev) {
    const e = Object.assign({ type, target: this, preventDefault() {}, stopPropagation() {} }, ev || {});
    if (this.listeners[type]) this.listeners[type].slice().forEach((cb) => cb.call(this, e));
    return e;
  }
}

/* ---------- parser HTML tối giản ---------- */
function parseInto(root, html) {
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let m;
  let cursor = 0;
  while ((m = re.exec(html))) {
    // văn bản nằm giữa thẻ trước và thẻ này
    if (m.index > cursor) {
      const text = html.slice(cursor, m.index);
      if (text) stack[stack.length - 1]._text += text;
    }
    cursor = re.lastIndex;
    if (m[0].startsWith('<!--')) continue;
    const isClose = m[0][1] === '/';
    const tag = m[1].toLowerCase();
    const selfClose = /\/\s*>$/.test(m[0]) || VOID_TAGS.has(tag);
    if (isClose) {
      for (let k = stack.length - 1; k > 0; k--) {
        if (stack[k].tagName === tag.toUpperCase()) { stack.length = k; break; }
      }
    } else {
      const el = new El(tag);
      const attrs = parseAttrs(m[2] || '');
      Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
      if (attrs.id) el.id = attrs.id;
      el._rect = null;
      stack[stack.length - 1].appendChild(el);
      if (!selfClose) stack.push(el);
    }
  }
}

/* ---------- canvas 2D giả ---------- */
function makeCtx() {
  const grad = () => ({ addColorStop() {} });
  const ctx = {
    canvas: null,
    setTransform() {}, resetTransform() {}, save() {}, restore() {},
    translate() {}, rotate() {}, scale() {},
    clearRect() {}, fillRect() {}, strokeRect() {},
    beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, arc() {}, ellipse() {},
    quadraticCurveTo() {}, bezierCurveTo() {}, rect() {},
    fill() {}, stroke() {}, fillText() {}, strokeText() {}, clip() {},
    createLinearGradient: grad, createRadialGradient: grad, createConicGradient: grad,
    measureText() { return { width: 10 }; },
    _props: {}
  };
  ['fillStyle', 'strokeStyle', 'lineWidth', 'font', 'textAlign', 'textBaseline',
   'globalAlpha', 'globalCompositeOperation', 'shadowBlur', 'shadowColor', 'lineCap'].forEach((p) => {
    Object.defineProperty(ctx, p, {
      get() { return ctx._props[p]; },
      set(v) { ctx._props[p] = v; }
    });
  });
  return ctx;
}

/* ---------- document ---------- */
class Doc extends El {
  constructor() { super('#document'); this.readyState = 'complete'; this.activeElement = null; }
  get documentElement() { return this._root || (this._root = new El('html')); }
  get body() { return this._body || (this._body = new El('body')); }
  getElementById(id) {
    return this.descendants().find((e) => e.id === id) || null;
  }
  createElement(tag) { return new El(tag); }
  createElementNS(ns, tag) { return new El(tag); }
  createTextNode(text) { const e = new El('#text'); e.textContent = text; return e; }
  createDocumentFragment() {
    const f = new El('#fragment');
    const origAppend = f.appendChild.bind(f);
    f.appendChild = (c) => { origAppend(c); return c; };
    return f;
  }
}

/* ---------- lắp đặt vào global ---------- */
function install(html) {
  const doc = new Doc();
  parseInto(doc.body, html);
  doc.appendChild(doc.body);

  const observers = [];
  class IO {
    constructor(cb, opts) { this.cb = cb; this.opts = opts || {}; this.targets = []; observers.push(this); }
    observe(el) { this.targets.push(el); }
    unobserve() {}
    disconnect() {}
    trigger() {
      const entries = this.targets.map((t) => ({
        target: t, isIntersecting: true, intersectionRatio: 1,
        boundingClientRect: t.getBoundingClientRect()
      }));
      if (entries.length) this.cb(entries, this);
    }
  }

  const win = {
    innerWidth: 1440, innerHeight: 900, devicePixelRatio: 2, pageYOffset: 0,
    matchMedia: (q) => ({
      matches: false,
      media: q,
      addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
    }),
    location: { href: 'http://localhost:8000/' },
    history: { replaceState() {} },
    _listeners: {},
    addEventListener(type, cb) { (this._listeners[type] = this._listeners[type] || []).push(cb); },
    removeEventListener(type, cb) {
      const l = this._listeners[type];
      if (!l) return;
      const i = l.indexOf(cb);
      if (i >= 0) l.splice(i, 1);
    },
    dispatch(type, ev) {
      const e = Object.assign({ type, preventDefault() {}, stopPropagation() {} }, ev || {});
      (this._listeners[type] || []).slice().forEach((cb) => cb(e));
      // sự kiện bàn phím trên window cũng tới document (giống trình duyệt thật)
      if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
        if (doc.listeners[type]) doc.listeners[type].slice().forEach((cb) => cb(e));
      }
      return e;
    },
    scrollTo() {}, performance: global.performance,
    IntersectionObserver: IO,
    requestAnimationFrame: (cb) => setTimeout(() => cb(global.performance.now()), 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
    getComputedStyle: () => ({ getPropertyValue: () => '0px' }),
    navigator: { deviceMemory: 8, hardwareConcurrency: 8 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    console
  };

  global.window = win;
  global.document = doc;
  try {
    Object.defineProperty(global, 'navigator', { value: win.navigator, configurable: true, writable: true });
  } catch (e) {
    globalThis.navigator = win.navigator;
  }
  global.matchMedia = win.matchMedia;
  global.IntersectionObserver = IO;
  global.requestAnimationFrame = win.requestAnimationFrame;
  global.cancelAnimationFrame = win.cancelAnimationFrame;
  global.sessionStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
  global.HTMLElement = El;
  global.performance = global.performance || { now: () => Date.now() };

  return { doc, win, observers };
}

module.exports = { El, install, makeCtx, parseInto };
