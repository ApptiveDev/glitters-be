import { hashPassword } from '../../src/domains/auth/utils';
import prisma from '../../src/utils/database';

function parseCountArg(): number {
  const cIndex = process.argv.indexOf('-c');
  if (cIndex === -1 || cIndex + 1 >= process.argv.length) {
    console.error('사용법: tsx create-members.ts -c <멤버 수>');
    process.exit(1);
  }

  const count = parseInt(process.argv[cIndex + 1], 10);
  if (isNaN(count) || count <= 0) {
    console.error('올바른 멤버 수를 입력하세요.');
    process.exit(1);
  }

  return count;
}

function generateRandomEmail(i: number): string {
  const timestamp = Date.now();
  return `user${timestamp}_${i}@example.com`;
}

function generateRandomName(i: number): string {
  return `user${i}`;
}

function generateRandomPassword(): string {
  return Math.random().toString(36).slice(-10);
}

async function createRandomMember(i: number) {
  const email = generateRandomEmail(i);
  const name = generateRandomName(i);
  const plainPassword = generateRandomPassword();
  const hashedPassword = await hashPassword(plainPassword);

  const member = await prisma.member.create({
    data: {
      email,
      name,
      password: hashedPassword,
      termsAccepted: true,
    },
  });

  console.log(`ID: ${member.id}, Email: ${email}, Name: ${name}, Password: ${plainPassword}`);
}

async function main() {
  const count = parseCountArg();

  for (let i = 0; i < count; i++) {
    await createRandomMember(i);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
