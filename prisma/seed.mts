import faker from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

const prisma = new PrismaClient();

async function seed() {
  await Promise.all([
    prisma.role.upsert({
      where: {
        name: "admin",
      },
      create: {
        name: "admin",
        description: "Administrator",
      },
      update: {},
    }),
    prisma.role.upsert({
      where: {
        name: "user",
      },
      create: {
        name: "user",
        description: "User",
      },
      update: {},
    }),
  ]);

  await prisma.user.upsert({
    create: {
      email: "admin@admin.com",
      name: "Admin",
      password: {
        create: {
          hash: await bcrypt.hash("admin", 10),
        },
      },
      roleType: {
        connect: {
          name: "admin",
        },
      },
    },
    where: {
      email: "admin@admin.com",
    },
    update: {},
  });

  const users = await Promise.all(
    Array.from({ length: 100 })
      .map(() => faker.internet.email())
      .filter((email, index, self) => self.indexOf(email) === index)
      .map(async (email) => {
        const password = faker.internet.password();
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.delete({ where: { email } }).catch(() => {});
        const user = await prisma.user.create({
          data: {
            email,
            password: {
              create: {
                hash: hashedPassword,
              },
            },
            roleType: {
              connect: {
                name: "user",
              },
            },
            name: faker.name.findName(),
          },
        });

        return user;
      })
  );

  await Promise.all(
    Array.from({ length: 10 })
      .map(() => faker.internet.email())
      .filter((email, index, self) => self.indexOf(email) === index)
      .map(async (email) => {
        const host = await prisma.host.create({
          data: {
            name: faker.name.findName(),
            email,
          },
        });
        const startDate = faker.date.future();
        const endDate = dayjs(startDate).add(1, "hour").toDate();
        const address = faker.address.streetAddress();
        // grab random users from the list of users
        const attendees = Array.from({
          length: faker.datatype.number({
            min: 10,
            max: 50,
          }),
        })
          .map(() =>
            faker.datatype.number({
              min: 0,
              max: users.length - 1,
            })
          )
          .map((index) => users[index])
          // ensure users are unique
          .filter((user, index, self) => self.indexOf(user) === index);

        const event = await prisma.event.create({
          data: {
            title: faker.lorem.words(),
            host: {
              connect: {
                id: host.id,
              },
            },
            description: faker.lorem.paragraph(),
            startDate,
            endDate,
            location: {
              connectOrCreate: {
                where: {
                  address,
                },
                create: {
                  address,
                  name: `${faker.address.cityName()} Centre`,
                },
              },
            },
            price: 5,
            seats: 30,
            attendees: {
              connect: attendees.map((user) => ({
                id: user.id,
              })),
            },
          },
        });

        return event;
      })
  );

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
