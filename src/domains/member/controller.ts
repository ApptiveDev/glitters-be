import express from 'express';
import prismaClient from '@/utils/database';
import {
  verifyToken,
} from '@/domains/auth/utils';

const memberRouter = express.Router();

// 내 정보 조회
memberRouter.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: '토큰이 필요합니다.' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const member = await prismaClient.member.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        joined_at: true,
      },
    });

    if (!member) {
      res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      return;
    }

    res.json(member);
  } catch (error) {
    res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
  }
});

export default memberRouter;
