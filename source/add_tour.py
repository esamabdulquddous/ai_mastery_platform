#!/usr/bin/env python3
"""Inject onboarding tour CSS + JS into ai_mastery_final.html"""
import re, sys

SRC = r'E:\Esam\AI learning platform project\ai_mastery_blocks_1\source\ai_mastery_final.html'

with open(SRC, encoding='utf-8') as f:
    html = f.read()

# ── 1. CSS ────────────────────────────────────────────────────────────────
TOUR_CSS = """
/* ── Onboarding Tour ─────────────────────────── */
.tour-overlay {
  position: fixed; inset: 0; z-index: 9000;
  pointer-events: none;
}
.tour-highlight {
  position: fixed; z-index: 9001; border-radius: 10px;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.60);
  pointer-events: none;
  transition: all 0.35s cubic-bezier(.4,0,.2,1);
}
.tour-tooltip {
  position: fixed; z-index: 9002;
  background: var(--bg-card, #fff);
  color: var(--text-primary, #1a1a2e);
  border: 2px solid var(--accent, #6c63ff);
  border-radius: 14px;
  padding: 16px 18px 14px;
  width: 260px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.28);
  font-family: inherit;
  animation: tourFadeIn 0.25s ease;
}
@keyframes tourFadeIn {
  from { opacity:0; transform: translateY(6px); }
  to   { opacity:1; transform: translateY(0); }
}
.tour-tooltip-title {
  font-size: 14px; font-weight: 700;
  margin-bottom: 7px; color: var(--accent, #6c63ff);
}
.tour-tooltip-body {
  font-size: 13px; line-height: 1.55;
  margin-bottom: 14px;
  color: var(--text-primary, #1a1a2e);
}
.tour-tooltip-footer {
  display: flex; align-items: center; justify-content: space-between;
}
.tour-dots {
  display: flex; gap: 5px;
}
.tour-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--text-muted, #aaa);
  transition: background 0.2s;
}
.tour-dot.active { background: var(--accent, #6c63ff); }
.tour-btn-row {
  display: flex; gap: 8px;
}
.tour-skip-btn {
  font-size: 11px; background: none; border: none;
  color: var(--text-muted, #aaa); cursor: pointer;
  padding: 4px 6px; border-radius: 6px;
  font-family: inherit;
}
.tour-skip-btn:hover { color: var(--text-primary, #333); }
.tour-next-btn {
  font-size: 12px; font-weight: 600;
  background: var(--accent, #6c63ff); color: #fff;
  border: none; border-radius: 8px;
  padding: 6px 14px; cursor: pointer;
  font-family: inherit;
}
.tour-next-btn:hover { opacity: 0.88; }
"""

# Inject before </style>
if TOUR_CSS.strip() in html:
    print("Tour CSS already present, skipping CSS injection.")
else:
    html = html.replace('</style>', TOUR_CSS + '\n</style>', 1)
    print("Tour CSS injected.")

# ── 2. JS ─────────────────────────────────────────────────────────────────
TOUR_JS = r"""
/* ── Onboarding Tour ─────────────────────────── */
(function() {
  const TOUR_KEY = 'ai_mastery_toured';

  const STEPS_EN = [
    {
      target: 'settings-btn',
      title: 'Settings',
      body: 'Tap here to open the Settings panel — choose your AI provider, font size, and theme.',
      action: () => { if (!document.getElementById('settings-panel').classList.contains('open')) toggleSettings(); }
    },
    {
      target: 'settings-panel',
      title: 'Choose your AI Provider',
      body: 'Pick Claude, ChatGPT, or Gemini. Each needs its own API key — all free tiers available!',
      action: null
    },
    {
      target: 'chat-toggle',
      title: 'AI Assistant',
      body: 'Click this button to open the chat panel. Your AI assistant will answer questions about any lesson you\'re viewing.',
      action: () => { if (document.getElementById('settings-panel').classList.contains('open')) toggleSettings(); }
    },
    {
      target: 'progress-fill',
      title: 'Your Progress',
      body: 'This bar fills as you complete steps. You can see your percentage and phase milestones below it.',
      action: null
    },
    {
      target: 'main-nav',
      title: 'Course Navigation',
      body: 'Browse all 5 phases and their steps here. Click any step to jump straight to it. Good luck! 🚀',
      action: null
    }
  ];

  const STEPS_AR = [
    {
      target: 'settings-btn',
      title: 'الإعدادات',
      body: 'اضغط هنا لفتح لوحة الإعدادات — اختر مزود الذكاء الاصطناعي وحجم الخط والمظهر.',
      action: () => { if (!document.getElementById('settings-panel').classList.contains('open')) toggleSettings(); }
    },
    {
      target: 'settings-panel',
      title: 'اختر مزود الذكاء الاصطناعي',
      body: 'اختر بين Claude أو ChatGPT أو Gemini. كل منها يحتاج مفتاح API خاص به.',
      action: null
    },
    {
      target: 'chat-toggle',
      title: 'المساعد الذكي',
      body: 'اضغط هنا لفتح لوحة الدردشة. يمكن للمساعد الإجابة عن أي سؤال حول الدرس الذي تشاهده.',
      action: () => { if (document.getElementById('settings-panel').classList.contains('open')) toggleSettings(); }
    },
    {
      target: 'progress-fill',
      title: 'تقدّمك في الكورس',
      body: 'يمتلئ هذا الشريط كلما أكملت خطوة. يمكنك رؤية النسبة المئوية وعلامات المراحل أسفله.',
      action: null
    },
    {
      target: 'main-nav',
      title: 'التنقل في الكورس',
      body: 'تصفّح المراحل الخمس وخطواتها من هنا. اضغط على أي خطوة للانتقال إليها مباشرة. حظًا موفقًا! 🚀',
      action: null
    }
  ];

  let tourStep = 0;
  let highlightEl = null;
  let tooltipEl = null;

  function getSteps() {
    try { return (typeof state !== 'undefined' && state.lang === 'ar') ? STEPS_AR : STEPS_EN; }
    catch(e) { return STEPS_EN; }
  }

  function pad(rect, p) {
    return { top: rect.top - p, left: rect.left - p,
             width: rect.width + p*2, height: rect.height + p*2 };
  }

  function placeTooltip(rect) {
    const TW = 268, TH = 170, margin = 12;
    const vw = window.innerWidth, vh = window.innerHeight;
    let top, left;
    // Try below
    if (rect.top + rect.height + TH + margin < vh) {
      top = rect.top + rect.height + margin;
    } else {
      top = rect.top - TH - margin;
    }
    // Horizontal: center on target, clamp to viewport
    left = rect.left + rect.width / 2 - TW / 2;
    left = Math.max(margin, Math.min(left, vw - TW - margin));
    top  = Math.max(margin, Math.min(top, vh - TH - margin));
    tooltipEl.style.top  = top  + 'px';
    tooltipEl.style.left = left + 'px';
  }

  function showStep(idx) {
    const steps = getSteps();
    if (idx >= steps.length) { endTour(); return; }
    const step = steps[idx];
    const targetEl = document.getElementById(step.target);
    if (!targetEl) { showStep(idx + 1); return; }

    if (step.action) step.action();

    // Give DOM time to update after action (e.g. panel open)
    setTimeout(function() {
      const rect = targetEl.getBoundingClientRect();
      const padded = pad(rect, 6);

      // Highlight ring
      if (!highlightEl) {
        highlightEl = document.createElement('div');
        highlightEl.className = 'tour-highlight';
        document.body.appendChild(highlightEl);
      }
      highlightEl.style.top    = padded.top    + window.scrollY + 'px';
      highlightEl.style.left   = padded.left   + window.scrollX + 'px';
      highlightEl.style.width  = padded.width  + 'px';
      highlightEl.style.height = padded.height + 'px';

      // Tooltip
      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tour-tooltip';
        document.body.appendChild(tooltipEl);
      }
      const isLast = (idx === steps.length - 1);
      const isAr = (typeof state !== 'undefined' && state.lang === 'ar');
      tooltipEl.innerHTML =
        '<div class="tour-tooltip-title">' + step.title + '</div>' +
        '<div class="tour-tooltip-body">'  + step.body  + '</div>' +
        '<div class="tour-tooltip-footer">' +
          '<div class="tour-dots">' +
            steps.map(function(_,i){ return '<div class="tour-dot' + (i===idx?' active':'') + '"></div>'; }).join('') +
          '</div>' +
          '<div class="tour-btn-row">' +
            '<button class="tour-skip-btn" onclick="window._tourSkip()">' + (isAr?'تخطّ':'Skip') + '</button>' +
            '<button class="tour-next-btn" onclick="window._tourNext()">' +
              (isLast ? (isAr?'ابدأ! 🚀':'Start! 🚀') : (isAr?'التالي ›':'Next ›')) +
            '</button>' +
          '</div>' +
        '</div>';

      placeTooltip({ top: padded.top, left: padded.left, width: padded.width, height: padded.height });
    }, step.action ? 280 : 0);
  }

  function endTour() {
    if (highlightEl) { highlightEl.remove(); highlightEl = null; }
    if (tooltipEl)   { tooltipEl.remove();   tooltipEl   = null; }
    // Close settings panel if still open from tour
    try {
      const sp = document.getElementById('settings-panel');
      if (sp && sp.classList.contains('open')) toggleSettings();
    } catch(e) {}
    try { localStorage.setItem(TOUR_KEY, '1'); } catch(e) {}
  }

  window._tourNext = function() {
    tourStep++;
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
    showStep(tourStep);
  };
  window._tourSkip = endTour;

  function startTour() {
    tourStep = 0;
    showStep(0);
  }

  // Auto-start for first-time visitors after app init
  window._startOnboardingTour = function() {
    try {
      if (localStorage.getItem(TOUR_KEY)) return;
    } catch(e) {}
    // Delay so the app fully renders
    setTimeout(startTour, 900);
  };
})();
"""

# Check if already injected
if '_startOnboardingTour' in html:
    print("Tour JS already present, skipping JS injection.")
else:
    # Inject just before closing </script> of the last big script block
    # We'll insert right before the last </script> tag
    idx = html.rfind('</script>')
    if idx == -1:
        print("ERROR: could not find </script>")
        sys.exit(1)
    html = html[:idx] + TOUR_JS + '\n' + html[idx:]
    print("Tour JS injected.")

# ── 3. Call _startOnboardingTour after loadState() / initApp ─────────────
# Find the DOMContentLoaded block that calls loadState() and add the call after it
# Pattern: loadState(); followed soon by applySettings(); and renderNav();
# We'll add it right after the last call to applySettings() in the DOMContentLoaded block

TRIGGER_OLD = 'applySettings();\n    renderNav();'
TRIGGER_NEW = 'applySettings();\n    renderNav();\n    if (window._startOnboardingTour) _startOnboardingTour();'

if 'if (window._startOnboardingTour) _startOnboardingTour();' in html:
    print("Tour trigger already present.")
elif TRIGGER_OLD in html:
    html = html.replace(TRIGGER_OLD, TRIGGER_NEW, 1)
    print("Tour trigger injected after applySettings/renderNav.")
else:
    print("WARNING: Could not find trigger location. Searching alternatives...")
    # Try a looser match
    alt_old = 'renderNav();'
    # find last occurrence
    idx2 = html.rfind(alt_old)
    if idx2 != -1:
        html = html[:idx2+len(alt_old)] + '\n    if (window._startOnboardingTour) _startOnboardingTour();' + html[idx2+len(alt_old):]
        print("Tour trigger injected after last renderNav().")
    else:
        print("ERROR: Could not find trigger location.")

with open(SRC, 'w', encoding='utf-8') as f:
    f.write(html)

print("Done. File saved.")
