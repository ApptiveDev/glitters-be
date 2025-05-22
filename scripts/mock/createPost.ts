import prisma from '../../src/utils/database';

const titles = [
  '정장 입고 계신분',
  '순버 맨 앞자리에 계시던 여성분',
  '금발에 청바지 입은 남성분',
  '검은 슬랙스를 입은 키 큰 남성분',
  '단정한 셔츠에 얼굴 작은 사람',
  '흰색 티셔츠에 모자쓰신분',
  '흰 후드티에 조거팬츠 입으신 남성분',
  '분홍색 니트에 슬랙스 입으신 여성분',
  '검은 셔츠 입고계신 남성분',
  '운동복 입고 친구들과 같이 가시던 여성분'
];

const contents = [
  '비율이 너무 좋아서 반짝였어요.',
  '웃는 모습이 반짝였어요.',
  '헤어스타일이 완벽해서 반짝였어요.',
  '피지컬이 좋아서 반짝였어요.',
  '얼굴형이 정말 예뻐서 반짝였어요.',
  '스타일이 제 취향이라 반짝였어요.',
  '자연스럽게 멋져 보여서 반짝였어요.',
  '옷을 너무 잘 입으셔서 반짝였어요.',
  '차가운 인상이 매력 있어서 반짝였어요.',
  '눈매가 제 스타일이셔서 반짝였어요.'
];

async function createRandomPostAndMarker() {
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomContent = contents[Math.floor(Math.random() * contents.length)];
  const randomAddress = '부산대학교 강의실';
  const authorIds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const markerIdx = Math.floor(Math.random() * 4);
  const randomAuthorId = authorIds[Math.floor(Math.random() * authorIds.length)];

  const baseLat = 35.235789;
  const baseLon = 129.081399;
  const noise = () => (Math.random() - 0.5) * 0.009;

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

  await Promise.all(
    Array.from({ length: count }, () => createRandomPostAndMarker())
  );

}

main()
.catch((e) => {
  console.error(e);
  process.exit(1);
})
.finally(async () => {
  await prisma.$disconnect();
});
