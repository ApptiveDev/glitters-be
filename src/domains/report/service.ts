import { CreateReportRequest } from '@/domains/report/types';
import { Response } from 'express';
import { CreateReportRequestBodySchema } from '@/domains/report/schema';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { PasswordExcludedMember } from '@/domains/member/types';
import prisma from '@/utils/database';
import { Member } from '.prisma/client';
import { deactivateMember } from '@/domains/member/service';
import { BadRequestError, NotFoundError } from '@/domains/error/HttpError';
export async function createReport(req: CreateReportRequest, res: Response) {
  const createInput = CreateReportRequestBodySchema.parse(req.body);
  const reportType = createInput.reportType;
  if((reportType === 'CHATROOM_REPORT' && ! createInput.chatroomId)
    || (reportType === 'POST_REPORT' && ! createInput.postId)) {
    throw new BadRequestError('잘못된 요청입니다.');
  }
  const reportedId = await getReportedMemberId(createInput, req.member!);
  const reporterId = req.member!.id;
  if(! reportedId) {
    throw new NotFoundError('이미 탈퇴한 사용자이거나, 없는 게시글(채팅방)입니다.');
  }
  if(reportedId === reporterId) {
    throw new BadRequestError('자기 자신이 작성한 글은 신고할 수 없습니다.');
  }
  await prisma.report.create({
    data: {
      ...createInput,
      reporterId,
      reportedId,
    }
  });
  const updateResult = await prisma.member.update({
    where: {
      id: reportedId,
    },
    data: {
      reportedCount: {
        increment: 1,
      }
    }
  });
  await handleReportIncrement(updateResult);
  res.status(StatusCodes.CREATED).send();
}

async function handleReportIncrement(updateResult: Member) {
  if(updateResult.isDeactivated || !updateResult.email) { // 이미 탈퇴한 사용자인 경우
    return;
  }
  // 경고 5회 이상일 경우 계정 삭제 및 블랙리스트 등록
  if(updateResult.reportedCount >= 5) {
    // 이미 블랙리스트인 경우
    if(await prisma.blacklist.count({ where: { email: updateResult.email } }))
      return;
    await prisma.blacklist.create({
      data: {
        email: updateResult.email,
        memberId: updateResult.id,
      }
    });
    await deactivateMember(updateResult);
  }
}

async function getReportedMemberId(createInput: z.infer<typeof CreateReportRequestBodySchema>, reporter: PasswordExcludedMember) {
  let reportedId = 0;
  if(createInput.reportType === 'CHATROOM_REPORT') {
    // 채팅방 신고의 경우 채팅 요청자나 채팅 작성자 모두 신고당할 수 있음
    const chatRoom = await prisma.chatRoom.findUnique({
      where: {
        id: createInput.chatroomId as number
      }
    });
    if(! chatRoom) {
      return reportedId;
    }
    reportedId = chatRoom.authorId === reporter.id ? chatRoom.requesterId : chatRoom.authorId;
  } else { // 게시글 신고의 경우 신고받은 사람은 게시글 작성자
    const post = await prisma.post.findUnique({
      where: {
        id: createInput.postId as number
      }
    });
    if(! post) {
      return reportedId;
    }
    reportedId = post.authorId;
  }
  return reportedId;
}
