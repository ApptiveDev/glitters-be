import prisma from '../../src/utils/database';

const titles = [
  '새벽벌도서관 1층에서 댄디한 정장 차림의 잘생긴 사람',
  '새벽벌도서관 2층에서 눈웃음이 예쁜 사람, 흰 셔츠를 입고 있었음',
  '새벽벌도서관 3층에서 금발 염색에 청바지를 입은 사람',
  '새벽벌도서관 4층에서 검은 슬랙스를 입은 키 큰 사람',
  '새벽벌도서관 입구에서 단정한 셔츠에 얼굴 작은 사람',
  '새벽벌도서관 편의점 앞에서 꾸안꾸 스타일의 예쁜 사람',
  '새벽벌도서관 2층에서 흰 후드티와 캡모자를 쓴 훈훈한 사람',
  '새벽벌도서관 3층에서 긴 생머리에 베이지 코트를 입은 사람',
  '새벽벌도서관 1층에서 검은 셔츠를 입은 날카로운 인상의 사람',
  '새벽벌도서관 입구에서 운동복 차림의 건강미 있는 사람'
];

const contents = [
  '비율이 너무 좋아서 반짝였어요.',
  '웃는 모습이 예뻐서 반짝였어요.',
  '헤어스타일이 완벽해서 반짝였어요.',
  '피지컬이 좋아서 반짝였어요.',
  '얼굴형이 정말 예뻐서 반짝였어요.',
  '스타일이 딱 제 취향이라 반짝였어요.',
  '자연스럽게 멋져 보여서 반짝였어요.',
  '머리부터 발끝까지 조화로워서 반짝였어요.',
  '차가운 인상이 매력 있어서 반짝였어요.',
  '건강한 분위기에서 눈을 뗄 수 없어서 반짝였어요.'
];

async function createRandomPostAndMarker() {
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomContent = contents[Math.floor(Math.random() * contents.length)];
  const randomAddress = '부산대학교 새벽벌도서관';
  const authorIds = [7];
  const markerIdx = Math.floor(Math.random() * 4);
  const randomAuthorId = authorIds[Math.floor(Math.random() * authorIds.length)];

  const baseLat = 35.235789;
  const baseLon = 129.081399;
  const noise = () => (Math.random() - 0.5) * 0.001;

  const marker = await prisma.marker.create({
    data: {
      latitude: baseLat + noise(),
      longitude: baseLon + noise(),
    }
  });

  const post = await prisma.post.create({
    data: {
      markerId: marker.id,
      authorId: randomAuthorId,
      title: randomTitle,
      content: randomContent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
      address: randomAddress,
      institutionId: 1,
      markerIdx,
    }
  });

  console.log(`Created Post with ID: ${post.id}, Author ID: ${randomAuthorId}`);

  console.log(`Created Marker for Post ID: ${post.id}`);
}

async function main() {
  const args = process.argv.slice(2);
  const countIndex = args.indexOf('-c');
  let count = 1;

  if (countIndex !== -1 && args[countIndex + 1]) {
    const parsed = parseInt(args[countIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      count = parsed;
    }
  }

  for (let i = 0; i < count; i++) {
    await createRandomPostAndMarker();
  }
}

main()
.catch((e) => {
  console.error(e);
  process.exit(1);
})
.finally(async () => {
  await prisma.$disconnect();
});
