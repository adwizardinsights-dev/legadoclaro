import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@legadoclaro.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@legadoclaro.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create demo user
  const userPassword = await bcrypt.hash("Demo123!", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@legadoclaro.com" },
    update: {},
    create: {
      name: "Jane Demo",
      email: "demo@legadoclaro.com",
      password: userPassword,
      role: "USER",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Demo user: ${demoUser.email}`);

  // Create a demo will document for the demo user
  const existingWill = await prisma.willDocument.findFirst({
    where: { userId: demoUser.id },
  });

  if (!existingWill) {
    await prisma.willDocument.create({
      data: {
        userId: demoUser.id,
        status: "DRAFT",
        currentStep: 3,
        state: "NY",
        personalInfo: {
          firstName: "Jane",
          middleName: "Marie",
          lastName: "Demo",
          dateOfBirth: "1985-03-15",
          address: "123 Broadway",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          maritalStatus: "MARRIED",
          spouseName: "John Demo",
          children: [
            { name: "Emma Demo", dateOfBirth: "2015-06-20", isMinor: true },
          ],
        },
        executorInfo: {
          primaryExecutorName: "Robert Demo",
          primaryExecutorRelationship: "Brother",
          primaryExecutorEmail: "robert@example.com",
          alternateExecutorName: "Sarah Demo",
          alternateExecutorRelationship: "Sister",
          alternateExecutorEmail: "sarah@example.com",
        },
        beneficiaries: [
          {
            id: "b1",
            firstName: "John",
            lastName: "Demo",
            relationship: "Spouse",
            email: "john@example.com",
            distributionType: "PERCENTAGE",
            percentage: 60,
          },
          {
            id: "b2",
            firstName: "Emma",
            lastName: "Demo",
            relationship: "Daughter",
            distributionType: "PERCENTAGE",
            percentage: 40,
          },
        ],
      },
    });
    console.log(`✅ Demo will document created for ${demoUser.email}`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("\nTest credentials:");
  console.log("  Admin:    admin@legadoclaro.com / Admin123!");
  console.log("  Demo User: demo@legadoclaro.com / Demo123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
