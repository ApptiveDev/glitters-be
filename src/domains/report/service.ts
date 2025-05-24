import { CreateReportRequest, ReportLog } from '@/domains/report/types';
import { Response } from 'express';
import { CreateReportRequestBodySchema } from '@/domains/report/schema';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { InternalMember, PublicMember } from '@/domains/member/types';
import prisma from '@/utils/database';
import { Member } from '.prisma/client';
import { maskMember } from '@/domains/member/service';
import { BadRequestError, NotFoundError } from '@/domains/error/HttpError';
import { Chat, ChatRoom, Post, Report } from '@/schemas';
import { sendEmail } from '@/utils/email';
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
  // TODO: 쿼리 개수 최소화하기
  const createResult = await prisma.report.create({
    data: {
      ...createInput,
      reporterId,
      reportedId,
    }
  });
  if(! await hasReportedBefore(reporterId, reportedId)) {
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
    await applyReportIncrement(updateResult);
  }
  const reportedMember = await prisma.member.findUniqueOrThrow({
    where: { id: reportedId },
  });
  await sendReportLog(createResult, req.member!, reportedMember);
  res.status(StatusCodes.CREATED).send();
}

async function sendReportLog(report: Report, reporter: InternalMember, reported: Member) {
  const log: ReportLog = {
    reportType: report.reportType,
    id: report.chatroomId || report.postId!,
    createdAt: report.createdAt,
    issuerId: report.reporterId,
    targetId: report.reportedId,
    issuerEmail: reporter.email!,
    targetEmail: reported.email!,
    reason: report.reason,
    data: {}
  };
  if(report.reportType === 'CHATROOM_REPORT') {
    log.data = await createChatLog(await prisma.chat.findMany({
      where: {
        chatroomId: report.chatroomId!,
      },
      include: {
        chatroom: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 30
    }));
  } else {
    log.data = await createPostLog(await prisma.post.findUnique({
      where: {
        id: report.postId!,
      },
      include: {
        author: true,
      }
    }));
  }
  const title = generateReportEmailSubject(log);
  const emailBody = generateReportEmailBody(log);
  return sendEmail(process.env.SERVICE_EMAIL!, title, emailBody, process.env.SERVICE_EMAIL!);
}

export async function hasReportedBefore(issuerId: number, targetId: number) {
  return (await prisma.report.count({
    where: {
      reporterId: issuerId,
      reportedId: targetId,
    },
  })) > 1;
}

export function generateReportEmailSubject(log: ReportLog): string {
  const { createdAt, issuerId, issuerEmail, targetId, targetEmail, reportType } = log;

  const formattedDate = createdAt.toISOString();
  const typeLabel = getReportTypeLabel(reportType);

  return `[${typeLabel}] ${formattedDate} | 신고자: ${issuerEmail ?? issuerId} → 피신고자: ${targetEmail} (${targetId})`;
}

function getReportTypeLabel(type: Report['reportType']){
  switch (type) {
    case 'POST_REPORT':
      return '게시글 신고';
    case 'CHATROOM_REPORT':
      return '채팅 신고';
    default:
      return '신고';
  }
}

export function generateReportEmailBody(log: ReportLog): string {
  const {
    createdAt,
    data,
    issuerId,
    issuerEmail,
    targetId,
    targetEmail,
    reason,
    id
  } = log;

  const formattedDate = createdAt.toISOString();

  const lines: string[] = [];

  lines.push(`🕒 신고 일시: ${formattedDate}`);
  lines.push(`📝 신고 사유: ${reason}`);
  lines.push(`🆔 대상 ID (게시글/채팅방): ${id}`);
  lines.push(`🙋 신고자 ID: ${issuerId}`);
  if (issuerEmail) lines.push(`📨 신고자 이메일: ${issuerEmail}`);
  lines.push(`🙎 피신고자 ID: ${targetId}`);
  lines.push(`📩 피신고자 이메일: ${targetEmail}`);
  lines.push('');
  lines.push('📚 신고 대상 로그:');
  lines.push(...data.map((entry: any) => `- ${entry}`));

  return lines.join('\n');
}


async function createChatLog(chats: (Chat & { chatroom: ChatRoom })[]) {
  return chats.map(chat => {
    const { authorId, authorNickname, requesterNickname } = chat.chatroom;
    const nickname = chat.senderId === authorId ? authorNickname : requesterNickname;
    return `${nickname}(${chat.senderId}, ${chat.createdAt.toISOString()}): ${chat.content}`;
  });
}

async function createPostLog(post: Post & { author: Member } | null) {
  if(! post) {
    return [];
  }
  const nickname = post.author.name;
  return [
    `${nickname}(${post.authorId}, ${post.createdAt.toISOString()}): ${post.title} - ${post.content}`
  ];
}

async function applyReportIncrement(updateResult: Member) {
  if(updateResult.isDeactivated || !updateResult.email) { // 이미 탈퇴한 사용자인 경우
    return;
  }
  // 경고 10회 이상일 경우 계정 삭제 및 블랙리스트 등록
  if(updateResult.reportedCount >= 10) {
    // 이미 블랙리스트인 경우
    if(await prisma.blacklist.count({ where: { email: updateResult.email } }))
      return;
    return prisma.$transaction([
      prisma.blacklist.create({
        data: {
          email: updateResult.email,
          memberId: updateResult.id,
        }
      }),
      maskMember(updateResult),
    ]);
  }
}

async function getReportedMemberId(createInput: z.infer<typeof CreateReportRequestBodySchema>, reporter: PublicMember) {
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
