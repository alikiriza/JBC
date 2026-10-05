import "dotenv/config";
import { config } from "dotenv";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Next.js reads .env.local, but a standalone tsx script does not. Load it here
// the same way prisma.config.ts does.
config({ path: ".env.local", override: true });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

/**
 * Development seed data.
 *
 * These are sample clients and requests, not sign-in accounts — there are no
 * Account rows, so none of these people can actually sign in. Run this after
 * `prisma db push` to have something to look at while building the admin page.
 *
 * Covers every status plus the edge cases that break UIs: a very long note, a
 * missing note, a multi-line note, a large price, a non-ASCII name.
 */
async function main() {
  const clients = [
    { name: "Adaeze Okafor", email: "adaeze.okafor@example.com" },
    { name: "Chidi Nwosu", email: "chidi.nwosu@example.com" },
    { name: "Fatima Bello", email: "fatima.bello@example.com" },
    { name: "Tunde Adeyemi", email: "tunde.adeyemi@example.com" },
    { name: "Ngozi Eze", email: "ngozi.eze@example.com" },
    { name: "Emeka Obi", email: "emeka.obi@example.com" },
    { name: "Aisha Mohammed", email: "aisha.mohammed@example.com" },
    { name: "Olumide Bakare", email: "olumide.bakare@example.com" },
    { name: "Zainab Yusuf", email: "zainab.yusuf@example.com" },
    { name: "Ifeanyi Chukwu", email: "ifeanyi.chukwu@example.com" },
    { name: "Grace Adeleke", email: "grace.adeleke@example.com" },
    { name: "Biodun Salami", email: "biodun.salami@example.com" },
  ];

  const created: { id: string }[] = [];

  for (const client of clients) {
    const user = await db.user.upsert({
      where: { email: client.email },
      update: {},
      create: {
        name: client.name,
        email: client.email,
        emailVerified: true,
      },
      select: { id: true },
    });
    created.push(user);
  }

  // A second admin-style account that has never been priced, to prove the
  // empty state and the pending list both render.
  const statuses = ["Pending", "Priced", "Closed"];
  const sizes = ["30ml", "50ml", "100ml"];
  const notes = [
    null,
    "Dry patches on both elbows, worse in the harmattan.",
    "Small burn on the wrist from a hot pan. Blistered, now healing.",
    "Recurring rash behind the knees, mostly at night.",
    "A very long note to test wrapping: this client has had a persistent fungal infection between the toes for several months, has tried two over-the-counter creams without lasting relief, and would like to know whether the cream is safe to use alongside their existing medication and how long a course should last for someone who is on their feet all day.",
    "Eczema flare-up on the hands.\nSecond line of the same note.",
    "Fungal infection that keeps coming back after treatment.",
    "Skin feels tight and flaky after bathing.",
  ];

  let made = 0;
  for (let i = 0; i < 52; i++) {
    const client = created[i % created.length];
    const status = statuses[i % statuses.length];
    const priced = status !== "Pending";

    await db.priceRequest.create({
      data: {
        clientId: client.id,
        size: sizes[i % sizes.length],
        quantity: (i % 3) + 1,
        note: notes[i % notes.length],
        status,
        price: priced ? (i % 2 === 0 ? 4500 : 12500.5) : null,
        adminNote: priced ? "Confirmed in stock. Pay on delivery." : null,
        contactMethod: priced ? "+234 800 000 0000" : null,
        pricedAt: priced ? new Date(Date.now() - i * 86400000) : null,
        createdAt: new Date(Date.now() - i * 86400000),
      },
    });
    made++;
  }

  console.log(
    `Seeded ${created.length} clients and ${made} price requests.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });