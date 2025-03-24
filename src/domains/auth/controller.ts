import express from 'express';
import prismaClient from '@/utils/database';
import {
  comparePassword,
  generateToken,
  hashPassword,
} from '@/domains/auth/utils';

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const existing = await prismaClient.member.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ message: '이미 가입된 이메일입니다.' });
    }

    const hashedPassword = await hashPassword(password);
    const newMember = await prismaClient.member.create({
      data: {
        email,
        name,
        password: hashedPassword,
        joined_at: new Date(),
      },
    });

    res.status(201).json({ id: newMember.id, email: newMember.email });
  } catch (error) {
    res.status(500);
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const member = await prismaClient.member.findUnique({ where: { email } });
    if (!member) {
      res.status(401).json({message: '존재하지 않는 사용자입니다.'});
      return;
    }

    const valid = await comparePassword(password, member.password);
    if (!valid) {
      res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    const token = generateToken(member);
    res.json({ token });
  } catch (error) {
    res.status(500);
  }
});
