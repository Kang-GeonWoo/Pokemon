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

        const format = await prisma.format.findUnique({ where: { formatId } });
        if (!format) return res.status(400).json({ error: "유효하지 않은 포맷입니다." });

        const postType = req.body.type === 'FREE' ? 'TEAM' : 'TEAM'; // DB enum is PostType (SET, TEAM). We map FREE to TEAM and use tags to differentiate.
        const tagLiteral = req.body.type === 'FREE' ? '자유' : '렌탈팀';

        const post = await prisma.post.create({
            data: {
                title,
                bodyMd: body,
                type: 'TEAM',
                formatId: format.id,
                rulesetSnapshotId: ruleset.id,
                authorId: authorId,
                tags: {
                    create: [
                        { tag: tagLiteral }
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

// GET /api/community/posts/:id
communityRouter.get('/posts/:id', async (req, res) => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: req.params.id },
            include: {
                author: { select: { id: true, displayName: true } },
                tags: true,
                _count: { select: { comments: true, reactions: true } }
            }
        });
        if (!post) return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        if (post.status !== 'ACTIVE') return res.status(403).json({ error: "삭제되거나 차단된 게시글입니다." });

        res.json({
            id: post.id,
            title: post.title,
            body: post.bodyMd,
            author: post.author.displayName,
            authorId: post.author.id, // Needed for Edit/Delete permission check
            likes: post._count.reactions,
            comments: post._count.comments,
            tags: post.tags.map(t => t.tag),
            createdAt: post.createdAt,
        });
    } catch (error) {
        res.status(500).json({ error: "서버 오류" });
    }
});

// PUT /api/community/posts/:id (Edit Post)
communityRouter.put('/posts/:id', async (req, res) => {
    const { title, body } = req.body;
    let authorId = req.body.authorId; // Temporary mock auth

    try {
        if (!authorId) {
            const fallbackUser = await prisma.user.findFirst({ where: { email: { contains: 'test' } } });
            if (fallbackUser) authorId = fallbackUser.id;
        }

        const post = await prisma.post.findUnique({ where: { id: req.params.id } });
        if (!post) return res.status(404).json({ error: "게시글 없음" });
        if (post.authorId !== authorId) return res.status(403).json({ error: "수정 권한이 없습니다." });

        const updated = await prisma.post.update({
            where: { id: req.params.id },
            data: { title, bodyMd: body, updatedAt: new Date() }
        });
        res.json({ success: true, post: updated });
    } catch (error) {
        res.status(500).json({ error: "서버 오류" });
    }
});

// DELETE /api/community/posts/:id (Delete Post)
communityRouter.delete('/posts/:id', async (req, res) => {
    let authorId = req.body.authorId; // Temporary mock auth
    try {
        if (!authorId) {
            const fallbackUser = await prisma.user.findFirst({ where: { email: { contains: 'test' } } });
            if (fallbackUser) authorId = fallbackUser.id;
        }

        const post = await prisma.post.findUnique({ where: { id: req.params.id } });
        if (!post) return res.status(404).json({ error: "게시글 없음" });
        if (post.authorId !== authorId) return res.status(403).json({ error: "삭제 권한이 없습니다." });

        await prisma.post.update({
            where: { id: req.params.id },
            data: { status: 'DELETED' }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "서버 오류" });
    }
});

// GET /api/community/posts/:id/comments
communityRouter.get('/posts/:id/comments', async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            where: { postId: req.params.id, status: 'ACTIVE' },
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { displayName: true } } }
        });
        res.json({ comments: comments.map(c => ({ id: c.id, body: c.body, author: c.author.displayName, createdAt: c.createdAt })) });
    } catch (error) {
        res.status(500).json({ error: "서버 오류" });
    }
});

// POST /api/community/posts/:id/comments
communityRouter.post('/posts/:id/comments', async (req, res) => {
    const { body } = req.body;
    let authorId = req.body.authorId;
    if (!body) return res.status(400).json({ error: "내용이 없습니다." });

    try {
        if (!authorId) {
            const fallbackUser = await prisma.user.findFirst({ where: { email: { contains: 'test' } } });
            if (fallbackUser) authorId = fallbackUser.id;
        }

        const comment = await prisma.comment.create({
            data: { body, postId: req.params.id, authorId }
        });
        res.json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ error: "서버 오류" });
    }
});

// POST /api/community/posts/:id/like
communityRouter.post('/posts/:id/like', async (req, res) => {
    let userId = req.body.userId; // Temporary mock auth
    try {
        if (!userId) {
            const fallbackUser = await prisma.user.findFirst({ where: { email: { contains: 'test' } } });
            if (fallbackUser) userId = fallbackUser.id;
        }

        // Toggle logic
        const existing = await prisma.reaction.findUnique({
            where: { userId_postId_type: { userId, postId: req.params.id, type: 'LIKE' } }
        });

        if (existing) {
            await prisma.reaction.delete({ where: { id: existing.id } });
            res.json({ success: true, liked: false });
        } else {
            await prisma.reaction.create({ data: { userId, postId: req.params.id, type: 'LIKE' } });
            res.json({ success: true, liked: true });
        }
    } catch (error) {
        res.status(500).json({ error: "서버 오류" });
    }
});

// POST /api/community/posts/:id/report
communityRouter.post('/posts/:id/report', async (req, res) => {
    let reporterId = req.body.reporterId;
    const { reason = "SPAM" } = req.body;

    try {
        if (!reporterId) {
            const fallbackUser = await prisma.user.findFirst({ where: { email: { contains: 'test' } } });
            if (fallbackUser) reporterId = fallbackUser.id;
        }

        await prisma.report.create({
            data: { reporterId, targetType: 'POST', targetId: req.params.id, reason }
        });

        const reportCount = await prisma.report.count({
            where: { targetType: 'POST', targetId: req.params.id }
        });

        // 50회 이상 신고 시 자동 블라인드/삭제
        if (reportCount >= 50) {
            await prisma.post.update({
                where: { id: req.params.id },
                data: { status: 'DELETED' }
            });
        }

        res.json({ success: true, reportCount });
    } catch (error) {
        res.status(500).json({ error: "서버 오류" });
    }
});
