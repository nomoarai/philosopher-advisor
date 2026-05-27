export async function onRequestPost(context) {
  const { params, env } = context;
  const { id } = params;

  try {
    const postsRaw = await env.POSTS_KV.get('posts');
    const posts = postsRaw ? JSON.parse(postsRaw) : [];

    const post = posts.find(p => p.id === id);
    if (!post) {
      return Response.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 });
    }

    post.likes += 1;
    await env.POSTS_KV.put('posts', JSON.stringify(posts));

    return Response.json(post);
  } catch (error) {
    console.error('like 오류:', error);
    return Response.json({ error: '공감 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
