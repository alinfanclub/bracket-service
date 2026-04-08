import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(currentDirectory, "../../../.env")
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

async function main() {
  const masterUser = await prisma.user.upsert({
    where: { email: "master@wombat.local" },
    update: {
      name: "웜뱃 마스터",
      primaryRole: "MASTER"
    },
    create: {
      externalAuthId: "seed-master-user",
      email: "master@wombat.local",
      name: "웜뱃 마스터",
      primaryRole: "MASTER"
    }
  });

  const busanWombat = await prisma.organization.upsert({
    where: { code: "BUSANWOMBAT" },
    update: {
      name: "부산 웜뱃 유도관",
      type: "DOJO"
    },
    create: {
      code: "BUSANWOMBAT",
      name: "부산 웜뱃 유도관",
      type: "DOJO"
    }
  });

  const haeundaeClub = await prisma.organization.upsert({
    where: { code: "HAEUNDAEJC" },
    update: {
      name: "해운대 청룡 유도클럽",
      type: "CLUB"
    },
    create: {
      code: "HAEUNDAEJC",
      name: "해운대 청룡 유도클럽",
      type: "CLUB"
    }
  });

  const busanHigh = await prisma.organization.upsert({
    where: { code: "BUSANHIGH" },
    update: {
      name: "부산체고",
      type: "SCHOOL"
    },
    create: {
      code: "BUSANHIGH",
      name: "부산체고",
      type: "SCHOOL"
    }
  });

  await prisma.organizationMembership.upsert({
    where: {
      userId_organizationId: {
        userId: masterUser.id,
        organizationId: busanWombat.id
      }
    },
    update: {
      role: "MASTER"
    },
    create: {
      userId: masterUser.id,
      organizationId: busanWombat.id,
      role: "MASTER"
    }
  });

  const athletes = await Promise.all([
    prisma.athlete.upsert({
      where: { id: "seed-athlete-kim-minjun" },
      update: {
        organizationId: busanWombat.id,
        firstName: "민준",
        lastName: "김",
        gender: "남",
        birthDate: new Date("2008-03-14"),
        beltLevel: "갈색띠",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "고등부"
      },
      create: {
        id: "seed-athlete-kim-minjun",
        organizationId: busanWombat.id,
        firstName: "민준",
        lastName: "김",
        gender: "남",
        birthDate: new Date("2008-03-14"),
        beltLevel: "갈색띠",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "고등부"
      }
    }),
    prisma.athlete.upsert({
      where: { id: "seed-athlete-park-jiyoon" },
      update: {
        organizationId: haeundaeClub.id,
        firstName: "지윤",
        lastName: "박",
        gender: "여",
        birthDate: new Date("2009-07-08"),
        beltLevel: "청색띠",
        weightClassLabel: "-57kg",
        ageDivisionLabel: "고등부"
      },
      create: {
        id: "seed-athlete-park-jiyoon",
        organizationId: haeundaeClub.id,
        firstName: "지윤",
        lastName: "박",
        gender: "여",
        birthDate: new Date("2009-07-08"),
        beltLevel: "청색띠",
        weightClassLabel: "-57kg",
        ageDivisionLabel: "고등부"
      }
    }),
    prisma.athlete.upsert({
      where: { id: "seed-athlete-lee-dohyun" },
      update: {
        organizationId: busanHigh.id,
        firstName: "도현",
        lastName: "이",
        gender: "남",
        birthDate: new Date("2008-11-21"),
        beltLevel: "흑띠",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "고등부"
      },
      create: {
        id: "seed-athlete-lee-dohyun",
        organizationId: busanHigh.id,
        firstName: "도현",
        lastName: "이",
        gender: "남",
        birthDate: new Date("2008-11-21"),
        beltLevel: "흑띠",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "고등부"
      }
    }),
    prisma.athlete.upsert({
      where: { id: "seed-athlete-choi-seoyeon" },
      update: {
        organizationId: busanWombat.id,
        firstName: "서연",
        lastName: "최",
        gender: "여",
        birthDate: new Date("2009-01-30"),
        beltLevel: "갈색띠",
        weightClassLabel: "-57kg",
        ageDivisionLabel: "고등부"
      },
      create: {
        id: "seed-athlete-choi-seoyeon",
        organizationId: busanWombat.id,
        firstName: "서연",
        lastName: "최",
        gender: "여",
        birthDate: new Date("2009-01-30"),
        beltLevel: "갈색띠",
        weightClassLabel: "-57kg",
        ageDivisionLabel: "고등부"
      }
    })
  ]);

  const tournament = await prisma.tournament.upsert({
    where: { code: "BSW2025" },
    update: {
      createdById: masterUser.id,
      name: "부산시2025 상반기 웜뱃배",
      venue: "부산시민체육관",
      startsAt: new Date("2025-06-14T09:00:00+09:00"),
      endsAt: new Date("2025-06-14T18:00:00+09:00"),
      status: "PUBLISHED"
    },
    create: {
      createdById: masterUser.id,
      code: "BSW2025",
      name: "부산시2025 상반기 웜뱃배",
      venue: "부산시민체육관",
      startsAt: new Date("2025-06-14T09:00:00+09:00"),
      endsAt: new Date("2025-06-14T18:00:00+09:00"),
      status: "PUBLISHED"
    }
  });

  const divisions = await Promise.all([
    prisma.division.upsert({
      where: { id: "seed-division-boys-66" },
      update: {
        tournamentId: tournament.id,
        name: "고등부 남자 -66kg",
        gender: "남",
        ageGroup: "고등부",
        weightClass: "-66kg",
        sortOrder: 1
      },
      create: {
        id: "seed-division-boys-66",
        tournamentId: tournament.id,
        name: "고등부 남자 -66kg",
        gender: "남",
        ageGroup: "고등부",
        weightClass: "-66kg",
        sortOrder: 1
      }
    }),
    prisma.division.upsert({
      where: { id: "seed-division-girls-57" },
      update: {
        tournamentId: tournament.id,
        name: "고등부 여자 -57kg",
        gender: "여",
        ageGroup: "고등부",
        weightClass: "-57kg",
        sortOrder: 2
      },
      create: {
        id: "seed-division-girls-57",
        tournamentId: tournament.id,
        name: "고등부 여자 -57kg",
        gender: "여",
        ageGroup: "고등부",
        weightClass: "-57kg",
        sortOrder: 2
      }
    })
  ]);

  const [boysDivision, girlsDivision] = divisions;
  const [kimMinjun, parkJiyoon, leeDohyun, choiSeoyeon] = athletes;

  await Promise.all([
    prisma.tournamentEntry.upsert({
      where: {
        divisionId_athleteId: {
          divisionId: boysDivision.id,
          athleteId: kimMinjun.id
        }
      },
      update: {
        tournamentId: tournament.id,
        organizationId: busanWombat.id,
        status: "CONFIRMED",
        seed: 1,
        notes: "시드 선수"
      },
      create: {
        tournamentId: tournament.id,
        divisionId: boysDivision.id,
        athleteId: kimMinjun.id,
        organizationId: busanWombat.id,
        status: "CONFIRMED",
        seed: 1,
        notes: "시드 선수"
      }
    }),
    prisma.tournamentEntry.upsert({
      where: {
        divisionId_athleteId: {
          divisionId: boysDivision.id,
          athleteId: leeDohyun.id
        }
      },
      update: {
        tournamentId: tournament.id,
        organizationId: busanHigh.id,
        status: "CONFIRMED",
        seed: 2
      },
      create: {
        tournamentId: tournament.id,
        divisionId: boysDivision.id,
        athleteId: leeDohyun.id,
        organizationId: busanHigh.id,
        status: "CONFIRMED",
        seed: 2
      }
    }),
    prisma.tournamentEntry.upsert({
      where: {
        divisionId_athleteId: {
          divisionId: girlsDivision.id,
          athleteId: parkJiyoon.id
        }
      },
      update: {
        tournamentId: tournament.id,
        organizationId: haeundaeClub.id,
        status: "CONFIRMED",
        seed: 1
      },
      create: {
        tournamentId: tournament.id,
        divisionId: girlsDivision.id,
        athleteId: parkJiyoon.id,
        organizationId: haeundaeClub.id,
        status: "CONFIRMED",
        seed: 1
      }
    }),
    prisma.tournamentEntry.upsert({
      where: {
        divisionId_athleteId: {
          divisionId: girlsDivision.id,
          athleteId: choiSeoyeon.id
        }
      },
      update: {
        tournamentId: tournament.id,
        organizationId: busanWombat.id,
        status: "CONFIRMED",
        seed: 2
      },
      create: {
        tournamentId: tournament.id,
        divisionId: girlsDivision.id,
        athleteId: choiSeoyeon.id,
        organizationId: busanWombat.id,
        status: "CONFIRMED",
        seed: 2
      }
    })
  ]);

  console.log(
    JSON.stringify(
      {
        masterUserEmail: masterUser.email,
        tournamentName: tournament.name,
        tournamentCode: tournament.code,
        seededOrganizations: [busanWombat.name, haeundaeClub.name, busanHigh.name],
        seededAthleteCount: athletes.length
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
