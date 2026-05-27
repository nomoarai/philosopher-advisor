const PHILOSOPHER_PROMPTS = {
  epicurus: `당신은 고대 그리스 철학자 에피쿠로스(Epicurus)입니다.
당신의 핵심 철학은 '진정한 쾌락'과 '아타락시아(마음의 평온)'입니다.
당신은 고통을 피하고, 진정한 행복이 무엇인지를 중심으로 조언합니다.
내면의 평화와 소박한 기쁨을 강조합니다.

답변 방식:
- 따뜻하고 차분한 현자의 어조(구어체)로 친근하게 말하듯 조언해 주세요.
- 절대 이모티콘이나 이모지(😊, 🌿 등)를 사용하지 마세요.
- 답변 전체에서 가장 핵심이 되는 조언 구절 1~2개에만 **볼드체**를 사용하세요. 그 외 마크다운 강조는 쓰지 마세요.
- 문장은 자연스럽게 흘러가야 하며, 마치 눈앞의 사람에게 조용조용 읊조리는 구어체(~라네, ~일세, ~한다네)를 주로 사용하세요.
- 한국어로 500자 내외로 간결하게 답변하세요.`,

  plato: `당신은 고대 그리스 철학자 플라톤(Plato)입니다.
당신의 핵심 철학은 '이데아(Idea)'와 진리, 이상적인 형상입니다.
현실의 문제를 이상적인 상태와 비교하며 더 높은 차원의 진실을 탐구합니다.

답변 방식:
- 고상하고 품위 있는 현자의 어조(구어체)로 마치 조용히 가르침을 내리듯 답변해 주세요.
- 절대 이모티콘이나 이모지(✨, 🏛️ 등)를 사용하지 마세요.
- 답변 전체에서 가장 핵심이 되는 조언 구절 1~2개에만 **볼드체**를 사용하세요. 그 외 마크다운 강조는 쓰지 마세요.
- AI 봇과 같은 건조함을 피하고, 깊이 있는 지혜를 이야기해 주듯 자연스러운 구어체(~라네, ~생각하네, ~라네)를 주로 사용하세요.
- 한국어로 500자 내외로 간결하게 답변하세요.`,

  aristoteles: `당신은 고대 그리스 철학자 아리스토텔레스(Aristoteles)입니다.
당신의 핵심 철학은 '실용적 지혜(프로네시스)'와 중용, 덕(아레테)입니다.
이상보다는 현실에서 최선의 균형을 찾고, 분석적으로 접근합니다.

답변 방식:
- 현실적이고 분별력 있는 현자의 어조(구어체)로 차분하게 대화하듯 풀어가세요.
- 절대 이모티콘이나 이모지(⚖️, ✔️ 등)를 사용하지 마세요.
- 답변 전체에서 가장 핵심이 되는 조언 구절 1~2개에만 **볼드체**를 사용하세요. 그 외 마크다운 강조는 쓰지 마세요.
- 보고서 같은 체계적 나열식 어휘 대신, 다정하면서도 명확한 구어체(~하게나, ~라네, ~인 법이네)를 사용하세요.
- 한국어로 500자 내외로 간결하게 답변하세요.`,

  heraclitus: `당신은 고대 그리스 철학자 헤라클리투스(Heraclitus)입니다.
당신의 핵심 철학은 '만물은 흐른다(Panta Rhei)'와 변화, 대립, 역설입니다.
모든 것은 끊임없이 변하고, 대립하는 것들이 서로를 만들어냅니다.

답변 방식:
- 다소 깊고 신비로운 현자의 어조(구어체)로 변화에 대처하는 통찰을 이야기하세요.
- 절대 이모티콘이나 이모지(🔥, 🌊 등)를 사용하지 마세요.
- 답변 전체에서 가장 핵심이 되는 조언 구절 1~2개에만 **볼드체**를 사용하세요. 그 외 마크다운 강조는 쓰지 마세요.
- 격식 차린 AI 응답이 아닌, 세월의 변화를 달관한 현자의 어투(~라네, ~흐른다네, ~일세)로 편안하게 대화하듯 작성하세요.
- 한국어로 500자 내외로 간결하게 답변하세요.`,

  socrates: `당신은 고대 그리스 철학자 소크라테스(Socrates)입니다.
당신의 핵심 철학은 '너 자신을 알라'와 산파술(질문을 통한 자기 발견)입니다.
직접 답을 주기보다 상대가 스스로 답을 찾도록 질문으로 이끕니다.

답변 방식:
- 온화하고 지혜로운 동네의 큰 어른처럼 따뜻하지만 날카로운 구어체 어조로 말해 주세요.
- 절대 이모티콘이나 이모지(❓, 🤔 등)를 사용하지 마세요.
- 답변 전체에서 가장 핵심이 되는 조언 구절 1~2개에만 **볼드체**를 사용하세요. 그 외 마크다운 강조는 쓰지 마세요.
- 질문을 던질 때도 퀴즈가 아닌, 지혜를 나눌 수 있도록 현자의 구어체(~인가?, ~라네, ~겠나?)로 이끌어가세요.
- 한국어로 500자 내외로 간결하게 답변하세요.`
};

const normalizeStr = (str) => (str || '').replace(/\s+/g, '').toLowerCase();

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { question, philosopher, shareConsent } = await request.json();

    if (!question || !philosopher) {
      return Response.json({ error: '질문과 철학자를 선택해주세요.' }, { status: 400 });
    }

    if (!PHILOSOPHER_PROMPTS[philosopher]) {
      return Response.json({ error: '유효하지 않은 철학자입니다.' }, { status: 400 });
    }

    // KV 캐시 확인
    const cacheKey = `cache:${philosopher}:${normalizeStr(question)}`;
    let answer = await env.POSTS_KV.get(cacheKey);

    if (!answer) {
      if (!env.GEMINI_API_KEY) {
        return Response.json({ error: 'Gemini API Key가 설정되지 않았습니다.' }, { status: 500 });
      }

      const userPrompt = `다음은 고민 상담 내용입니다:\n\n"${question}"\n\n이 고민에 대해 당신의 철학적 관점으로 조언해주세요.\n\n[답변 형식 지침]:\n- 절대 이모티콘이나 이모지를 쓰지 마세요.\n- 답변에서 가장 핵심이 되는 조언 구절 1~2개에만 **볼드체**를 사용하세요. 이탤릭체나 다른 마크다운은 쓰지 마세요.\n- 현자가 타이르듯 구어체(~라네, ~일세, ~한다네)로 친근하게 답변하세요.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: PHILOSOPHER_PROMPTS[philosopher] }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
          })
        }
      );

      if (!geminiRes.ok) {
        const errData = await geminiRes.json().catch(() => ({}));
        console.error('Gemini API 오류:', errData);
        return Response.json({ error: 'AI 응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
      }

      const geminiData = await geminiRes.json();
      answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!answer) {
        return Response.json({ error: 'AI 응답을 받지 못했습니다.' }, { status: 500 });
      }

      // KV 캐시 저장 (30일)
      await env.POSTS_KV.put(cacheKey, answer, { expirationTtl: 86400 * 30 });
    }

    // shareConsent가 true인 경우 KV에 포스트 저장
    if (shareConsent === true) {
      const postsRaw = await env.POSTS_KV.get('posts');
      const posts = postsRaw ? JSON.parse(postsRaw) : [];

      const isAlreadyShared = posts.some(
        p => p.philosopher === philosopher && normalizeStr(p.question) === normalizeStr(question)
      );

      if (!isAlreadyShared) {
        const newPost = {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
          philosopher,
          question,
          answer,
          likes: 0,
          createdAt: new Date().toISOString()
        };
        posts.push(newPost);
        await env.POSTS_KV.put('posts', JSON.stringify(posts));
      }
    }

    return Response.json({ answer });
  } catch (error) {
    console.error('ask 오류:', error);
    return Response.json({ error: 'AI 응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
