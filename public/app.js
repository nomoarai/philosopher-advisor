// ─────────────────────────────────────────
// 상태 및 설정
// ─────────────────────────────────────────
const state = {
  mood: null,
  theme: '일',
  situation: null,
  mindset: null,
  philosopher: null,
  generatedQuestion: null,
  userAnswer: '',
  shareConsent: false,
  currentTab: 'ask',
  postsSortBy: 'latest',
  isAdmin: false,
  adminPassword: ''
};

const philosopherMeta = {
  epicurus:    { en: 'Epicurus',     ko: '에피쿠로스',     avatar: '/images/epicurus.png',     docGreek: 'ἀταραξία',       docEn: 'tranquility'       },
  plato:       { en: 'Plato',        ko: '플라톤',         avatar: '/images/plato.png',         docGreek: 'δικαιοσύνη',     docEn: 'justice'           },
  aristoteles: { en: 'Aristoteles',  ko: '아리스토텔레스', avatar: '/images/aristoteles.png',   docGreek: 'εὐδαιμονία',     docEn: 'human flourishing' },
  heraclitus:  { en: 'Heraclitus',   ko: '헤라클리투스',  avatar: '/images/heraclitus.png',    docGreek: 'πάντα ῥεῖ',     docEn: 'everything flows'  },
  socrates:    { en: 'Socrates',     ko: '소크라테스',     avatar: '/images/socrates.png',      docGreek: 'γνῶθι σεαυτόν', docEn: 'know yourself'     }
};

const LOCAL_STORAGE_KEYS = {
  HAS_SHARED:  'philosopher_advisor_has_shared',
  LIKED_POSTS: 'philosopher_advisor_liked_posts'
};

// ─────────────────────────────────────────
// DOM 참조
// ─────────────────────────────────────────
const steps = {
  intro:      document.getElementById('step-intro'),
  mood:       document.getElementById('step-mood'),
  situation:  document.getElementById('step-situation'),
  mindset:    document.getElementById('step-mindset'),
  aiQuestion: document.getElementById('step-ai-question'),
  answer:     document.getElementById('step-answer')
};

const tabs = {
  ask:       document.getElementById('tab-ask'),
  community: document.getElementById('tab-community')
};

// 탭 버튼 및 커뮤니티
const tabBtnAsk          = document.getElementById('tab-btn-ask');
const tabBtnCommunity    = document.getElementById('tab-btn-community');
const communityLock      = document.getElementById('community-lock');
const communityActive    = document.getElementById('community-active');
const btnGoAsk           = document.getElementById('btn-go-ask');
const filterLatest       = document.getElementById('filter-latest');
const filterLikes        = document.getElementById('filter-likes');
const communityPostsList = document.getElementById('community-posts-list');
const btnGlobalHome      = document.getElementById('btn-global-home');
const btnAdminAuth       = document.getElementById('btn-admin-auth');

// STEP 버튼
const btnStartIntro     = document.getElementById('btn-start-intro');
const btnNextMood       = document.getElementById('btn-next-mood');
const btnBackMood       = document.getElementById('btn-back-mood');
const btnNextSituation  = document.getElementById('btn-next-situation');
const btnBackSituation  = document.getElementById('btn-back-situation');
const btnBackMindset    = document.getElementById('btn-back-mindset');
const btnSubmitAnswer   = document.getElementById('btn-submit-answer');

// STEP 4 DOM
const shareConsentCheckbox = document.getElementById('share-consent-checkbox');
const userAnswerInput      = document.getElementById('user-answer-input');
const answerCharCurrent    = document.getElementById('answer-char-current');
const aiQuestionLoading    = document.getElementById('ai-question-loading');
const aiQuestionContent    = document.getElementById('ai-question-content');
const aiQuestionText       = document.getElementById('ai-question-text');

// 답변 화면
const answerAvatarImg       = document.getElementById('answer-avatar-img');
const answerPhilosopherName = document.getElementById('answer-philosopher-name');
const answerPhilosopherKo   = document.getElementById('answer-philosopher-ko');
const doctrineGreek         = document.getElementById('doctrine-greek');
const doctrineEn            = document.getElementById('doctrine-en');
const recapQuestion         = document.getElementById('recap-question');
const answerLoading         = document.getElementById('answer-loading');
const answerContent         = document.getElementById('answer-content');
const answerText            = document.getElementById('answer-text');
const answerError           = document.getElementById('answer-error');
const errorMessage          = document.getElementById('error-message');
const answerActions         = document.getElementById('answer-actions');
const btnRestart            = document.getElementById('btn-restart');
const btnBackPhilosopher    = document.getElementById('btn-back-philosopher');

// 전환 영상
const videoTransition           = document.getElementById('video-transition');
const transitionVideoIn         = document.getElementById('transition-video-in');
const transitionVideoOut        = document.getElementById('transition-video-out');
const transitionLoading         = document.getElementById('transition-loading');
const transitionLoadingSentence = document.getElementById('transition-loading-sentence');

/* 모션 환경설정 */
const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const delay = ms => new Promise(r => setTimeout(r, ms));

/* 한국어 주격조사 */
function subjectParticle(name) {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xAC00 || code > 0xD7A3) return '이';
  return (code - 0xAC00) % 28 === 0 ? '가' : '이';
}

// ─────────────────────────────────────────
// 초기화
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED_POSTS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LIKED_POSTS, JSON.stringify([]));
  }
  updateLockState();

  // 모든 옵션 카드에 손그림 체크 SVG 주입 (선택 시 스트로크 드로우)
  document.querySelectorAll('.option-card').forEach(card => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'card-check');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path d="M4 13 L10 19 L20 5" pathLength="1"/>';
    card.appendChild(svg);
  });
});

// ─────────────────────────────────────────
// 상태 리셋
// ─────────────────────────────────────────
function resetState() {
  state.mood              = null;
  state.theme             = '일';
  state.situation         = null;
  state.mindset           = null;
  state.philosopher       = null;
  state.generatedQuestion = null;
  state.userAnswer        = '';
  state.shareConsent      = false;

  document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));

  // 탭 & 패널 초기화 (일 탭으로)
  document.querySelectorAll('.situation-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.tab-panel').forEach((p, i) => p.classList.toggle('active', i === 0));

  if (btnNextMood)       btnNextMood.disabled      = true;
  if (btnNextSituation)  btnNextSituation.disabled = true;
  if (userAnswerInput)   userAnswerInput.value      = '';
  if (answerCharCurrent) answerCharCurrent.textContent = '0';
  if (shareConsentCheckbox) shareConsentCheckbox.checked = false;

  // ai-question step 초기 상태 리셋
  if (aiQuestionLoading)  aiQuestionLoading.classList.remove('hidden');
  if (aiQuestionContent)  aiQuestionContent.classList.add('hidden');
}

// ─────────────────────────────────────────
// 탭 및 잠금 제어
// ─────────────────────────────────────────
function switchTab(tabName) {
  if (tabName === 'community' && !checkHasShared()) {
    alert('본인의 고민과 답변을 아고라 광장에 먼저 상정(공유)해야 아고라 입장이 가능합니다.');
    return;
  }
  state.currentTab = tabName;
  Object.keys(tabs).forEach(name => tabs[name].classList.toggle('active', name === tabName));

  if (tabName === 'ask') {
    tabBtnAsk.classList.add('active');
    tabBtnCommunity.classList.remove('active');
  } else {
    tabBtnAsk.classList.remove('active');
    tabBtnCommunity.classList.add('active');
    updateLockState();
    if (checkHasShared()) loadCommunityPosts();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkHasShared() {
  return sessionStorage.getItem(LOCAL_STORAGE_KEYS.HAS_SHARED) === 'true';
}

function updateLockState() {
  const shared = checkHasShared();
  communityLock.classList.toggle('hidden', shared);
  communityActive.classList.toggle('hidden', !shared);
}

tabBtnAsk.addEventListener('click',       () => switchTab('ask'));
tabBtnCommunity.addEventListener('click', () => switchTab('community'));
btnGoAsk.addEventListener('click',        () => switchTab('ask'));

// 홈 버튼
btnGlobalHome.addEventListener('click', () => {
  resetState();
  if (state.currentTab !== 'ask') switchTab('ask');
  showStep('intro');
});

// 관리자 인증
if (btnAdminAuth) {
  btnAdminAuth.addEventListener('click', async () => {
    const pw = prompt('관리자 비밀번호를 입력하십시오:');
    if (!pw) return;
    const testRes = await fetch('/api/posts/__auth_check__', {
      method: 'DELETE',
      headers: { 'x-admin-password': pw }
    });
    if (testRes.status === 403) { alert('비밀번호가 올바르지 않습니다.'); return; }
    state.isAdmin = true;
    state.adminPassword = pw;
    alert('관리자 권한이 인증되었습니다.');
    loadCommunityPosts();
  });
}

// ─────────────────────────────────────────
// 스텝 전환
// ─────────────────────────────────────────
const STEP_ORDER    = { intro: 0, mood: 1, situation: 2, mindset: 3, aiQuestion: 4, answer: 5 };
const STEP_PROGRESS = { mood: { from: 0, to: 33 }, situation: { from: 33, to: 66 }, mindset: { from: 66, to: 100 } };
let currentStepName    = 'intro';
let stepTransitioning  = false;

function animateProgress(name) {
  const prog = STEP_PROGRESS[name];
  if (!prog) return;
  const bar = steps[name].querySelector('.step-progress-bar');
  if (!bar) return;

  if (PREFERS_REDUCED) {
    bar.style.width = prog.to + '%';
    return;
  }
  bar.style.transition = 'none';
  bar.style.width = prog.from + '%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bar.style.transition = '';
    bar.style.width = prog.to + '%';
  }));
}

function showStep(name) {
  if (stepTransitioning) return;

  const prev = currentStepName;
  const prevEl = steps[prev];

  const finishEnter = (enterClass) => {
    Object.values(steps).forEach(el =>
      el.classList.remove('active', 'leaving-fwd', 'leaving-back', 'enter-fwd', 'enter-back'));
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (name === 'intro') {
      document.body.style.overflow = 'hidden';
      document.body.style.height   = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height   = '';
    }

    steps[name].classList.add('active');
    if (enterClass) steps[name].classList.add(enterClass);

    if (name !== 'answer') resetPillarParallax();
    animateProgress(name);
  };

  currentStepName = name;

  // 인트로 진출입, 답변 화면(비디오 트랜지션이 덮음), 동일 스텝 재진입은 퇴장 생략
  const skipExit = PREFERS_REDUCED || prev === name || prev === 'intro' || name === 'intro' ||
                   name === 'answer' || !prevEl || !prevEl.classList.contains('active');

  if (skipExit) {
    finishEnter(name === 'answer' || name === 'intro' ? null : 'enter-fwd');
    return;
  }

  const fwd = (STEP_ORDER[name] ?? 0) > (STEP_ORDER[prev] ?? 0);
  stepTransitioning = true;
  prevEl.classList.add(fwd ? 'leaving-fwd' : 'leaving-back');

  setTimeout(() => {
    stepTransitioning = false;
    finishEnter(fwd ? 'enter-fwd' : 'enter-back');
  }, 220);
}

// ─────────────────────────────────────────
// STEP 0: 인트로
// ─────────────────────────────────────────
if (btnStartIntro) {
  btnStartIntro.addEventListener('click', () => showStep('mood'));
}

// ─────────────────────────────────────────
// STEP 1: 기분 선택
// ─────────────────────────────────────────
document.querySelectorAll('#mood-options .option-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('#mood-options .option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.mood = card.dataset.value;
    btnNextMood.disabled = false;
  });
});

btnNextMood.addEventListener('click', () => showStep('situation'));
btnBackMood.addEventListener('click', () => showStep('mood'));

// ─────────────────────────────────────────
// STEP 2: 상황 선택 (탭)
// ─────────────────────────────────────────
// 탭 전환 (표시 전환만)
document.querySelectorAll('.situation-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.situation-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.tab-panel[data-panel="${tab.dataset.tab}"]`).classList.add('active');
  });
});

// 상황 옵션 선택 (모든 탭 패널 통합)
document.querySelectorAll('#step-situation .option-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('#step-situation .option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.situation = card.dataset.value;
    state.theme     = card.closest('.tab-panel').dataset.panel;
    btnNextSituation.disabled = false;
  });
});

btnNextSituation.addEventListener('click', () => showStep('mindset'));
btnBackSituation.addEventListener('click', () => showStep('situation'));

// ─────────────────────────────────────────
// STEP 3: 사고방식 선택 → 철학자 결정 + AI 질문 생성
// ─────────────────────────────────────────
document.querySelectorAll('#mindset-options .option-card').forEach(card => {
  card.addEventListener('click', async () => {
    document.querySelectorAll('#mindset-options .option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    state.mindset    = card.dataset.value;
    state.philosopher = card.dataset.philosopher;

    // AI 질문 생성 단계로 이동 (로딩 상태)
    aiQuestionLoading.classList.remove('hidden');
    aiQuestionContent.classList.add('hidden');
    showStep('aiQuestion');

    // 로더 깜빡임 방지 — 최소 노출 시간 보장
    const minWait = PREFERS_REDUCED ? Promise.resolve() : delay(700);

    try {
      const fetchPromise = fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood:      state.mood,
          theme:     state.theme,
          situation: state.situation,
          mindset:   state.mindset
        })
      });
      const [res] = await Promise.all([fetchPromise, minWait]);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '질문 생성 실패');

      revealAiQuestion(data.question);
    } catch (err) {
      await minWait;
      revealAiQuestion('지금 이 순간, 가장 솔직하게 느끼는 감정은 무엇인가요?');
    }
  });
});

// 질문을 단어 단위 "잉크 번짐"으로 공개
function revealAiQuestion(question) {
  state.generatedQuestion = question;
  aiQuestionText.innerHTML = question
    .split(' ')
    .filter(w => w)
    .map((w, i) => `<span class="q-word" style="animation-delay:${300 + i * 90}ms">${escapeHTML(w)}</span>`)
    .join(' ');

  aiQuestionLoading.classList.add('hidden');
  aiQuestionContent.classList.remove('hidden');
}

btnBackMindset.addEventListener('click', () => {
  state.generatedQuestion = null;
  aiQuestionLoading.classList.remove('hidden');
  aiQuestionContent.classList.add('hidden');
  showStep('mindset');
});

// ─────────────────────────────────────────
// STEP 4: 짧은 답변 + 제출
// ─────────────────────────────────────────
if (userAnswerInput) {
  userAnswerInput.addEventListener('input', () => {
    answerCharCurrent.textContent = userAnswerInput.value.length;
  });
}

if (shareConsentCheckbox) {
  shareConsentCheckbox.addEventListener('change', () => {
    state.shareConsent = shareConsentCheckbox.checked;
  });
}

btnSubmitAnswer.addEventListener('click', () => {
  state.userAnswer   = userAnswerInput ? userAnswerInput.value.trim() : '';
  state.shareConsent = shareConsentCheckbox ? shareConsentCheckbox.checked : false;
  playTransitionIn();
});

// ─────────────────────────────────────────
// 전환 영상 제어
// ─────────────────────────────────────────
function hideVideoTransition(cb) {
  transitionVideoIn.classList.remove('visible');
  transitionVideoOut.classList.remove('visible');
  videoTransition.classList.remove('fade-in');
  setTimeout(() => {
    videoTransition.classList.add('hidden');
    transitionVideoIn.src  = '';
    transitionVideoOut.src = '';
    if (cb) cb();
  }, 200);
}

function playTransitionIn() {
  const meta     = philosopherMeta[state.philosopher];
  const particle = subjectParticle(meta.ko);
  transitionLoadingSentence.innerHTML = `${meta.ko}${particle}<br>생각 중입니다`;

  transitionVideoIn.classList.remove('visible');
  transitionVideoOut.classList.remove('visible');
  transitionLoading.classList.remove('visible');
  videoTransition.classList.remove('hidden');

  const apiPromise = fetchAnswerData();
  let apiResult  = null;
  let videoEnded = false;

  apiPromise.then(result => {
    apiResult = result;
    if (videoEnded) playTransitionOut(result);
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    videoTransition.classList.add('fade-in');
  }));

  setTimeout(() => {
    transitionVideoIn.src = '/videos/In.mp4';
    transitionVideoIn.load();
    transitionVideoIn.play().then(() => {
      transitionVideoIn.classList.add('visible');
      transitionVideoOut.src = '/videos/out.mp4';
      transitionVideoOut.load();
    }).catch(() => {
      hideVideoTransition(() => apiPromise.then(r => showAnswerWithResult(r)));
    });
  }, 200);

  transitionVideoIn.onended = () => {
    videoEnded = true;
    if (apiResult !== null) {
      playTransitionOut(apiResult);
    } else {
      transitionLoading.classList.add('visible');
    }
  };
}

function playTransitionOut(result) {
  transitionLoading.classList.remove('visible');

  setTimeout(() => {
    transitionVideoOut.play().then(() => {
      transitionVideoOut.classList.add('visible');
      transitionVideoIn.classList.remove('visible');
    }).catch(() => {
      hideVideoTransition(() => showAnswerWithResult(result));
    });

    transitionVideoOut.onended = () => {
      showAnswerWithResult(result);
      hideVideoTransition();
    };
  }, 200);
}

// ─────────────────────────────────────────
// API 호출 및 답변 화면 구성
// ─────────────────────────────────────────
async function fetchAnswerData() {
  try {
    const res  = await fetch('/api/ask', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        mood:              state.mood,
        theme:             state.theme,
        situation:         state.situation,
        mindset:           state.mindset,
        philosopher:       state.philosopher,
        generatedQuestion: state.generatedQuestion,
        userAnswer:        state.userAnswer,
        shareConsent:      state.shareConsent
      })
    });
    const data = await res.json();
    return { ok: res.ok, data, shareConsent: state.shareConsent };
  } catch (err) {
    return { ok: false, data: { error: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' }, shareConsent: state.shareConsent };
  }
}

function showAnswerWithResult({ ok, data, shareConsent }) {
  const meta = philosopherMeta[state.philosopher];

  answerAvatarImg.src               = meta.avatar;
  answerAvatarImg.alt               = meta.ko;
  answerPhilosopherName.textContent = meta.en;
  answerPhilosopherKo.textContent   = meta.ko;
  doctrineGreek.textContent         = meta.docGreek;
  doctrineEn.textContent            = meta.docEn;

  const recapText = state.generatedQuestion +
    (state.userAnswer ? `\n\n→ ${state.userAnswer}` : '');
  recapQuestion.textContent = recapText;

  const headerWrapper = document.querySelector('.answer-header-wrapper');
  const recapBox      = document.querySelector('.question-recap');
  headerWrapper.classList.remove('anim-in');
  recapBox.classList.remove('anim-in');
  void headerWrapper.offsetWidth;

  answerLoading.classList.add('hidden');
  answerContent.classList.add('hidden');
  answerContent.classList.remove('anim-slide');
  answerError.classList.add('hidden');
  answerActions.classList.add('hidden');
  answerActions.classList.remove('anim-in');
  answerText.innerHTML = '';

  showStep('answer');

  requestAnimationFrame(() => {
    headerWrapper.classList.add('anim-in');
    recapBox.classList.add('anim-in');
  });

  if (!ok) {
    errorMessage.textContent = data.error || '오류가 발생했습니다.';
    answerError.classList.remove('hidden');
    answerActions.style.opacity = '0';
    answerActions.classList.remove('hidden');
    requestAnimationFrame(() => {
      answerActions.style.opacity = '';
      answerActions.classList.add('anim-in');
    });
    return;
  }

  const AVATAR_DELAY = 420;
  const WORD_DELAY   = 32;

  function parseAnswerTokens(text) {
    const tokens = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        text.slice(lastIndex, match.index).split(' ').filter(w => w).forEach(w => tokens.push({ word: w, bold: false }));
      }
      match[1].split(' ').filter(w => w).forEach(w => tokens.push({ word: w, bold: true }));
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      text.slice(lastIndex).split(' ').filter(w => w).forEach(w => tokens.push({ word: w, bold: false }));
    }
    return tokens;
  }

  setTimeout(() => {
    const tokens = parseAnswerTokens(data.answer);
    answerText.innerHTML = tokens
      .map((t, i) => {
        const safe  = escapeHTML(t.word);
        const inner = t.bold ? `<strong>${safe}</strong>` : safe;
        return `<span class="answer-word" style="animation-delay:${i * WORD_DELAY}ms">${inner}</span>`;
      })
      .join(' ');

    answerContent.style.opacity = '0';
    answerContent.classList.remove('hidden');
    requestAnimationFrame(() => {
      answerContent.style.opacity = '';
      answerContent.classList.add('anim-slide');
      answerText.querySelectorAll('.answer-word').forEach(span => span.classList.add('anim-in'));
    });

    if (shareConsent) {
      sessionStorage.setItem(LOCAL_STORAGE_KEYS.HAS_SHARED, 'true');
      updateLockState();
    }

    const actionDelay = Math.min(tokens.length * WORD_DELAY + 400, 2500);
    setTimeout(() => {
      answerActions.style.opacity = '0';
      answerActions.classList.remove('hidden');
      requestAnimationFrame(() => {
        answerActions.style.opacity = '';
        answerActions.classList.add('anim-in');
      });
    }, actionDelay);
  }, AVATAR_DELAY);
}

// ─────────────────────────────────────────
// 답변 화면 액션
// ─────────────────────────────────────────
btnRestart.addEventListener('click', () => {
  resetState();
  showStep('mood');
});

btnBackPhilosopher.addEventListener('click', () => {
  resetState();
  showStep('intro');
});

// ─────────────────────────────────────────
// 커뮤니티 데이터 조회 및 렌더링
// ─────────────────────────────────────────
filterLatest.addEventListener('click', () => {
  if (state.postsSortBy === 'latest') return;
  state.postsSortBy = 'latest';
  filterLatest.classList.add('active');
  filterLikes.classList.remove('active');
  loadCommunityPosts();
});

filterLikes.addEventListener('click', () => {
  if (state.postsSortBy === 'likes') return;
  state.postsSortBy = 'likes';
  filterLikes.classList.add('active');
  filterLatest.classList.remove('active');
  loadCommunityPosts();
});

async function loadCommunityPosts() {
  try {
    communityPostsList.innerHTML = `
      <div class="answer-loading">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <p>글을 불러오는 중...</p>
      </div>`;

    const res   = await fetch(`/api/posts?sortBy=${state.postsSortBy}`);
    const posts = await res.json();
    if (!res.ok) throw new Error(posts.error || '커뮤니티 목록을 불러오지 못했습니다.');

    if (posts.length === 0) {
      communityPostsList.innerHTML = `
        <div class="community-placeholder-card">
          <div class="lock-icon">🕊️</div>
          <h3 class="placeholder-title">아직 등록된 고민이 없습니다</h3>
          <p class="placeholder-desc">첫 번째 고민의 주인공이 되어 지혜를 나눠보세요.</p>
        </div>`;
      return;
    }

    const likedPosts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED_POSTS) || '[]');
    communityPostsList.innerHTML = '';

    posts.forEach(post => {
      const isLiked   = likedPosts.includes(post.id);
      const meta      = philosopherMeta[post.philosopher] || { ko: post.philosopher, en: '', avatar: '/images/epicurus.png' };
      const deleteBtn = state.isAdmin
        ? `<button class="btn-delete-post" data-id="${post.id}">🗑️ 삭제</button>` : '';

      const card = document.createElement('div');
      card.className = 'post-card';
      card.innerHTML = `
        <div class="post-header">
          <div class="post-philosopher-avatar"><img src="${meta.avatar}" alt="${meta.ko}" /></div>
          <div class="post-meta">
            <span class="post-philo-name">${meta.ko}의 시선</span>
            <span class="post-date">${formatRelativeTime(post.createdAt)}</span>
          </div>
          ${deleteBtn}
        </div>
        <div class="post-question-container">
          <div class="post-question">" ${escapeHTML(post.question)} "</div>
          <div class="accordion-bar"><span class="accordion-toggle">답변 보기 ▾</span></div>
        </div>
        <div class="post-answer">${escapeHTML(post.answer)}</div>
        <div class="post-footer">
          <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${post.id}">
            <span class="heart-icon">${isLiked ? '❤️' : '🤍'}</span>
            <span class="like-count">${post.likes}</span> 공감
          </button>
        </div>`;

      const toggleSpan = card.querySelector('.accordion-toggle');
      card.querySelector('.post-question-container').addEventListener('click', () => {
        card.classList.toggle('open');
        toggleSpan.textContent = card.classList.contains('open') ? '답변 닫기 ▴' : '답변 보기 ▾';
      });

      if (state.isAdmin) {
        const btn = card.querySelector('.btn-delete-post');
        if (btn) btn.addEventListener('click', e => {
          e.stopPropagation();
          if (confirm('이 포스트를 정말 영구 삭제하시겠습니까?')) deletePost(post.id, card);
        });
      }

      card.querySelector('.like-btn').addEventListener('click', function() {
        handleLikeClick(this, post.id);
      });

      communityPostsList.appendChild(card);
    });

  } catch (err) {
    communityPostsList.innerHTML = `
      <div class="answer-error" style="text-align:center;">
        <p>${err.message || '데이터를 가져오는 도중 연결 오류가 발생했습니다.'}</p>
      </div>`;
  }
}

async function handleLikeClick(btn, postId) {
  const likedPosts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED_POSTS) || '[]');
  if (likedPosts.includes(postId)) { alert('이미 공감한 게시글입니다.'); return; }

  try {
    const res  = await fetch(`/api/posts/${postId}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '공감 요청 오류');

    likedPosts.push(postId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LIKED_POSTS, JSON.stringify(likedPosts));
    btn.classList.add('liked');
    btn.querySelector('.heart-icon').textContent = '❤️';
    btn.querySelector('.like-count').textContent = data.likes;
  } catch (err) {
    console.error('좋아요 실패:', err);
    alert('공감 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

async function deletePost(postId, cardElement) {
  try {
    const res  = await fetch(`/api/posts/${postId}`, { method: 'DELETE', headers: { 'x-admin-password': state.adminPassword } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '삭제 처리 중 문제가 발생했습니다.');

    alert('성공적으로 삭제되었습니다.');
    cardElement.style.opacity   = '0';
    cardElement.style.transform = 'translateY(10px)';
    setTimeout(() => {
      cardElement.remove();
      if (communityPostsList.children.length === 0) loadCommunityPosts();
    }, 300);
  } catch (err) {
    console.error('포스트 삭제 실패:', err);
    alert(err.message || '삭제 처리에 실패했습니다.');
  }
}

// ─────────────────────────────────────────
// 유틸리티
// ─────────────────────────────────────────
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

function formatRelativeTime(dateString) {
  const now     = new Date();
  const date    = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);

  if (diffSec < 60)  return '방금 전';
  if (diffMin < 60)  return `${diffMin}분 전`;
  if (diffHr  < 24)  return `${diffHr}시간 전`;
  if (diffDay < 7)   return `${diffDay}일 전`;
  return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;
}

// ─────────────────────────────────────────
// 기둥 패럴랙스 (step-answer 스크롤 시)
// ─────────────────────────────────────────
const pillarLeftImg  = document.querySelector('.side-pillar--left img');
const pillarRightImg = document.querySelector('.side-pillar--right img');

function updatePillarParallax() {
  if (!steps.answer.classList.contains('active')) return;

  const scrollY  = window.scrollY || document.documentElement.scrollTop;
  const pillarEl = document.querySelector('.side-pillar');
  const pillarH  = pillarEl ? pillarEl.offsetHeight : window.innerHeight;
  const extraH   = pillarH * 0.20;
  const factor   = 0.35;

  let ty = -(scrollY * factor);
  ty = Math.max(-extraH, Math.min(0, ty));

  if (pillarLeftImg)  pillarLeftImg.style.transform  = `scaleX(-1) translateY(${ty}px)`;
  if (pillarRightImg) pillarRightImg.style.transform = `translateY(${ty}px)`;
}

function resetPillarParallax() {
  if (pillarLeftImg)  pillarLeftImg.style.transform  = '';
  if (pillarRightImg) pillarRightImg.style.transform = '';
}

window.addEventListener('scroll', updatePillarParallax, { passive: true });
