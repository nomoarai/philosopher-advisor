export async function onRequestPost(context) {
  const { params, request, env } = context;
  const { id } = params;

  try {
    // IP 기반 중복 공감 방지
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
    const likeKey = `like:${id}:${ip}`;
    const alreadyLiked = await env.POSTS_KV.get(likeKey);
    if (alreadyLiked) {
      return Response.json({ error: '이미 공감한 게시글입니다.' }, { status: 409 });
    }

    const postsRaw = await env.POSTS_KV.get('posts');
    const posts = postsRaw ? JSON.parse(postsRaw) : [];

    const post = posts.find(p => p.id === id);
    if (!post) {
      return Response.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 });
    }

    post.likes += 1;
    await Promise.all([
      env.POSTS_KV.put('posts', JSON.stringify(posts)),
      env.POSTS_KV.put(likeKey, '1', { expirationTtl: 86400 * 365 })
    ]);

    return Response.json(post);
  } catch (error) {
    console.error('like 오류:', error);
    return Response.json({ error: '공감 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
