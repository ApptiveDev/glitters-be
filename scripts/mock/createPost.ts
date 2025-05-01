import prisma from '../../src/utils/database';

async function createRandomPostAndMarker() {
  const randomTitle = `Title ${Math.random().toString(36).substring(7)}`;
  const randomContent = `Content ${Math.random().toString(36).substring(7)}`;
  const randomAddress = `Address ${Math.random().toString(36).substring(7)}`;
  const authorIds = [2, 3, 7, 9, 10];
  const randomAuthorId = authorIds[Math.floor(Math.random() * authorIds.length)];

  const post = await prisma.post.create({
    data: {
      authorId: randomAuthorId,
      title: randomTitle,
      content: randomContent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
      address: randomAddress
    }
  });

  console.log(`Created Post with ID: ${post.id}, Author ID: ${randomAuthorId}`);

  const baseLat = 35.237145278897785;
  const baseLon = 129.07761905755973;
  const noise = () => (Math.random() - 0.5) * 0.001;

  await prisma.marker.create({
    data: {
      postId: post.id,
      latitude: baseLat + noise(),
      longitude: baseLon + noise(),
    }
  });

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
