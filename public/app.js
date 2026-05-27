// ─────────────────────────────────────────
// 상태 및 설정
// ─────────────────────────────────────────
const state = {
  question: '',
  philosopher: null,
  shareConsent: false,
  currentTab: 'ask',
  postsSortBy: 'latest',
  isAdmin: false,
  activePhiloIndex: 2 // 기본 아리스토텔레스
};

const philosopherList = ['epicurus', 'plato', 'aristoteles', 'heraclitus', 'socrates'];

const philosopherMeta = {
  epicurus:     { en: 'Epicurus',     ko: '에피쿠로스', avatar: '/images/epicurus@2x.png' },
  plato:        { en: 'Plato',        ko: '플라톤', avatar: '/images/plato@2x.png' },
  aristoteles:  { en: 'Aristoteles',  ko: '아리스토텔레스', avatar: '/images/aristoteles@2x.png' },
  heraclitus:   { en: 'Heraclitus',  ko: '헤라클리투스', avatar: '/images/heraclitus@2x.png' },
  socrates:     { en: 'Socrates',     ko: '소크라테스', avatar: '/images/socrates@2x.png' }
};

const LOCAL_STORAGE_KEYS = {
  HAS_SHARED: 'philosopher_advisor_has_shared',
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
  ask:         document.getElementById('tab-ask'),
  community:   document.getElementById('tab-community')
};

const btnStartIntro = document.getElementById('btn-start-intro');

// 입력 폼
const questionInput          = document.getElementById('question-input');
const charCurrent            = document.getElementById('char-current');
const shareConsentCheckbox   = document.getElementById('share-consent-checkbox');
const btnNextStep            = document.getElementById('btn-next-step');

// 이전/이후 이동 버튼
const btnBackQuestion        = document.getElementById('btn-back-question');
const btnBackPhilosopher     = document.getElementById('btn-back-philosopher');
const philosopherCards       = document.querySelectorAll('.philosopher-card');

// 답변 화면
const answerAvatarImg        = document.getElementById('answer-avatar-img');
const answerPhilosopherName  = document.getElementById('answer-philosopher-name');
const answerPhilosopherKo    = document.getElementById('answer-philosopher-ko');
const recapQuestion          = document.getElementById('recap-question');
const answerLoading          = document.getElementById('answer-loading');
const answerContent          = document.getElementById('answer-content');
const answerText             = document.getElementById('answer-text');
const answerError            = document.getElementById('answer-error');
const errorMessage           = document.getElementById('error-message');
const answerActions          = document.getElementById('answer-actions');
const btnRestart             = document.getElementById('btn-restart');
const btnTryOther            = document.getElementById('btn-try-other');

// 탭 버튼 및 커뮤니티 구조
const tabBtnAsk              = document.getElementById('tab-btn-ask');
const tabBtnCommunity        = document.getElementById('tab-btn-community');
const communityLock          = document.getElementById('community-lock');
const communityActive        = document.getElementById('community-active');
const btnGoAsk               = document.getElementById('btn-go-ask');
const filterLatest           = document.getElementById('filter-latest');
const filterLikes            = document.getElementById('filter-likes');
const communityPostsList     = document.getElementById('community-posts-list');
const btnGlobalHome          = document.getElementById('btn-global-home');
const btnAdminAuth           = document.getElementById('btn-admin-auth');

// 3D 캐러셀 DOM
const carouselStage          = document.getElementById('carousel-stage');
const carouselTrack          = document.getElementById('carousel-track');
const btnPrevCarousel        = document.getElementById('btn-prev-carousel');
const btnNextCarousel        = document.getElementById('btn-next-carousel');
const btnSelectPhilosopher   = document.getElementById('btn-select-philosopher');

// ─────────────────────────────────────────
// 초기화 작업
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 로컬스토리지 라이크 초기화
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED_POSTS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LIKED_POSTS, JSON.stringify([]));
  }
  updateLockState();
  updateCarousel();
});

// ─────────────────────────────────────────
// 탭 및 잠금 제어 로직
// ─────────────────────────────────────────
function switchTab(tabName) {
  if (tabName === 'community' && !checkHasShared()) {
    alert('본인의 고민과 답변을 아고라 광장에 먼저 상정(공유)해야 아고라 입장이 가능합니다.');
    return;
  }
  state.currentTab = tabName;
  
  // 탭 콘텐츠 토글
  Object.keys(tabs).forEach(name => {
    if (name === tabName) {
      tabs[name].classList.add('active');
    } else {
      tabs[name].classList.remove('active');
    }
  });

  // 네비게이션 버튼 토글
  if (tabName === 'ask') {
    tabBtnAsk.classList.add('active');
    tabBtnCommunity.classList.remove('active');
  } else {
    tabBtnAsk.classList.remove('active');
    tabBtnCommunity.classList.add('active');
    updateLockState();
    if (checkHasShared()) {
      loadCommunityPosts();
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkHasShared() {
  return sessionStorage.getItem(LOCAL_STORAGE_KEYS.HAS_SHARED) === 'true';
}

function updateLockState() {
  const shared = checkHasShared();
  if (shared) {
    communityLock.classList.add('hidden');
    communityActive.classList.remove('hidden');
  } else {
    communityLock.classList.remove('hidden');
    communityActive.classList.add('hidden');
  }
}

tabBtnAsk.addEventListener('click', () => switchTab('ask'));
tabBtnCommunity.addEventListener('click', () => switchTab('community'));
btnGoAsk.addEventListener('click', () => switchTab('ask'));

// 홈 플로팅 버튼 이벤트
btnGlobalHome.addEventListener('click', () => {
  questionInput.value = '';
  charCurrent.textContent = '0';
  shareConsentCheckbox.checked = false;
  btnNextStep.disabled = true;
  state.question = '';
  state.philosopher = null;
  state.shareConsent = false;
  
  if (state.currentTab !== 'ask') {
    switchTab('ask');
  }
  showStep('intro');
});

// 관리자 인증 버튼 이벤트
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
// 스텝 전환 헬퍼
// ─────────────────────────────────────────
function showStep(name) {
  // 모든 step 비활성화
  Object.values(steps).forEach(el => el.classList.remove('active'));

  // 즉시 최상단으로 스크롤
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // intro 진입 시 body 스크롤 차단, 그 외엔 해제
  if (name === 'intro') {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
  } else {
    document.body.style.overflow = '';
    document.body.style.height = '';
  }

  // 해당 step 활성화
  steps[name].classList.add('active');
}

// ─────────────────────────────────────────
// STEP 0: 인트로 랜딩 페이지
// ─────────────────────────────────────────
if (btnStartIntro) {
  btnStartIntro.addEventListener('click', () => {
    showStep('question');
  });
}

// ─────────────────────────────────────────
// STEP 1: 질문 입력 및 동의
// ─────────────────────────────────────────
questionInput.addEventListener('input', () => {
  const len = questionInput.value.trim().length;
  charCurrent.textContent = questionInput.value.length;
  btnNextStep.disabled = len < 5;
});

btnNextStep.addEventListener('click', () => {
  state.question = questionInput.value.trim();
  state.shareConsent = shareConsentCheckbox.checked;
  
  // 캐러셀 상태 초기화 (중앙: 아리스토텔레스)
  state.activePhiloIndex = 2;
  updateCarousel();
  state.philosopher = null;
  
  showStep('philosopher');
});

// ─────────────────────────────────────────
// STEP 2: 철학자 선택
// ─────────────────────────────────────────
btnBackQuestion.addEventListener('click', () => {
  showStep('question');
});

// ─────────────────────────────────────────
// 3D Carousel 렌더링 엔진
// ─────────────────────────────────────────
function updateCarousel() {
  philosopherCards.forEach((card, i) => {
    if (i === state.activePhiloIndex) {
      card.classList.add('active-card');
      card.style.transform = 'translate(-50%, -50%)';
      card.style.opacity = '1';
      card.style.visibility = 'visible';
    } else {
      card.classList.remove('active-card');
      card.style.opacity = '0';
      card.style.visibility = 'hidden';
    }
  });
}

// 이전/다음 수동 클릭 이벤트
if (btnPrevCarousel && btnNextCarousel) {
  btnPrevCarousel.addEventListener('click', () => {
    state.activePhiloIndex = (state.activePhiloIndex + 4) % 5;
    updateCarousel();
  });

  btnNextCarousel.addEventListener('click', () => {
    state.activePhiloIndex = (state.activePhiloIndex + 1) % 5;
    updateCarousel();
  });
}

// 중앙 카드를 탭하거나 선택 확인 버튼 클릭 시 조언 불러오기
if (btnSelectPhilosopher) {
  btnSelectPhilosopher.addEventListener('click', () => {
    state.philosopher = philosopherList[state.activePhiloIndex];
    loadAnswer();
  });
}

// 개별 카드 클릭 시 해당 카드를 중앙으로 포커스
philosopherCards.forEach((card, idx) => {
  card.addEventListener('click', (e) => {
    // 이미 중앙에 위치한 카드라면 바로 선택 활성화
    if (idx === state.activePhiloIndex) {
      state.philosopher = philosopherList[state.activePhiloIndex];
      loadAnswer();
    } else {
      state.activePhiloIndex = idx;
      updateCarousel();
    }
  });
});

// ─────────────────────────────────────────
// 스와이프 제스처 핸들링 (터치 & 드래그)
// ─────────────────────────────────────────
let swipeStartX = 0;
let swipeCurrentX = 0;
let isSwiping = false;

if (carouselStage) {
  // 모바일 터치 이벤트
  carouselStage.addEventListener('touchstart', (e) => {
    swipeStartX = e.touches[0].clientX;
    isSwiping = true;
  }, { passive: true });

  carouselStage.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    swipeCurrentX = e.touches[0].clientX;
  }, { passive: true });

  carouselStage.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;
    handleSwipeGesture();
  });

  // 데스크톱 마우스 드래그 이벤트
  carouselStage.addEventListener('mousedown', (e) => {
    swipeStartX = e.clientX;
    isSwiping = true;
    carouselStage.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isSwiping) return;
    swipeCurrentX = e.clientX;
  });

  window.addEventListener('mouseup', () => {
    if (!isSwiping) return;
    isSwiping = false;
    carouselStage.style.cursor = 'grab';
    handleSwipeGesture();
  });
}

function handleSwipeGesture() {
  const deltaX = swipeCurrentX - swipeStartX;
  const threshold = 50; // 스와이프 감지 기준 거리 (50px)
  
  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      // 오른쪽 스와이프 ➔ 이전 카드로
      state.activePhiloIndex = (state.activePhiloIndex + 4) % 5;
    } else {
      // 왼쪽 스와이프 ➔ 다음 카드로
      state.activePhiloIndex = (state.activePhiloIndex + 1) % 5;
    }
    updateCarousel();
  }
  
  // 리셋
  swipeStartX = 0;
  swipeCurrentX = 0;
}

// ─────────────────────────────────────────
// STEP 3: 답변 로드 및 통신
// ─────────────────────────────────────────
function loadAnswer() {
  const meta = philosopherMeta[state.philosopher];

  // 헤더 및 아바타 업데이트
  answerAvatarImg.src = meta.avatar;
  answerAvatarImg.alt = meta.ko;
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

  fetchAnswer(state.question, state.philosopher, state.shareConsent);
}

async function fetchAnswer(question, philosopher, shareConsent) {
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, philosopher, shareConsent })
    });

    const data = await res.json();

    answerLoading.classList.add('hidden');

    if (!res.ok) {
      errorMessage.textContent = data.error || '오류가 발생했습니다.';
      answerError.classList.remove('hidden');
    } else {
      answerText.textContent = data.answer;
      answerContent.classList.remove('hidden');
      
      // 만약 고민을 공유하기로 동의하고 받아왔다면, 세션스토리지에 저장하여 락 해제
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
// 액션 버튼 (답변 화면 내)
// ─────────────────────────────────────────
btnBackPhilosopher.addEventListener('click', () => {
  showStep('philosopher');
});

btnRestart.addEventListener('click', () => {
  questionInput.value = '';
  charCurrent.textContent = '0';
  shareConsentCheckbox.checked = false;
  btnNextStep.disabled = true;
  state.question = '';
  state.philosopher = null;
  state.shareConsent = false;
  showStep('question');
});

btnTryOther.addEventListener('click', () => {
  showStep('philosopher');
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
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
        <p>글을 불러오는 중...</p>
      </div>
    `;

    const res = await fetch(`/api/posts?sortBy=${state.postsSortBy}`);
    const posts = await res.json();

    if (!res.ok) {
      throw new Error(posts.error || '커뮤니티 목록을 불러오지 못했습니다.');
    }

    if (posts.length === 0) {
      communityPostsList.innerHTML = `
        <div class="community-placeholder-card">
          <div class="lock-icon">🕊️</div>
          <h3 class="placeholder-title">아직 등록된 고민이 없습니다</h3>
          <p class="placeholder-desc">첫 번째 고민의 주인공이 되어 지혜를 나눠보세요.</p>
        </div>
      `;
      return;
    }

    const likedPosts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED_POSTS) || '[]');
    communityPostsList.innerHTML = '';

    posts.forEach(post => {
      const isLiked = likedPosts.includes(post.id);
      const meta = philosopherMeta[post.philosopher] || { ko: post.philosopher, en: '', avatar: '/images/epicurus@2x.png' };
      
      const deleteBtnHtml = state.isAdmin
        ? `<button class="btn-delete-post" data-id="${post.id}">🗑️ 삭제</button>`
        : '';

      const card = document.createElement('div');
      card.className = 'post-card';
      card.innerHTML = `
        <div class="post-header">
          <div class="post-philosopher-avatar">
            <img src="${meta.avatar}" alt="${meta.ko}" />
          </div>
          <div class="post-meta">
            <span class="post-philo-name">${meta.ko}의 시선</span>
            <span class="post-date">${formatRelativeTime(post.createdAt)}</span>
          </div>
          ${deleteBtnHtml}
        </div>
        <!-- 클릭하여 여닫는 질문 영역 -->
        <div class="post-question-container">
          <div class="post-question">" ${escapeHTML(post.question)} "</div>
          <div class="accordion-bar">
            <span class="accordion-toggle">답변 보기 ▾</span>
          </div>
        </div>
        <!-- 아코디언으로 접힐 답변 영역 -->
        <div class="post-answer">${escapeHTML(post.answer)}</div>
        <div class="post-footer">
          <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${post.id}">
            <span class="heart-icon">${isLiked ? '❤️' : '🤍'}</span>
            <span class="like-count">${post.likes}</span> 공감
          </button>
        </div>
      `;

      // 아코디언 토글 이벤트 리스너 바인딩
      const questionContainer = card.querySelector('.post-question-container');
      const toggleSpan = card.querySelector('.accordion-toggle');
      questionContainer.addEventListener('click', () => {
        card.classList.toggle('open');
        if (card.classList.contains('open')) {
          toggleSpan.textContent = '답변 닫기 ▴';
        } else {
          toggleSpan.textContent = '답변 보기 ▾';
        }
      });

      // 관리자 삭제 버튼 이벤트 바인딩
      if (state.isAdmin) {
        const deleteBtn = card.querySelector('.btn-delete-post');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('이 포스트를 정말 영구 삭제하시겠습니까?')) {
              deletePost(post.id, card);
            }
          });
        }
      }

      // 공감 버튼 이벤트
      const likeBtn = card.querySelector('.like-btn');
      likeBtn.addEventListener('click', () => handleLikeClick(likeBtn, post.id));

      communityPostsList.appendChild(card);
    });

  } catch (err) {
    communityPostsList.innerHTML = `
      <div class="answer-error" style="text-align: center;">
        <p>${err.message || '데이터를 가져오는 도중 연결 오류가 발생했습니다.'}</p>
      </div>
    `;
  }
}

async function handleLikeClick(btn, postId) {
  const likedPosts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED_POSTS) || '[]');
  if (likedPosts.includes(postId)) {
    alert('이미 공감한 게시글입니다.');
    return;
  }

  try {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || '공감 요청 오류');
    }

    // 로컬 저장소 갱신
    likedPosts.push(postId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LIKED_POSTS, JSON.stringify(likedPosts));

    // UI 즉시 업데이트
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
    const res = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-password': 'lmnt3355'
      }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || '삭제 처리 중 문제가 발생했습니다.');
    }

    alert('성공적으로 삭제되었습니다.');
    cardElement.style.opacity = '0';
    cardElement.style.transform = 'translateY(10px)';
    setTimeout(() => {
      cardElement.remove();
      if (communityPostsList.children.length === 0) {
        loadCommunityPosts();
      }
    }, 300);

  } catch (err) {
    console.error('포스트 삭제 실패:', err);
    alert(err.message || '삭제 처리에 실패했습니다.');
  }
}

// ─────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  // 오래된 글은 일반 포맷으로
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}
