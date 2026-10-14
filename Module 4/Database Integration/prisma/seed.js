const prisma = require('../src/db/prismaClient');
const samplePosts = require('../src/data/postSeed');

async function main() {
  const author = await prisma.user.upsert({
    where: { email: 'seed-author@example.com' },
    update: { name: 'Community Member' },
    create: { name: 'Community Member', email: 'seed-author@example.com' },
  });

  for (const sample of samplePosts) {
    const existing = await prisma.post.findFirst({
      where: { title: sample.title, authorId: author.id },
      select: { id: true },
    });

    if (!existing) {
      await prisma.post.create({
        data: {
          title: sample.title,
          body: sample.body || '',
          authorId: author.id,
        },
      });
    }
  }
}

main()
  .catch(() => {
    console.error('Database seed failed. Check DATABASE_URL and migration status.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
