export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const sortBy = url.searchParams.get('sortBy');

    const postsRaw = await env.POSTS_KV.get('posts');
    const posts = postsRaw ? JSON.parse(postsRaw) : [];

    const sortedPosts = [...posts];
    if (sortBy === 'likes') {
      sortedPosts.sort((a, b) => b.likes - a.likes || new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return Response.json(sortedPosts);
  } catch (error) {
    console.error('posts 조회 오류:', error);
    return Response.json({ error: '포스트 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
