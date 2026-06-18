export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
    const rateKey = `rate:${ip}:${Math.floor(Date.now() / 60000)}`;
    const rateCount = parseInt(await env.POSTS_KV.get(rateKey) || '0');
    if (rateCount >= 10) {
      return Response.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }
    await env.POSTS_KV.put(rateKey, String(rateCount + 1), { expirationTtl: 120 });

    const { mood, theme, situation, mindset } = await request.json();

    if (!mood || !theme || !situation || !mindset) {
      return Response.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    if ([mood, theme, situation, mindset].some(v => typeof v !== 'string' || v.length > 200)) {
      return Response.json({ error: '잘못된 입력 형식입니다.' }, { status: 400 });
    }

    if (!env.GEMINI_API_KEY) {
      return Response.json({ error: 'Gemini API Key가 설정되지 않았습니다.' }, { status: 500 });
    }

    const prompt = `다음은 한 사람의 지금 상태입니다:
- 오늘 기분: ${mood}
- 고민 영역: ${theme}
- 요즘 상황: ${situation}
- 상황을 바라보는 생각: ${mindset}

이 사람에게 지금 이 순간 가장 적절한 질문 하나를 한국어로 만들어주세요.

조건:
- 질문 문장 하나만 출력할 것 (다른 설명이나 부연 없이)
- 40자 이내의 짧고 핵심적인 질문
- 철학 용어 없이 일상 언어로
- 스스로를 돌아볼 수 있도록 유도하는 질문
- 물음표(?)로 끝날 것`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      console.error('Gemini API 오류:', errData);
      return Response.json({ error: '질문 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawQuestion = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    const question = rawQuestion?.trim().replace(/^["'「『]|["'」』]$/g, '');

    if (!question) {
      return Response.json({ error: '질문 생성에 실패했습니다.' }, { status: 500 });
    }

    return Response.json({ question });
  } catch (error) {
    console.error('generate-question 오류:', error);
    return Response.json({ error: '질문 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
