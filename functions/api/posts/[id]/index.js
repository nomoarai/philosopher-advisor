export async function onRequestDelete(context) {
  const { params, request, env } = context;
  const { id } = params;

  const adminPassword = request.headers.get('x-admin-password');
  if (!env.ADMIN_PASSWORD || adminPassword !== env.ADMIN_PASSWORD) {
    return Response.json({ error: '관리자 권한이 없습니다.' }, { status: 403 });
  }

  try {
    const postsRaw = await env.POSTS_KV.get('posts');
    const posts = postsRaw ? JSON.parse(postsRaw) : [];

    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return Response.json({ error: '삭제할 포스트를 찾을 수 없습니다.' }, { status: 404 });
    }

    posts.splice(postIndex, 1);
    await env.POSTS_KV.put('posts', JSON.stringify(posts));

    return Response.json({ success: true, message: '포스트가 정상적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('delete 오류:', error);
    return Response.json({ error: '삭제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
