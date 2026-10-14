const prisma = require('../db/prismaClient');

const postSelect = {
  id: true,
  title: true,
  body: true,
  authorId: true,
};

// Keep the public repository record shape aligned with the original
// in-memory implementation. Prisma timestamps are storage details.
function toPostRecord(post) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    authorId: post.authorId == null ? undefined : post.authorId,
  };
}

function safeDatabaseError(error) {
  if (error && error.code === 'P2002') {
    const conflict = new Error('A record with those values already exists');
    conflict.statusCode = 409;
    return conflict;
  }

  if (error && error.code === 'P2003') {
    const conflict = new Error('A related record does not exist or cannot be removed');
    conflict.statusCode = 409;
    return conflict;
  }

  const safeError = new Error('Database operation failed');
  safeError.statusCode = 500;
  return safeError;
}

async function findAll() {
  try {
    const posts = await prisma.post.findMany({
      select: postSelect,
      orderBy: { id: 'asc' },
    });
    return posts.map(toPostRecord);
  } catch (error) {
    throw safeDatabaseError(error);
  }
}

async function findById(id) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: postSelect,
    });
    return post ? toPostRecord(post) : null;
  } catch (error) {
    throw safeDatabaseError(error);
  }
}

async function create(fields) {
  try {
    const post = await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        ...(fields.authorId === undefined ? {} : { authorId: Number(fields.authorId) }),
      },
      select: postSelect,
    });
    return toPostRecord(post);
  } catch (error) {
    throw safeDatabaseError(error);
  }
}

async function update(id, patch) {
  const postId = Number(id);
  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.body !== undefined) data.body = patch.body;

  try {
    const result = await prisma.post.updateMany({
      where: { id: postId },
      data,
    });
    if (result.count === 0) return null;

    const updated = await prisma.post.findUnique({
      where: { id: postId },
      select: postSelect,
    });
    return updated ? toPostRecord(updated) : null;
  } catch (error) {
    throw safeDatabaseError(error);
  }
}

async function remove(id) {
  try {
    const result = await prisma.post.deleteMany({
      where: { id: Number(id) },
    });
    return result.count > 0;
  } catch (error) {
    throw safeDatabaseError(error);
  }
}

module.exports = { findAll, findById, create, update, remove };
