import { Router } from 'express';
import { prisma } from 'db';

export const authRouter: Router = Router();

authRouter.get('/login', (req, res) => res.status(405).send("이 주소(API)는 브라우저 주소창으로 직접 접속할 수 없습니다. 프론트엔드 로그인 페이지(http://localhost:3000/login)를 이용해주세요."));
authRouter.get('/register', (req, res) => res.status(405).send("이 주소(API)는 브라우저 주소창으로 직접 접속할 수 없습니다. 프론트엔드 로그인 화면에서 [계정 만들기]를 통해 가입해주세요."));

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: '이메일과 비밀번호를 모두 입력해주세요.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
        return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }
    return res.json({ id: user.id, displayName: user.displayName, email: user.email });
});

authRouter.post('/register', async (req, res) => {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
        return res.status(400).json({ error: '모든 필드를 입력해 주세요.' });
    }

    try {
        const user = await prisma.user.create({
            data: { email, password, displayName }
        });
        return res.json({ id: user.id, displayName: user.displayName, email: user.email });
    } catch (e: any) {
        console.error("Register Error:", e);
        if (e.code === 'P2002') {
            return res.status(400).json({ error: '이미 사용 중인 이메일입니다.' });
        }
        return res.status(500).json({ error: '회원가입 중 서버 오류가 발생했습니다.' });
    }
});
