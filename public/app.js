// ─────────────────────────────────────────
// 상태
// ─────────────────────────────────────────
const state = {
  question: '',
  philosopher: null
};

const philosopherMeta = {
  epicurus:     { en: 'Epicurus',     ko: '에피쿠로스' },
  plato:        { en: 'Plato',        ko: '플라톤' },
  aristoteles:  { en: 'Aristoteles',  ko: '아리스토텔레스' },
  heraclitus:   { en: 'Heraclitus',  ko: '헤라클리투스' },
  socrates:     { en: 'Socrates',     ko: '소크라테스' }
};

// ─────────────────────────────────────────
// DOM 참조
// ─────────────────────────────────────────
const steps = {
  question:    document.getElementById('step-question'),
  philosopher: document.getElementById('step-philosopher'),
  answer:      document.getElementById('step-answer')
};

const questionInput    = document.getElementById('question-input');
const charCurrent      = document.getElementById('char-current');
const btnNextStep      = document.getElementById('btn-next-step');
const btnBackQuestion  = document.getElementById('btn-back-question');
const btnBackPhilosopher = document.getElementById('btn-back-philosopher');
const philosopherCards = document.querySelectorAll('.philosopher-card');

const answerPhilosopherName = document.getElementById('answer-philosopher-name');
const answerPhilosopherKo   = document.getElementById('answer-philosopher-ko');
const recapQuestion         = document.getElementById('recap-question');
const answerLoading         = document.getElementById('answer-loading');
const answerContent         = document.getElementById('answer-content');
const answerText            = document.getElementById('answer-text');
const answerError           = document.getElementById('answer-error');
const errorMessage          = document.getElementById('error-message');
const answerActions         = document.getElementById('answer-actions');
const btnRestart            = document.getElementById('btn-restart');
const btnTryOther           = document.getElementById('btn-try-other');

// ─────────────────────────────────────────
// 스텝 전환 헬퍼
// ─────────────────────────────────────────
function showStep(name) {
  Object.values(steps).forEach(el => el.classList.remove('active'));
  steps[name].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─────────────────────────────────────────
// STEP 1: 질문 입력
// ─────────────────────────────────────────
questionInput.addEventListener('input', () => {
  const len = questionInput.value.trim().length;
  charCurrent.textContent = questionInput.value.length;
  btnNextStep.disabled = len < 5;
});

btnNextStep.addEventListener('click', () => {
  state.question = questionInput.value.trim();
  // 이전 철학자 선택 초기화
  philosopherCards.forEach(c => c.classList.remove('selected'));
  state.philosopher = null;
  showStep('philosopher');
});

// ─────────────────────────────────────────
// STEP 2: 철학자 선택
// ─────────────────────────────────────────
btnBackQuestion.addEventListener('click', () => {
  showStep('question');
});

philosopherCards.forEach(card => {
  card.addEventListener('click', () => {
    philosopherCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.philosopher = card.dataset.philosopher;

    // 약간의 딜레이 후 답변 화면으로
    setTimeout(() => {
      loadAnswer();
    }, 300);
  });
});

// ─────────────────────────────────────────
// STEP 3: 답변 로드
// ─────────────────────────────────────────
function loadAnswer() {
  const meta = philosopherMeta[state.philosopher];

  // 헤더 업데이트
  answerPhilosopherName.textContent = meta.en;
  answerPhilosopherKo.textContent   = meta.ko;
  recapQuestion.textContent         = state.question;

  // 상태 초기화
  answerLoading.classList.remove('hidden');
  answerContent.classList.add('hidden');
  answerError.classList.add('hidden');
  answerActions.classList.add('hidden');
  answerText.textContent = '';

  showStep('answer');

  // API 호출
  fetchAnswer(state.question, state.philosopher);
}

async function fetchAnswer(question, philosopher) {
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, philosopher })
    });

    const data = await res.json();

    answerLoading.classList.add('hidden');

    if (!res.ok) {
      errorMessage.textContent = data.error || '오류가 발생했습니다.';
      answerError.classList.remove('hidden');
    } else {
      answerText.textContent = data.answer;
      answerContent.classList.remove('hidden');
    }

    answerActions.classList.remove('hidden');

  } catch (err) {
    answerLoading.classList.add('hidden');
    errorMessage.textContent = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
    answerError.classList.remove('hidden');
    answerActions.classList.remove('hidden');
  }
}

// ─────────────────────────────────────────
// 액션 버튼
// ─────────────────────────────────────────
btnBackPhilosopher.addEventListener('click', () => {
  showStep('philosopher');
});

btnRestart.addEventListener('click', () => {
  questionInput.value = '';
  charCurrent.textContent = '0';
  btnNextStep.disabled = true;
  state.question = '';
  state.philosopher = null;
  showStep('question');
});

btnTryOther.addEventListener('click', () => {
  showStep('philosopher');
});
