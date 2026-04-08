import { Inject, Injectable } from "@nestjs/common";

import type { AthleteMatchHistoryRecord, AthleteRecord, CreateAthleteInput, UpdateAthleteInput } from "@judo-bracket/types";

import { Prisma } from "../../generated/prisma/client";
import type { Athlete } from "../../generated/prisma/client";
import { mapAthleteRecordWithOrganization, mapMatchDetailRecord } from "../../common/mappers";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class AthletesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private isKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
  }

  async listAll(): Promise<AthleteRecord[]> {
    const athletes = await this.prisma.athlete.findMany({
      include: {
        organization: true
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
    });
    return athletes.map((athlete) => mapAthleteRecordWithOrganization(athlete));
  }

  async listByOrganizationIds(organizationIds: string[]): Promise<AthleteRecord[]> {
    const athletes = await this.prisma.athlete.findMany({
      where: { organizationId: { in: organizationIds } },
      include: {
        organization: true
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
    });
    return athletes.map((athlete) => mapAthleteRecordWithOrganization(athlete));
  }

  async getById(athleteId: string): Promise<AthleteRecord | undefined> {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: athleteId },
      include: {
        organization: true
      }
    });
    if (!athlete) {
      return undefined;
    }

    return mapAthleteRecordWithOrganization(athlete);
  }

  async create(input: CreateAthleteInput): Promise<AthleteRecord> {
    let athlete: Athlete;

    try {
      athlete = await this.prisma.athlete.create({
        data: {
          userId: input.userId,
          organizationId: input.organizationId,
          firstName: input.firstName,
          lastName: input.lastName,
          gender: input.gender,
          birthDate: new Date(input.birthDate),
          beltLevel: input.beltLevel,
          weightClassLabel: input.weightClassLabel,
          ageDivisionLabel: input.ageDivisionLabel
        }
      });
    } catch (error) {
      if (this.isKnownRequestError(error) && error.code === "P2003") {
        throw new Error("Referenced user or organization does not exist.");
      }

      throw error;
    }

    return {
      id: athlete.id,
      userId: athlete.userId ?? undefined,
      organizationId: athlete.organizationId,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      gender: athlete.gender,
      birthDate: athlete.birthDate.toISOString().slice(0, 10),
      beltLevel: athlete.beltLevel ?? undefined,
      weightClassLabel: athlete.weightClassLabel,
      ageDivisionLabel: athlete.ageDivisionLabel
    };
  }

  async update(athleteId: string, input: UpdateAthleteInput): Promise<AthleteRecord | undefined> {
    const existingAthlete = await this.prisma.athlete.findUnique({
      where: { id: athleteId }
    });
    if (!existingAthlete) {
      return undefined;
    }

    const athlete = await this.prisma.athlete.update({
      where: { id: athleteId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
        beltLevel: input.beltLevel,
        weightClassLabel: input.weightClassLabel,
        ageDivisionLabel: input.ageDivisionLabel
      }
    });

    return {
      id: athlete.id,
      userId: athlete.userId ?? undefined,
      organizationId: athlete.organizationId,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      gender: athlete.gender,
      birthDate: athlete.birthDate.toISOString().slice(0, 10),
      beltLevel: athlete.beltLevel ?? undefined,
      weightClassLabel: athlete.weightClassLabel,
      ageDivisionLabel: athlete.ageDivisionLabel
    };
  }

  async remove(athleteId: string) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: athleteId }
    });
    if (!athlete) {
      return { removed: false };
    }

    await this.prisma.athlete.delete({ where: { id: athleteId } });
    return { removed: true };
  }

  async getMatchHistory(athleteId: string): Promise<AthleteMatchHistoryRecord | undefined> {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: athleteId },
      include: {
        organization: true,
        homeMatches: {
          include: {
            bracket: {
              include: {
                tournament: true,
                division: true
              }
            },
            homeAthlete: { include: { organization: true } },
            awayAthlete: { include: { organization: true } },
            winnerAthlete: { include: { organization: true } },
            scoreEvents: {
              orderBy: [{ occurredAtSeconds: "asc" }, { createdAt: "asc" }]
            }
          }
        },
        awayMatches: {
          include: {
            bracket: {
              include: {
                tournament: true,
                division: true
              }
            },
            homeAthlete: { include: { organization: true } },
            awayAthlete: { include: { organization: true } },
            winnerAthlete: { include: { organization: true } },
            scoreEvents: {
              orderBy: [{ occurredAtSeconds: "asc" }, { createdAt: "asc" }]
            }
          }
        }
      }
    });

    if (!athlete) {
      return undefined;
    }

    const matches = [...athlete.homeMatches, ...athlete.awayMatches]
      .sort((left, right) => {
        const leftTime = left.completedAt?.getTime() ?? left.createdAt.getTime();
        const rightTime = right.completedAt?.getTime() ?? right.createdAt.getTime();
        return rightTime - leftTime;
      })
      .map((match) => mapMatchDetailRecord(match, match.scoreEvents));

    return {
      athlete: mapAthleteRecordWithOrganization(athlete),
      matches
    };
  }

  getMvpCapabilities() {
    return ["register", "update", "delete", "listByOrganization"] as const;
  }
}
