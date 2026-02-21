import { Router } from 'express';
import { prisma } from 'db';

export const communityRouter: Router = Router();

// GET /api/community/posts
communityRouter.get('/posts', async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { visibility: 'PUBLIC', status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { displayName: true } },
                tags: true,
                _count: {
                    select: { comments: true, reactions: true }
                }
            },
            take: 20
        });

        // Map to format suitable for frontend
        const formattedPosts = posts.map(p => ({
            id: p.id,
            title: p.title,
            body: p.bodyMd,
            author: p.author.displayName,
            likes: p._count.reactions,
            comments: p._count.comments,
            tags: p.tags.map(t => t.tag),
        }));

        res.json({ posts: formattedPosts });
    } catch (error) {
        console.error("Fetch posts error:", error);
        res.status(500).json({ error: "게시글을 불러오는데 실패했습니다." });
    }
});

// POST /api/community/posts
communityRouter.post('/posts', async (req, res) => {
    const { title, body, formatId = 'gen9ou' } = req.body;
    // 임시로 하드코딩된 로컬 테스트 유저를 찾거나 사용. (실제 운영시에는 인증 토큰에서 userId 추출 필요)
    let authorId = req.body.authorId;

    if (!title || !body) {
        return res.status(400).json({ error: "제목과 본문을 모두 입력해주세요." });
    }

    try {
        if (!authorId) {
            // Find existing dev user or create fallback
            let fallbackUser = await prisma.user.findFirst({ where: { email: { contains: 'test' } } });
            if (!fallbackUser) {
                fallbackUser = await prisma.user.create({
                    data: { email: 'guest@pokemon.dev', displayName: '익명트레이너', password: 'guest' }
                });
            }
            authorId = fallbackUser.id;
        }

        // 최신 룰셋 스냅샷 확보
        const ruleset = await prisma.rulesetSnapshot.findFirst({ orderBy: { createdAt: 'desc' } });
        if (!ruleset) return res.status(400).json({ error: "서버에 배틀 포맷 데이터가 없습니다." });

        const post = await prisma.post.create({
            data: {
                title,
                bodyMd: body,
                type: 'TEAM',
                formatId,
                rulesetSnapshotId: ruleset.id,
                authorId: authorId,
                tags: {
                    create: [
                        { tag: '렌탈팀' } // 기본 태그 추가
                    ]
                }
            }
        });

        res.json({ success: true, post });
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ error: "게시글 작성 중 서버 오류가 발생했습니다." });
    }
});
