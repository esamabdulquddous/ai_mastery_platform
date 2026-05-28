const STORAGE_KEY = 'ai_mastery_v1';

let state = {
  lang: 'en',
  completed: {},
  currentPage: 'welcome',
  apiKey: '',
  chatHistory: []
};

const T = {
  en: {
    logoSub: 'From Zero to Creative Empire',
    progressLabel: 'Course Progress',
    chatBtn: 'Ask Claude',
    chatHeader: 'Claude — AI Assistant',
    apiLabel: 'Enter Anthropic API Key',
    apiNote: 'Your key stays only in your browser. Get it free from console.anthropic.com',
    apiStart: 'Start Chat',
    markDone: '✓ Mark as Complete',
    done: '✓ Completed',
    exercise: 'Practical Exercise',
    landscape: '🗺 Overview First'
  },
  ar: {
    logoSub: 'من الصفر إلى الإمبراطورية الإبداعية',
    progressLabel: 'التقدم في الدورة',
    chatBtn: 'اسأل كلود',
    chatHeader: 'كلود — المساعد الذكي',
    apiLabel: 'أدخل مفتاح Anthropic API',
    apiNote: 'مفتاحك يبقى في متصفحك فقط. احصل عليه مجاناً من console.anthropic.com',
    apiStart: 'ابدأ المحادثة',
    markDone: '✓ تحديد كمكتمل',
    done: '✓ مكتمل',
    exercise: 'تمرين عملي',
    landscape: '🗺 نظرة عامة أولاً'
  }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state = { ...state, ...saved, completed: { ...state.completed, ...(saved.completed || {}) }, chatHistory: Array.isArray(saved.chatHistory) ? saved.chatHistory : [] };
  } catch (err) { console.error('Failed to load state:', err); }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (err) { console.error('Failed to save state:', err); }
}

function totalSteps() {
  if (!Array.isArray(PHASES)) return 0;
  let count = 0;
  PHASES.forEach(phase => { if (Array.isArray(phase.steps)) count += phase.steps.length; });
  return count;
}

function completedCount() { return Object.values(state.completed).filter(Boolean).length; }

function progressPct() {
  const total = totalSteps();
  if (!total) return 0;
  return Math.round((completedCount() / total) * 100);
}

function updateProgress() {
  const pct = progressPct();
  const fill = document.getElementById('progress-fill');
  const pctText = document.getElementById('progress-pct');
  if (fill) fill.style.width = `${pct}%`;
  if (pctText) pctText.textContent = `${pct}%`;
  const dots = document.querySelectorAll('.milestone-dot');
  PHASES.forEach((ph, i) => {
    const phSteps = ph.steps.map(s => s.id);
    const phDone = phSteps.filter(id => state.completed[id]).length;
    if (dots[i]) {
      dots[i].classList.toggle('done', phDone === phSteps.length);
      dots[i].classList.toggle('active', phDone > 0 && phDone < phSteps.length);
    }
  });
}

function markComplete(stepId) {
  if (!stepId || state.completed[stepId]) return;
  state.completed[stepId] = true;
  saveState();
  updateProgress();
  if (typeof renderNav === 'function') renderNav();
  const btn = document.getElementById(`complete-btn-${stepId}`);
  if (btn) { btn.classList.add('done'); btn.textContent = T[state.lang].done; btn.disabled = true; }
  if (Array.isArray(PHASES)) {
    PHASES.forEach((phase, pi) => {
      if (!Array.isArray(phase.steps)) return;
      const inThisPhase = phase.steps.some(s => s.id === stepId);
      const allDone = phase.steps.every(s => state.completed[s.id]);
      if (inThisPhase && allDone) {
        const name = state.lang === 'ar' ? (phase.ar?.title || phase.en?.title) : (phase.en?.title || phase.ar?.title);
        showToast(`🎉 ${name} complete!`);
      }
    });
  }
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function navigateTo(pageId) {
  if (!pageId) return;
  state.currentPage = pageId;
  saveState();
  if (typeof renderNav === 'function') renderNav();
  if (typeof renderContent === 'function') renderContent(pageId);
  const contentArea = document.getElementById('content-area');
  if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) {
    if (pageId === 'welcome') {
      titleEl.textContent = state.lang === 'ar' ? 'الرئيسية' : 'Welcome';
    } else {
      let found = '';
      PHASES.forEach(ph => {
        if (`phase_${ph.id}` === pageId) found = state.lang === 'ar' ? (ph.ar?.title || ph.en?.title) : (ph.en?.title || ph.ar?.title);
        (ph.steps || []).forEach(step => {
          if (step.id === pageId) found = state.lang === 'ar' ? (step.ar?.title || step.en?.title) : (step.en?.title || step.ar?.title);
        });
      });
      titleEl.textContent = found || 'AI Mastery';
    }
  }
}

function setLang(lang) {
  if (!T[lang]) return;
  state.lang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('ar', lang === 'ar');
  const btnEn = document.getElementById('btn-en');
  const btnAr = document.getElementById('btn-ar');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (btnAr) btnAr.classList.toggle('active', lang === 'ar');
  const ids = {
    'logo-sub': 'logoSub',
    'progress-label-text': 'progressLabel',
    'chat-btn-label': 'chatBtn',
    'chat-header-text': 'chatHeader',
    'api-label-text': 'apiLabel',
    'api-note': 'apiNote',
    'api-start-btn': 'apiStart'
  };
  Object.entries(ids).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = T[lang][key];
  });
  saveState();
  if (typeof renderNav === 'function') renderNav();
  if (typeof renderContent === 'function') renderContent(state.currentPage);
}

window.navigateTo = navigateTo;
window.markComplete = markComplete;
window.setLang = setLang;
window.showToast = showToast;
window.updateProgress = updateProgress;

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  if (state.apiKey) {
    const apiSetup = document.getElementById('api-setup');
    const sendBtn = document.getElementById('send-btn');
    if (apiSetup) apiSetup.classList.add('hidden');
    if (sendBtn) sendBtn.disabled = false;
    window.chatReady = true;
  }
  setLang(state.lang);
  updateProgress();
  navigateTo(state.currentPage || 'welcome');
});
