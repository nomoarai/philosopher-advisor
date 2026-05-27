// ─────────────────────────────────────────
// 상태 및 설정
// ─────────────────────────────────────────
const state = {
  question: '',
  philosopher: null,
  shareConsent: false,
  currentTab: 'ask',
  postsSortBy: 'latest',
  isAdmin: false
};

const philosopherMeta = {
  epicurus:     { en: 'Epicurus',     ko: '에피쿠로스',     avatar: '/images/epicurus@2x.png' },
  plato:        { en: 'Plato',        ko: '플라톤',         avatar: '/images/plato@2x.png' },
  aristoteles:  { en: 'Aristoteles',  ko: '아리스토텔레스', avatar: '/images/aristoteles@2x.png' },
  heraclitus:   { en: 'Heraclitus',   ko: '헤라클리투스',  avatar: '/images/heraclitus@2x.png' },
  socrates:     { en: 'Socrates',     ko: '소크라테스',     avatar: '/images/socrates@2x.png' }
};

const LOCAL_STORAGE_KEYS = {
  HAS_SHARED:  'philosopher_advisor_has_shared',
  LIKED_POSTS: 'philosopher_advisor_liked_posts'
};

// ─────────────────────────────────────────
// DOM 참조
// ─────────────────────────────────────────
const steps = {
  intro:       document.getElementById('step-intro'),
  question:    document.getElementById('step-question'),
  philosopher: document.getElementById('step-philosopher'),
  answer:      document.getElementById('step-answer')
};

const tabs = {
  ask:       document.getElementById('tab-ask'),
  community: document.getElementById('tab-community')
};

const btnStartIntro = document.getElementById('btn-start-intro');

// 입력 폼
const questionInput        = document.getElementById('question-input');
const charCurrent          = document.getElementById('char-current');
const shareConsentCheckbox = document.getElementById('share-consent-checkbox');
const btnNextStep          = document.getElementById('btn-next-step');

// 이동 버튼
const btnBackQuestion    = document.getElementById('btn-back-question');
const btnBackPhilosopher = document.getElementById('btn-back-philosopher');

// 답변 화면
const answerAvatarImg       = document.getElementById('answer-avatar-img');
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

// 탭 버튼 및 커뮤니티 구조
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

// 연필 스택 DOM
const pencilStack   = document.getElementById('pencil-stack');
const pencilHintBar = document.getElementById('pencil-hint-bar');
const pencilItems   = document.querySelectorAll('.pencil-item');

// ─────────────────────────────────────────
// 초기화
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED_POSTS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LIKED_POSTS, JSON.stringify([]));
  }
  updateLockState();
});

// ─────────────────────────────────────────
// 탭 및 잠금 제어
// ─────────────────────────────────────────
function switchTab(tabName) {
  if (tabName === 'community' && !checkHasShared()) {
    alert('본인의 고민과 답변을 아고라 광장에 먼저 상정(공유)해야 아고라 입장이 가능합니다.');
    return;
  }
  state.currentTab = tabName;

  Object.keys(tabs).forEach(name => {
    tabs[name].classList.toggle('active', name === tabName);
  });

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
  questionInput.value = '';
  charCurrent.textContent = '0';
  shareConsentCheckbox.checked = false;
  btnNextStep.disabled = true;
  state.question    = '';
  state.philosopher = null;
  state.shareConsent = false;
  if (state.currentTab !== 'ask') switchTab('ask');
  showStep('intro');
});

// 관리자 인증
if (btnAdminAuth) {
  btnAdminAuth.addEventListener('click', () => {
    const pw = prompt('관리자 비밀번호를 입력하십시오:');
    if (pw === 'lmnt3355') {
      state.isAdmin = true;
      alert('관리자 권한이 인증되었습니다.');
      loadCommunityPosts();
    } else if (pw !== null) {
      alert('비밀번호가 올바르지 않습니다.');
    }
  });
}

// ─────────────────────────────────────────
// 스텝 전환
// ─────────────────────────────────────────
function showStep(name) {
  Object.values(steps).forEach(el => el.classList.remove('active'));
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

  if (name === 'philosopher') {
    initPencilInteraction();
  } else {
    clearPencilHint();
  }
}

// ─────────────────────────────────────────
// STEP 0: 인트로
// ─────────────────────────────────────────
if (btnStartIntro) {
  btnStartIntro.addEventListener('click', () => showStep('question'));
}

// ─────────────────────────────────────────
// STEP 1: 질문 입력
// ─────────────────────────────────────────
questionInput.addEventListener('input', () => {
  charCurrent.textContent = questionInput.value.length;
  btnNextStep.disabled    = questionInput.value.trim().length < 5;
});

btnNextStep.addEventListener('click', () => {
  state.question      = questionInput.value.trim();
  state.shareConsent  = shareConsentCheckbox.checked;
  state.philosopher   = null;
  showStep('philosopher');
});

// ─────────────────────────────────────────
// STEP 2: 연필 드래그 선택
// ─────────────────────────────────────────
btnBackQuestion.addEventListener('click', () => showStep('question'));

const PULL_THRESHOLD = 80; // px — 이 이상 당기면 선택 확정

let activePencilEl   = null;
let pencilDragStartX = 0;
let isPencilDragging = false;
let pencilHintTimer  = null;

/* 연필 스택 진입 시 초기화 & 페이드인 애니메이션 */
function initPencilInteraction() {
  // 모든 연필 화면 왼쪽 바깥으로 즉시 리셋
  pencilItems.forEach(item => {
    item.style.transition = 'none';
    item.style.transform  = 'translateX(-110vw)';
    item.style.opacity    = '1';
    item.classList.remove('dragging', 'hint-wiggle');
  });

  // 스태거 슬라이드인 (왼쪽→오른쪽, 차례대로)
  pencilItems.forEach((item, i) => {
    setTimeout(() => {
      item.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
      item.style.transform  = 'translateX(0)';
    }, 60 + i * 100);
  });

  // 힌트 바 복원
  if (pencilHintBar) {
    pencilHintBar.style.opacity       = '1';
    pencilHintBar.style.pointerEvents = '';
  }

  // 2초 후 중간 연필(아리스토텔레스) 힌트 흔들기
  if (pencilHintTimer) clearTimeout(pencilHintTimer);
  pencilHintTimer = setTimeout(() => {
    const target = pencilItems[2];
    if (target && !isPencilDragging) {
      // 힌트 실행 중에는 transition 없애야 CSS animation이 동작
      target.style.transition = '';
      target.style.transform  = '';
      target.classList.add('hint-wiggle');
      target.addEventListener('animationend', () => {
        target.classList.remove('hint-wiggle');
      }, { once: true });
    }
  }, 2000);
}

/* 힌트 타이머 정리 & 힌트 바 페이드아웃 */
function clearPencilHint() {
  if (pencilHintTimer) {
    clearTimeout(pencilHintTimer);
    pencilHintTimer = null;
  }
  if (pencilHintBar) {
    pencilHintBar.style.opacity       = '0';
    pencilHintBar.style.pointerEvents = 'none';
  }
}

/* 철학자 선택 확정: 선택된 연필은 유지, 나머지는 왼쪽으로 슬라이드아웃 */
function selectPhilosopher(philosopher, pencilEl) {
  clearPencilHint();

  const others = [...pencilItems].filter(item => item !== pencilEl);
  others.forEach((item, i) => {
    setTimeout(() => {
      item.style.transition = 'transform 0.35s cubic-bezier(0.55, 0, 0.8, 1)';
      item.style.transform  = 'translateX(-110vw)';
    }, i * 60);
  });

  const delay = 60 * (others.length - 1) + 350;
  setTimeout(() => {
    state.philosopher = philosopher;
    loadAnswer();
  }, delay);
}

/* 드래그 이벤트 — 각 연필 아이템 */
pencilItems.forEach(item => {
  // 터치 시작
  item.addEventListener('touchstart', e => {
    activePencilEl   = item;
    pencilDragStartX = e.touches[0].clientX;
    isPencilDragging = true;
    item.classList.add('dragging');
    item.style.transition = 'none';
    clearPencilHint();
  }, { passive: true });

  // 마우스 다운
  item.addEventListener('mousedown', e => {
    activePencilEl   = item;
    pencilDragStartX = e.clientX;
    isPencilDragging = true;
    item.classList.add('dragging');
    item.style.transition = 'none';
    clearPencilHint();
    e.preventDefault(); // 텍스트 선택 방지
  });
});

/* 드래그 이동 — window에서 캡처 */
window.addEventListener('touchmove', e => {
  if (!isPencilDragging || !activePencilEl) return;
  const deltaX = e.touches[0].clientX - pencilDragStartX;
  if (deltaX > 0) {
    // PULL_THRESHOLD 이후 저항감 (느리게 이동)
    let tx = deltaX > PULL_THRESHOLD
      ? PULL_THRESHOLD + (deltaX - PULL_THRESHOLD) * 0.35
      : deltaX;
    // 오른쪽 화면 끝(25vw)을 넘지 않도록 제한
    const maxTx = window.innerWidth * 0.25;
    tx = Math.min(tx, maxTx);
    activePencilEl.style.transform = `translateX(${tx}px)`;
  } else {
    activePencilEl.style.transform = 'translateX(0)';
  }
}, { passive: true });

window.addEventListener('mousemove', e => {
  if (!isPencilDragging || !activePencilEl) return;
  const deltaX = e.clientX - pencilDragStartX;
  if (deltaX > 0) {
    let tx = deltaX > PULL_THRESHOLD
      ? PULL_THRESHOLD + (deltaX - PULL_THRESHOLD) * 0.35
      : deltaX;
    // 오른쪽 화면 끝(25vw)을 넘지 않도록 제한
    const maxTx = window.innerWidth * 0.25;
    tx = Math.min(tx, maxTx);
    activePencilEl.style.transform = `translateX(${tx}px)`;
  } else {
    activePencilEl.style.transform = 'translateX(0)';
  }
});

/* 드래그 종료 처리 */
function releasePencil(clientX) {
  if (!isPencilDragging || !activePencilEl) return;
  isPencilDragging = false;
  activePencilEl.classList.remove('dragging');

  const deltaX     = clientX - pencilDragStartX;
  const philosopher = activePencilEl.dataset.philosopher;
  const el          = activePencilEl;
  activePencilEl    = null;
  pencilDragStartX  = 0;

  if (deltaX >= PULL_THRESHOLD) {
    // 선택 확정
    selectPhilosopher(philosopher, el);
  } else {
    // 스냅백
    el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    el.style.transform  = 'translateX(0)';
    setTimeout(() => { el.style.transition = ''; }, 400);
  }
}

window.addEventListener('touchend', e => releasePencil(e.changedTouches[0].clientX));
window.addEventListener('mouseup',  e => releasePencil(e.clientX));

// ─────────────────────────────────────────
// STEP 3: 답변 로드
// ─────────────────────────────────────────
function loadAnswer() {
  const meta = philosopherMeta[state.philosopher];

  answerAvatarImg.src               = meta.avatar;
  answerAvatarImg.alt               = meta.ko;
  answerPhilosopherName.textContent = meta.en;
  answerPhilosopherKo.textContent   = meta.ko;
  recapQuestion.textContent         = state.question;

  answerLoading.classList.remove('hidden');
  answerContent.classList.add('hidden');
  answerError.classList.add('hidden');
  answerActions.classList.add('hidden');
  answerText.textContent = '';

  showStep('answer');
  fetchAnswer(state.question, state.philosopher, state.shareConsent);
}

async function fetchAnswer(question, philosopher, shareConsent) {
  try {
    const res  = await fetch('/api/ask', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ question, philosopher, shareConsent })
    });
    const data = await res.json();

    answerLoading.classList.add('hidden');

    if (!res.ok) {
      errorMessage.textContent = data.error || '오류가 발생했습니다.';
      answerError.classList.remove('hidden');
    } else {
      answerText.textContent = data.answer;
      answerContent.classList.remove('hidden');
      if (shareConsent) {
        sessionStorage.setItem(LOCAL_STORAGE_KEYS.HAS_SHARED, 'true');
        updateLockState();
      }
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
// 답변 화면 액션 버튼
// ─────────────────────────────────────────
btnBackPhilosopher.addEventListener('click', () => showStep('philosopher'));

btnRestart.addEventListener('click', () => {
  questionInput.value = '';
  charCurrent.textContent = '0';
  shareConsentCheckbox.checked = false;
  btnNextStep.disabled = true;
  state.question    = '';
  state.philosopher = null;
  state.shareConsent = false;
  showStep('question');
});

btnTryOther.addEventListener('click', () => showStep('philosopher'));

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
      const isLiked  = likedPosts.includes(post.id);
      const meta     = philosopherMeta[post.philosopher] || { ko: post.philosopher, en: '', avatar: '/images/epicurus@2x.png' };
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

      // 아코디언
      const toggleSpan = card.querySelector('.accordion-toggle');
      card.querySelector('.post-question-container').addEventListener('click', () => {
        card.classList.toggle('open');
        toggleSpan.textContent = card.classList.contains('open') ? '답변 닫기 ▴' : '답변 보기 ▾';
      });

      // 관리자 삭제
      if (state.isAdmin) {
        const btn = card.querySelector('.btn-delete-post');
        if (btn) btn.addEventListener('click', e => {
          e.stopPropagation();
          if (confirm('이 포스트를 정말 영구 삭제하시겠습니까?')) deletePost(post.id, card);
        });
      }

      // 공감
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
    btn.querySelector('.heart-icon').textContent  = '❤️';
    btn.querySelector('.like-count').textContent  = data.likes;
  } catch (err) {
    console.error('좋아요 실패:', err);
    alert('공감 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

async function deletePost(postId, cardElement) {
  try {
    const res  = await fetch(`/api/posts/${postId}`, { method: 'DELETE', headers: { 'x-admin-password': 'lmnt3355' } });
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
