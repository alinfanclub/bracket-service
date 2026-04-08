import { ConflictException, Inject, Injectable } from "@nestjs/common";

import type { CreateOrganizationInput, OrganizationRecord } from "@judo-bracket/types";

import { Prisma } from "../../generated/prisma/client";
import type { Organization } from "../../generated/prisma/client";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class OrganizationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private isKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
  }

  async listAll(): Promise<OrganizationRecord[]> {
    const organizations = await this.prisma.organization.findMany({
      orderBy: { name: "asc" }
    });
    return organizations.map((organization: Organization) => ({
      id: organization.id,
      name: organization.name,
      code: organization.code,
      type: organization.type
    }));
  }

  async listByIds(organizationIds: string[]): Promise<OrganizationRecord[]> {
    const organizations = await this.prisma.organization.findMany({
      where: { id: { in: organizationIds } },
      orderBy: { name: "asc" }
    });
    return organizations.map((organization: Organization) => ({
      id: organization.id,
      name: organization.name,
      code: organization.code,
      type: organization.type
    }));
  }

  async getById(organizationId: string): Promise<OrganizationRecord | undefined> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return undefined;
    }

    return {
      id: organization.id,
      name: organization.name,
      code: organization.code,
      type: organization.type
    };
  }

  async create(input: CreateOrganizationInput): Promise<OrganizationRecord> {
    const normalizedCode = input.code.toUpperCase();

    const existingOrganization = await this.prisma.organization.findUnique({
      where: { code: normalizedCode }
    });

    if (existingOrganization) {
      throw new ConflictException("Organization code already exists.");
    }

    let organization: Organization;

    try {
      organization = await this.prisma.organization.create({
        data: {
          name: input.name,
          code: normalizedCode,
          type: input.type
        }
      });
    } catch (error) {
      if (this.isKnownRequestError(error) && error.code === "P2002") {
        throw new ConflictException("Organization code already exists.");
      }

      throw error;
    }

    return {
      id: organization.id,
      name: organization.name,
      code: organization.code,
      type: organization.type
    };
  }

  listOrganizationScopes() {
    return ["SCHOOL", "DOJO", "CLUB"] as const;
  }
}
