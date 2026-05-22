
// Popup logic
const STORAGE_KEY = 'mg_popup_dismissed';
const popup = document.getElementById('popup');

function safeParse(raw) {
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function preparePopupContent() {
  const state = safeParse(localStorage.getItem('carRecommendationState'));
  const top = safeParse(localStorage.getItem('carRecommendationTop'));

  const titleEl = document.getElementById('popupTitle');
  const textEl = document.getElementById('popupText');
  const actions = document.getElementById('popupActions');

  // Default
  if (titleEl) titleEl.textContent = 'Not sure which MG is right for you?';
  if (textEl) textEl.textContent = "Answer 4 quick questions and we'll find your perfect match.";
  if (actions) actions.innerHTML = '';

  if (state && Object.keys(state).length > 0) {
    // Incomplete quiz
    if (titleEl) titleEl.textContent = 'You have an incomplete quiz.';
    if (textEl) textEl.textContent = 'Resume your answers to get personalized matches tailored for you.';
    if (actions) {
      actions.innerHTML = `
        <a id="popupCtaLink" href="car-recommendation.html?resume=true">
          <button id="popupCta" class="btn-primary" style="width:100%;padding:12px;">Resume Quiz →</button>
        </a>
      `;
    }
    return;
  }

  if (top && top.name) {
    // Show top recommendation CTA + retake
    if (titleEl) titleEl.textContent = `Your top match: ${top.name}`;
    if (textEl) textEl.textContent = 'View details or retake the quiz to explore other options.';
    if (actions) {
      const viewLink = top.link || 'car-recommendation.html';
      actions.innerHTML = `
        <div style="display:flex;gap:8px;flex-direction:column;">
          <a id="popupCtaLink" href="${viewLink}">
            <button id="popupCta" class="btn-primary" style="width:100%;padding:12px;">View Match →</button>
          </a>
          <button id="popupRetake" class="btn-outline" style="width:100%;padding:10px;" onclick="retakeFromPopup()">Retake Quiz</button>
        </div>
      `;
    }
    return;
  }

  // Fallback: default CTA
  if (actions) {
    actions.innerHTML = `
      <a id="popupCtaLink" href="car-recommendation.html">
        <button id="popupCta" class="btn-primary" style="width:100%;padding:12px;">Get MG Recommendation →</button>
      </a>
    `;
  }
}

function showPopup() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  preparePopupContent();
  popup.style.display = 'block';
}

function dismissPopup() {
  popup.style.display = 'none';
  // persist user's dismissal for a day (uncomment to enable)
  // localStorage.setItem(STORAGE_KEY, 'true');
}

function retakeFromPopup() {
  try { localStorage.removeItem('carRecommendationTop'); localStorage.removeItem('carRecommendationState'); } catch (e) {}
  // navigate user to quiz page to retake
  window.location.href = 'car-recommendation.html';
}

if (!localStorage.getItem(STORAGE_KEY)) {
  // Time trigger: 8 seconds
  const timer = setTimeout(showPopup, 8000);

  // Scroll trigger: 60%
  window.addEventListener('scroll', function onScroll() {
    const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    if (scrollPct >= 60) {
      showPopup();
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    }
  });
}
