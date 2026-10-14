require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

// CommonJS module caching ensures one PrismaClient per application process.
const prisma = new PrismaClient();

module.exports = prisma;
