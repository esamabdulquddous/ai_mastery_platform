function renderNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  const html = PHASES.map((ph, pi) => {
    const phaseTitle = ph[L()]?.title || ph.en?.title;
    const phasePageId = `phase_${ph.id}`;
    const stepsHtml = ph.steps.map((step, si) => {
      const completed = !!state.completed[step.id];
      const active = state.currentPage === step.id;
      return `<div class="nav-step ${active?'active':''} ${completed?'completed':''}" onclick="navigateTo('${step.id}')"><div class="step-num-sm">${completed?'✓':(si+1)}</div><span>${step[L()]?.title||step.en?.title}</span></div>`;
    }).join('');
    return `<div class="nav-phase"><div class="nav-phase-header ${state.currentPage===phasePageId?'active':''}" onclick="navigateTo('${phasePageId}')"><div class="phase-dot-sm" style="background:${ph.color}"></div><span>${phaseTitle}</span></div><div class="nav-steps">${stepsHtml}</div></div>`;
  }).join('');
  nav.innerHTML = html;
}

function renderContent(pageId) {
  const content = document.getElementById('content-area');
  if (!content) return;
  let html = '';
  if (pageId === 'welcome') html = renderWelcome();
  else if (pageId.startsWith('phase_')) {
    const phaseId = pageId.replace('phase_', '');
    const pi = PHASES.findIndex(p => p.id === phaseId);
    if (pi >= 0) html = renderPhase(PHASES[pi], pi);
  } else {
    let found = null;
    PHASES.forEach((ph, pi) => { ph.steps.forEach((step, si) => { if (step.id === pageId) found = {step, ph, pi, si}; }); });
    if (found) html = renderStep(found.step, found.ph, found.pi, found.si);
  }
  content.innerHTML = html || '<div class="fade-up">Not found</div>';
}

function renderWelcome() {
  const isAr = L() === 'ar';
  const timeline = PHASES.map((ph, i) => `<div class="tl-pill ${i===0?'active':''}" onclick="navigateTo('phase_${ph.id}')" style="cursor:pointer">${ph[L()]?.title||ph.en?.title}</div>${i<PHASES.length-1?'<div class="tl-line-sm"></div>':''}`).join('');
  const cards = PHASES.map((ph, i) => {
    const d = ph[L()] || ph.en;
    return `<div class="concept-card" onclick="navigateTo('phase_${ph.id}')" style="cursor:pointer;border-left:3px solid ${ph.color}"><div class="concept-name" style="color:${ph.color}">${isAr?'المرحلة':'Phase'} ${i+1} · ${d.title}</div><div class="concept-desc">${d.sub||''}</div><div class="concept-desc" style="margin-top:6px">${(d.desc||'').substring(0,80)}...</div></div>`;
  }).join('');
  return `<div class="fade-up"><div class="phase-hero"><div class="phase-eyebrow"><div class="phase-dot" style="background:var(--accent)"></div>${isAr?'أهلاً بك':'Welcome'}</div><h1 class="phase-title-lg">${isAr?'من الصفر إلى الإمبراطورية الإبداعية':'From Zero to Creative Empire'}</h1><p class="phase-desc">${isAr?'رحلة عملية شاملة من تعلم الذكاء الاصطناعي إلى بناء أعمال إبداعية مستدامة':'A practical journey from AI foundations to building creative businesses'}</p><div class="timeline-strip">${timeline}</div></div><div class="concept-grid">${cards}</div><div class="callout"><strong>${isAr?'كيف تستخدم الدورة:':'How to use this course:'}</strong> ${isAr?'تنقل عبر المراحل بالترتيب. اقرأ كل درس، افتح لوحة كلود ونفذ التمرين مباشرة. علّم التقدم عند إكمال كل خطوة.':'Navigate through phases in order. Read each lesson, open the Claude panel and do the exercise directly. Mark steps complete as you go.'}</div></div>`;
}

function renderPhase(ph, pi) {
  const d = ph[L()] || ph.en;
  const isAr = L() === 'ar';
  const doneCount = ph.steps.filter(s => state.completed[s.id]).length;
  const cards = ph.steps.map((step, si) => {
    const sd = step[L()] || step.en;
    const done = !!state.completed[step.id];
    return `<div class="concept-card" onclick="navigateTo('${step.id}')" style="cursor:pointer;${done?'border-color:var(--green)':''}"><div class="concept-name" style="color:${done?'var(--green)':ph.color}">${done?'✓ '+(isAr?'مكتمل':'Complete'):`${isAr?'الخطوة':'Step'} ${si+1}`}</div><div class="concept-name">${sd.title}</div><div class="concept-desc">${sd.sub||''}</div></div>`;
  }).join('');
  return `<div class="fade-up"><div class="phase-hero"><div class="phase-eyebrow"><div class="phase-dot" style="background:${ph.color}"></div><span style="color:${ph.color}">${isAr?'المرحلة':'Phase'} ${pi+1}</span></div><h1 class="phase-title-lg">${d.title}</h1><p class="phase-desc">${d.desc||''}</p><div style="font-family:var(--font-ui);font-size:12px;color:var(--text3);margin-top:12px">${doneCount}/${ph.steps.length} ${isAr?'خطوات مكتملة':'steps complete'} · ${d.sub||''}</div></div><div class="concept-grid">${cards}</div></div>`;
}

function renderStep(step, ph, pi, si) {
  const d = step[L()] || step.en;
  const isAr = L() === 'ar';
  const completed = !!state.completed[step.id];

  const landscapeSection = d.landscape ? `<div class="step-section"><div class="exercise-label">${T[L()].landscape}</div><div class="prose">${d.landscape}</div>${d.landscapeGrid?.length?`<div class="concept-grid">${d.landscapeGrid.map(c=>`<div class="concept-card"><div class="concept-icon">${c.icon||'•'}</div><div class="concept-name">${c.name||c.title||''}</div><div class="concept-desc">${c.desc||''}</div></div>`).join('')}</div>`:''}</div>` : '';

  const contentSection = d.content ? `<div class="step-section"><div class="prose">${d.content}</div>${d.conceptCards?.length?`<div class="concept-grid">${d.conceptCards.map(c=>`<div class="concept-card"><div class="concept-icon">${c.icon||'•'}</div><div class="concept-name">${c.name||c.title||''}</div><div class="concept-desc">${c.desc||''}</div></div>`).join('')}</div>`:''}</div>` : '';

  let comparisonSection = '';
  if (d.comparison?.length) {
    const firstRow = d.comparison[0];
    const hasFeature = 'feature' in firstRow;
    if (hasFeature) {
      comparisonSection = `<div class="step-section"><div class="exercise-label">${d.comparisonTitle||'Comparison'}</div><table class="comparison-table"><thead><tr><th>${isAr?'العنصر':'Feature'}</th><th>${isAr?'التقليدي':'Traditional'}</th><th>${isAr?'المحسّن':'AI-Powered'}</th></tr></thead><tbody>${d.comparison.map(r=>`<tr><td><strong>${r.feature||''}</strong></td><td>${r.alternative||''}</td><td style="color:var(--green)">${r.preferred||''}</td></tr>`).join('')}</tbody></table></div>`;
    } else {
      comparisonSection = `<div class="step-section"><div class="exercise-label">${d.comparisonTitle||'Tool Comparison'}</div><table class="comparison-table"><thead><tr><th>${isAr?'الأداة':'Tool'}</th><th>${isAr?'القوة':'Strength'}</th><th>${isAr?'الأفضل لـ':'Best For'}</th></tr></thead><tbody>${d.comparison.map(r=>`<tr class="${r.badge&&r.badge!==''?'highlight-row':''}"><td><strong>${r.name||''}</strong></td><td>${r.strength||''}</td><td>${r.best||r.bestFor||''}</td></tr>`).join('')}</tbody></table></div>`;
    }
  }

  const calloutSection = d.callout ? `<div class="callout">${d.callout}</div>` : '';

  const exerciseSection = `<div class="exercise-box"><div class="exercise-label">${T[L()].exercise}</div><div class="exercise-title">${d.exercise?.title||''}</div><div class="exercise-desc">${d.exercise?.desc||''}</div>${(d.exercise?.prompts||[]).map(p=>`<div class="exercise-prompt">${p}</div>`).join('')}<button class="complete-btn ${completed?'done':''}" id="complete-btn-${step.id}">${completed?T[L()].done:T[L()].markDone}</button></div>`;

  const allSteps = PHASES.flatMap(p => p.steps);
  const idx = allSteps.findIndex(s => s.id === step.id);
  const prev = idx > 0 ? allSteps[idx-1] : null;
  const next = idx < allSteps.length-1 ? allSteps[idx+1] : null;
  const navSection = `<div style="display:flex;justify-content:space-between;margin-top:40px;padding-top:24px;border-top:1px solid var(--border)">${prev?`<button onclick="navigateTo('${prev.id}')" style="padding:8px 16px;border-radius:var(--radius);border:1px solid var(--border2);background:transparent;color:var(--text2);font-family:var(--font-ui);font-size:13px;cursor:pointer">← ${isAr?'السابق':'Previous'}</button>`:'<div></div>'}${next?`<button onclick="navigateTo('${next.id}')" style="padding:8px 16px;border-radius:var(--radius);border:1px solid var(--border2);background:transparent;color:var(--text2);font-family:var(--font-ui);font-size:13px;cursor:pointer">${isAr?'التالي':'Next'} →</button>`:'<div></div>'}</div>`;

  setTimeout(() => bindCompleteBtn(step.id), 0);

  return `<div class="fade-up"><div class="phase-hero" style="margin-bottom:28px;padding-bottom:20px"><div class="phase-eyebrow"><div class="phase-dot" style="background:${ph.color}"></div><span style="color:${ph.color};cursor:pointer" onclick="navigateTo('phase_${ph.id}')">${ph[L()]?.title||ph.en?.title}</span><span style="color:var(--text3)"> / ${isAr?'الخطوة':'Step'} ${si+1}</span></div><h1 class="phase-title-lg" style="font-size:24px">${d.title}</h1><p class="phase-desc" style="font-size:14px">${d.sub||''}</p></div>${landscapeSection}${contentSection}${comparisonSection}${calloutSection}${exerciseSection}${navSection}</div>`;
}

function bindCompleteBtn(stepId) {
  const btn = document.getElementById(`complete-btn-${stepId}`);
  if (!btn || state.completed[stepId]) return;
  btn.onclick = () => markComplete(stepId);
}

window.renderNav = renderNav;
window.renderContent = renderContent;
window.renderWelcome = renderWelcome;
window.renderPhase = renderPhase;
window.renderStep = renderStep;
window.bindCompleteBtn = bindCompleteBtn;
