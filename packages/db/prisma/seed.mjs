//TODO: use typescript file if possible
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  await prisma.user.create({
    data: {
      name: "Rhuan Teste",
      email: "rhuan@ali.com",
      role: "Admin",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

