import { PrismaClient } from "@prisma/client";

// single instance for the whole process — PrismaClient manages its own connection pool
// creating multiple instances would exhaust PostgreSQL's connection limit
const prisma = new PrismaClient();

export default prisma;
