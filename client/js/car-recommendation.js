const BUDGET_BANDS = {
  'u10':   { min: 0,        max: 1000000 },
  '10-15': { min: 1000001,  max: 1500000 },
  '15-25': { min: 1500001,  max: 2500000 },
  '25+':   { min: 2500001,  max: Infinity },
};

const FUEL_TYPE_MAP = {
  petrol: 'Petrol',
  ev:     'EV',
  both:   'any',
};

const PRIORITY_KEY_MAP = {
  largeScreen: 'large_screen',
};

// ── QUIZ DATA ──
const questions = [
  {
    label: "Question 1 of 4", title: "What's your primary use?", sub: "Help us understand how you'll be driving your MG.",
    options: [
      { id:"city", title:"Daily City Commute", sub:"Short trips, traffic, urban roads", svg:'<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
      { id:"highway", title:"Highway & Long Drives", sub:"Comfort on open roads", svg:'<path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="16" r="1"/>' },
      { id:"family", title:"Family Outings", sub:"Space, safety, comfort", svg:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>' },
      { id:"business", title:"Business & Executive", sub:"Premium, prestigious presence", svg:'<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>' },
    ]
  },
  {
    label: "Question 2 of 4", title: "What's your budget?", sub: "We'll find the best MG in your range.",
    options: [
      { id:"u10", title:"Under ₹10 Lakh", sub:"Value-packed options" },
      { id:"10-15", title:"₹10 – 15 Lakh", sub:"Most popular segment" },
      { id:"15-25", title:"₹15 – 25 Lakh", sub:"Feature-rich SUVs" },
      { id:"25+", title:"₹25 Lakh+", sub:"Premium & flagship" },
    ]
  },
  {
    label: "Question 3 of 4", title: "Preferred fuel type?", sub: "Petrol, electric, or open to both?",
    options: [
      { id:"petrol", title:"Petrol", sub:"Familiar, wide fuel network", svg:'<path d="M3 22V6a2 2 0 012-2h5a2 2 0 012 2v16"/><line x1="3" y1="22" x2="11" y2="22"/><rect x="4" y="8" width="6" height="4" rx="1"/><path d="M13 5l2-2 2 2"/><line x1="15" y1="3" x2="15" y2="11"/><path d="M15 11h1a2 2 0 012 2v4a1 1 0 002 0v-7"/>' },
      { id:"ev", title:"Electric (EV)", sub:"Zero emissions, lower running cost", svg:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
      { id:"both", title:"Open to Both", sub:"Show me the best of MG", svg:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
    ]
  },
  {
    label: "Question 4 of 4", title: "What do you want most out of your MG?", sub: "We'll match you with the right cabin size.",
    multiSelect: true,
    options: [
      { id:"largeScreen", title:"Large Screen", sub:`10"+ infotainment display`, svg:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
      { id:"mileage", title:"Best Mileage", sub:"Maximum km per rupee", svg:'<line x1="12" y1="2" x2="12" y2="6"/><circle cx="12" cy="14" r="8"/><path d="M12 14l3.5-3.5"/><circle cx="12" cy="14" r="1" fill="currentColor" stroke="none"/>' },
      { id:"adas", title:"ADAS Safety", sub:"Collision warning & lane assist", svg:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>' },
      { id:"comfort", title:"Space & Comfort", sub:"Legroom, boot, ride quality", svg:'<path d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2"/><path d="M2 11v5a2 2 0 002 2h16a2 2 0 002-2v-5a2 2 0 00-4 0v1H6v-1a2 2 0 00-4 0z"/><path d="M6 19v2M18 19v2"/>' },
      { id:"performance", title:"Performance", sub:"Power, acceleration, driving thrill", svg:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
    ]
  }
];

let currentStep = 0;
const answers = {};
const COOKIE_NAME = 'carRecommendationAnswers';
const TEST_SHOW_RESULTS_DIRECTLY = false; // set to true while testing to skip straight to the result page

function getCookie(name) {
  const match = document.cookie.match('(^|;)\\s*' + name + '=([^;]+)');
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function isQuestionAnswered(step) {
  const q = questions[step];
  if (q.multiSelect) return Array.isArray(answers[step]) && answers[step].length > 0;
  return !!answers[step];
}

function areAllAnswered() {
  return questions.every((_, idx) => isQuestionAnswered(idx));
}

function saveAnswerState() {
  if (areAllAnswered()) {
    deleteCookie(COOKIE_NAME);
    try { localStorage.removeItem('carRecommendationState'); } catch (e) {}
    return;
  }
  setCookie(COOKIE_NAME, JSON.stringify(answers));
  try { localStorage.setItem('carRecommendationState', JSON.stringify(answers)); } catch (e) {}
}

function restoreAnswerState() {
  // Prefer cookie (legacy), fallback to localStorage
  let raw = getCookie(COOKIE_NAME);
  if (!raw) {
    try { raw = localStorage.getItem('carRecommendationState'); } catch (e) { raw = null; }
  }
  if (!raw) return false;

  try {
    const stored = JSON.parse(raw);
    if (stored && typeof stored === 'object') {
      Object.keys(stored).forEach(key => {
        const idx = Number(key);
        if (!Number.isNaN(idx) && idx >= 0 && idx < questions.length) {
          answers[idx] = stored[key];
        }
      });
    }
  } catch (err) {
    deleteCookie(COOKIE_NAME);
    return false;
  }

  if (areAllAnswered()) {
    deleteCookie(COOKIE_NAME);
  }

  const firstUnanswered = questions.findIndex((_, idx) => !isQuestionAnswered(idx));
  currentStep = firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;

  if (TEST_SHOW_RESULTS_DIRECTLY) {
    showResults();
    return true;
  }

  return false;
}

function isStepAnswered() {
  return isQuestionAnswered(currentStep);
}

function renderStep() {
  const q = questions[currentStep];
  document.getElementById('questionLabel').textContent = q.label;
  document.getElementById('questionTitle').textContent = q.title;

  // Sub text + optional multi-select hint
  const subEl = document.getElementById('questionSub');
  subEl.textContent = q.sub;
  if (q.multiSelect) {
    const hint = document.createElement('span');
    hint.style.cssText = 'display:inline-block;margin-left:8px;font-size:12px;font-weight:600;color:var(--red);background:#fef2f2;border:1px solid #fecaca;padding:2px 10px;border-radius:100px;';
    hint.textContent = 'Select up to 3';
    subEl.appendChild(hint);
  }

  // Progress bar
  document.getElementById('progressBar').style.width = ((currentStep + 1) / 4 * 100) + '%';

  // Step indicators
  const si = document.getElementById('stepIndicators');
  si.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement('div');
    dot.className = 'step-dot ' + (i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending');
    dot.innerHTML = i < currentStep ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' : (i + 1);
    si.appendChild(dot);
    if (i < 3) {
      const line = document.createElement('div');
      line.className = 'step-line ' + (i < currentStep ? 'done' : 'pending');
      si.appendChild(line);
    }
  }

  // Back button
  document.getElementById('backBtn').style.display = currentStep > 0 ? 'inline-flex' : 'none';

  // Options
  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';
  const selectedArr = Array.isArray(answers[currentStep]) ? answers[currentStep] : [];

  q.options.forEach(opt => {
    const card = document.createElement('div');
    const isSelected = q.multiSelect ? selectedArr.includes(opt.id) : answers[currentStep] === opt.id;
    const maxReached = q.multiSelect && selectedArr.length >= 3 && !isSelected;

    card.className = 'option-card' + (isSelected ? ' selected' : '');
    card.style.opacity = maxReached ? '0.4' : '1';
    card.style.pointerEvents = maxReached ? 'none' : '';
    card.onclick = () => selectOption(opt.id);
    card.innerHTML = `
      <div class="option-check"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      ${opt.svg ? `<div class="option-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${opt.svg}</svg></div>` : ''}
      <div class="option-title">${opt.title}</div>
      <div class="option-sub">${opt.sub}</div>
    `;
    grid.appendChild(card);
  });

  // Next button
  const btn = document.getElementById('nextBtn');
  const label = document.getElementById('nextLabel');
  label.textContent = currentStep === 3 ? 'See My Matches' : 'Continue';
  if (isStepAnswered()) {
    btn.classList.add('enabled');
  } else {
    btn.classList.remove('enabled');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function selectOption(id) {
  const q = questions[currentStep];
  if (q.multiSelect) {
    if (!Array.isArray(answers[currentStep])) answers[currentStep] = [];
    const idx = answers[currentStep].indexOf(id);
    if (idx > -1) {
      answers[currentStep].splice(idx, 1); // deselect
    } else if (answers[currentStep].length < 3) {
      answers[currentStep].push(id); // select (max 3)
    }
  } else {
    answers[currentStep] = id;
  }
  saveAnswerState();
  renderStep();
}

function nextStep() {
  if (!isStepAnswered()) return;
  if (currentStep < 3) {
    currentStep++;
    renderStep();
  } else {
    showResults();
  }
}

function prevStep() {
  if (currentStep > 0) { currentStep--; renderStep(); }
}

async function showResults() {
  document.getElementById('quizSection').style.display = 'none';
  document.getElementById('resultsSection').style.display = 'block';
  window.scrollTo(0, 0);
  renderResultsLoading();

  try {
    const recommendations = await fetchRecommendations();
    renderRecommendations(recommendations);
  } catch (err) {
    renderResultsError(err.message || 'Unable to fetch recommendations.');
  }
}

function getBudgetForId(id) {
  const band = BUDGET_BANDS[id];
  if (!band) return null;
  return Number.isFinite(band.max) ? band.max : 1000000000;
}

function getApiFuelType(value) {
  return FUEL_TYPE_MAP[value] || 'any';
}

function normalizePriorityKey(key) {
  return PRIORITY_KEY_MAP[key] || key;
}

function buildRecommendationPayload() {
  const budgetId = answers[1];
  const fuelAnswer = answers[2];
  const extraPriorities = Array.isArray(answers[3]) ? answers[3] : [];

  return {
    budget: getBudgetForId(budgetId),
    fuel_type: getApiFuelType(fuelAnswer),
    priorities: [answers[0], ...extraPriorities]
      .map(normalizePriorityKey)
      .filter(Boolean),
    top_n: 3,
  };
}

async function fetchRecommendations() {
  const payload = buildRecommendationPayload();
  const res = await fetch('http://localhost:3000/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Recommendation API returned an error');
  }

  return Array.isArray(data.data) ? data.data : [];
}

function renderResultsLoading() {
  const heroTitle = document.querySelector('.hero-match-card h3');
  const heroText = document.querySelector('.hero-match-card p');
  const heroScore = document.querySelector('.hero-match-score strong');
  const heroPills = document.querySelector('.hero-match-pills');
  const cards = document.querySelectorAll('.results .results-grid .car-card');

  if (heroTitle) heroTitle.textContent = 'Finding your ideal MG...';
  if (heroText) heroText.textContent = 'Please wait while we match the best options for your needs.';
  if (heroScore) heroScore.textContent = '--';
  if (heroPills) heroPills.innerHTML = '';
  const aiRecommendationBox = document.getElementById('aiRecommendationBox');
  const aiRecommendationText = document.getElementById('aiRecommendationText');
  if (aiRecommendationText) aiRecommendationText.textContent = '';
  if (aiRecommendationBox) aiRecommendationBox.style.display = 'none';
  cards.forEach(card => { card.style.opacity = '0.4'; });
}

function renderResultsError(message) {
  const resultsGrid = document.querySelector('.results .results-grid');
  if (resultsGrid) {
    resultsGrid.innerHTML = `<div class="error-card">${escapeHtml(message)}</div>`;
  }
}

function renderRecommendations(results) {
  if (!Array.isArray(results) || results.length === 0) {
    renderResultsError('No matches found for your selections.');
    return;
  }

  const topResult = results[0];
  const heroImage = document.querySelector('.hero-match-card img');
  const heroTitle = document.querySelector('.hero-match-card h3');
  const heroText = document.querySelector('.hero-match-card p');
  const heroScore = document.querySelector('.hero-match-score strong');
  const heroPills = document.querySelector('.hero-match-pills');

  if (heroImage) {
    heroImage.src = topResult.car_image_url || heroImage.src;
    heroImage.alt = `${topResult.model_name} ${topResult.variant_name}`.trim();
  }
  if (heroTitle) heroTitle.textContent = `${topResult.model_name} ${topResult.variant_name}`.trim();
  if (heroText) heroText.textContent = topResult.tagline || '';
  if (heroScore) heroScore.textContent = `${topResult.match_percent}%`;
  if (heroPills) {
    heroPills.innerHTML = (topResult.card_tags || [])
      .slice(0, 3)
      .map(tag => `<span>${escapeHtml(tag)}</span>`)
      .join('');
  }

  const aiRecommendationBox = document.getElementById('aiRecommendationBox');
  const aiRecommendationText = document.getElementById('aiRecommendationText');
  if (aiRecommendationText) {
    aiRecommendationText.textContent = topResult.why || '';
  }
  if (aiRecommendationBox) {
    aiRecommendationBox.style.display = topResult.why ? 'block' : 'none';
  }

  // Persist top recommendation for quick access from the homepage popup
  try {
    const topObj = {
      name: `${topResult.model_name} ${topResult.variant_name}`.trim(),
      link: `/cars/${topResult.model_sales_code}`,
    };
    localStorage.setItem('carRecommendationTop', JSON.stringify(topObj));
    localStorage.removeItem('carRecommendationState');
  } catch (e) {}

  const cards = Array.from(document.querySelectorAll('.results .results-grid .car-card'));
  cards.forEach((card, index) => {
    const result = results[index];
    if (!result) {
      card.style.display = 'none';
      return;
    }

    card.style.display = '';
    card.style.opacity = '';
    const img = card.querySelector('.car-image img');
    if (img) {
      img.src = result.car_image_url || img.src;
      img.alt = `${result.model_name} ${result.variant_name}`.trim();
    }

    const badge = card.querySelector('.match-badge');
    if (badge) badge.textContent = `${result.match_percent}% Match`;

    const title = card.querySelector('.card-top h3');
    if (title) title.textContent = `${result.model_name} ${result.variant_name}`.trim();

    const tagline = card.querySelector('.tagline');
    if (tagline) tagline.textContent = result.tagline || '';

    const priceStrong = card.querySelector('.card-top .price strong');
    if (priceStrong) priceStrong.textContent = result.price_display || formatPrice(result.ex_showroom_price);

    const smartNote = card.querySelector('.smart-note');
    if (smartNote) {
      const tags = (result.card_tags || []);
      smartNote.innerHTML = tags.length
        ? tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')
        : '';
    }

    const specGrid = card.querySelector('.spec-grid');
    if (specGrid) specGrid.innerHTML = buildSpecsHtml(result.stats);
  });
}

function buildSpecsHtml(stats) {
  if (!stats || typeof stats !== 'object') return '';
  return Object.values(stats)
    .map(stat => `<div class="spec"><span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(stat.value)}</strong></div>`)
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function retake() {
  currentStep = 0;
  for (let k in answers) delete answers[k];
  deleteCookie(COOKIE_NAME);
  try { localStorage.removeItem('carRecommendationState'); localStorage.removeItem('carRecommendationTop'); } catch (e) {}
  document.getElementById('quizSection').style.display = 'block';
  document.getElementById('resultsSection').style.display = 'none';
  renderStep();
  window.scrollTo(0, 0);
}

if (!restoreAnswerState()) {
  renderStep();
}

// ── MODALS ──
function openCallModal() {
  document.getElementById('callStep1').style.display = 'block';
  document.getElementById('callStep2').style.display = 'none';
  document.getElementById('callStep3').style.display = 'none';
  document.getElementById('callName').value = '';
  document.getElementById('callPhone').value = '';
  document.getElementById('callModal').classList.add('open');
}

function openDriveModal() {
  document.getElementById('driveStep1').style.display = 'block';
  document.getElementById('driveStep2').style.display = 'none';
  document.getElementById('driveName').value = '';
  document.getElementById('drivePhone').value = '';
  document.getElementById('driveDate').value = '';
  document.getElementById('driveModal').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close on overlay click
document.getElementById('callModal').addEventListener('click', function(e) { if (e.target === this) closeModal('callModal'); });
document.getElementById('driveModal').addEventListener('click', function(e) { if (e.target === this) closeModal('driveModal'); });

// Enable send OTP button dynamically
document.getElementById('callName').addEventListener('input', checkCallForm);
document.getElementById('callPhone').addEventListener('input', checkCallForm);
function checkCallForm() {
  const n = document.getElementById('callName').value.trim();
  const p = document.getElementById('callPhone').value.trim();
  document.getElementById('sendOtpBtn').disabled = !(n.length >= 2 && p.length === 10);
}

// Enable drive submit button
document.getElementById('driveName').addEventListener('input', checkDriveForm);
document.getElementById('drivePhone').addEventListener('input', checkDriveForm);
function checkDriveForm() {
  const n = document.getElementById('driveName').value.trim();
  const p = document.getElementById('drivePhone').value.trim();
  document.getElementById('driveSubmitBtn').disabled = !(n.length >= 2 && p.length === 10);
}

// OTP flow
let resendInterval;
function sendOtp() {
  const btn = document.getElementById('sendOtpBtn');
  btn.textContent = 'Sending...'; btn.disabled = true;
  setTimeout(() => {
    const phone = document.getElementById('callPhone').value;
    document.getElementById('otpSentTo').textContent = 'Sent to +91 ' + phone;
    document.getElementById('callStep1').style.display = 'none';
    document.getElementById('callStep2').style.display = 'block';
    startResendTimer();
    document.getElementById('otp0').focus();
    btn.textContent = 'Send OTP';
  }, 1500);
}

function startResendTimer() {
  let t = 30;
  const el = document.getElementById('resendTimer');
  const row = document.getElementById('resendRow');
  row.innerHTML = 'Resend OTP in <span id="resendTimer">0:30</span>';
  clearInterval(resendInterval);
  resendInterval = setInterval(() => {
    t--;
    const span = document.getElementById('resendTimer');
    if (t > 0 && span) { span.textContent = '0:' + String(t).padStart(2,'0'); }
    else {
      clearInterval(resendInterval);
      document.getElementById('resendRow').innerHTML = '<button class="resend-link" onclick="startResendTimer()">Resend OTP</button>';
    }
  }, 1000);
}

function otpInput(i) {
  const val = document.getElementById('otp' + i).value.replace(/\D/g, '');
  document.getElementById('otp' + i).value = val;
  if (val && i < 5) document.getElementById('otp' + (i+1)).focus();
}
function otpKey(e, i) {
  if (e.key === 'Backspace' && !document.getElementById('otp' + i).value && i > 0) {
    document.getElementById('otp' + (i-1)).focus();
  }
}
function changeNumber() {
  clearInterval(resendInterval);
  document.getElementById('callStep2').style.display = 'none';
  document.getElementById('callStep1').style.display = 'block';
}
function verifyOtp() {
  const phone = document.getElementById('callPhone').value;
  document.getElementById('confirmedPhone').textContent = '+91 ' + phone;
  document.getElementById('callStep2').style.display = 'none';
  document.getElementById('callStep3').style.display = 'block';
  clearInterval(resendInterval);
}

function confirmDrive() {
  const phone = document.getElementById('drivePhone').value;
  document.getElementById('driveConfPhone').textContent = '+91 ' + phone;
  document.getElementById('driveStep1').style.display = 'none';
  document.getElementById('driveStep2').style.display = 'block';
}

// Set min date for test drive
document.getElementById('driveDate').min = new Date().toISOString().split('T')[0];
