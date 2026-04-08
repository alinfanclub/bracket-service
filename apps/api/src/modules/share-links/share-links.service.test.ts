import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../common/prisma.service";
import { ShareLinksService } from "./share-links.service";

describe("ShareLinksService", () => {
  it("creates a share link with a unique slug", async () => {
    const prisma = {
      tournament: { findUnique: vi.fn().mockResolvedValue({ id: "tournament-1" }) },
      shareLink: {
        create: vi.fn().mockResolvedValue({
          id: "link-1",
          tournamentId: "tournament-1",
          slug: "abc123xyz",
          isActive: true,
          expiresAt: null,
          createdAt: new Date("2026-04-04T10:00:00.000Z")
        })
      }
    } as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    const link = await service.createShareLink({ tournamentId: "tournament-1" });

    expect(link.slug).toBeDefined();
    expect(link.slug.length).toBeGreaterThan(0);
    expect(link.isActive).toBe(true);
  });

  it("rejects creating share link for non-existent tournament", async () => {
    const prisma = {
      tournament: { findUnique: vi.fn().mockResolvedValue(null) }
    } as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    await expect(service.createShareLink({ tournamentId: "non-existent" }))
      .rejects.toThrow("Tournament not found.");
  });

  it("returns undefined for non-existent slug", async () => {
    const prisma = {
      shareLink: { findUnique: vi.fn().mockResolvedValue(null) }
    } as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    const link = await service.getBySlug("non-existent");

    expect(link).toBeUndefined();
  });

  it("returns valid=true for active non-expired link", async () => {
    const prisma = {
      shareLink: {
        findUnique: vi.fn().mockResolvedValue({
          id: "link-1",
          tournamentId: "tournament-1",
          slug: "valid123",
          isActive: true,
          expiresAt: new Date("2026-12-31T23:59:59.000Z"),
          createdAt: new Date("2026-04-04T10:00:00.000Z")
        })
      }
    } as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    const link = await service.getBySlug("valid123");
    const isValid = await service.isLinkValid(link!);

    expect(isValid).toBe(true);
  });

  it("returns valid=false for inactive link", async () => {
    const link = {
      id: "link-1",
      tournamentId: "tournament-1",
      slug: "inactive",
      isActive: false,
      createdAt: "2026-04-04T10:00:00.000Z"
    };
    const prisma = {} as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    const isValid = await service.isLinkValid(link);

    expect(isValid).toBe(false);
  });

  it("returns valid=false for expired link", async () => {
    const link = {
      id: "link-1",
      tournamentId: "tournament-1",
      slug: "expired",
      isActive: true,
      expiresAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-04-04T10:00:00.000Z"
    };
    const prisma = {} as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    const isValid = await service.isLinkValid(link);

    expect(isValid).toBe(false);
  });

  it("returns undefined for expired share link public view", async () => {
    const prisma = {
      shareLink: {
        findUnique: vi.fn().mockResolvedValue({
          id: "link-1",
          tournamentId: "tournament-1",
          slug: "expired",
          isActive: true,
          expiresAt: new Date("2026-01-01T00:00:00.000Z"),
          createdAt: new Date("2026-04-04T10:00:00.000Z"),
          tournament: {
            id: "tournament-1",
            createdById: "admin-1",
            name: "Spring Open",
            code: "SPRING",
            venue: "Arena",
            startsAt: new Date("2026-04-10T09:00:00.000Z"),
            endsAt: null,
            status: "PUBLISHED",
            divisions: [],
            entries: [],
            brackets: []
          }
        })
      }
    } as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    const view = await service.getPublicViewBySlug("expired");

    expect(view).toBeUndefined();
  });

  it("deactivates a share link", async () => {
    const prisma = {
      shareLink: {
        findUnique: vi.fn().mockResolvedValue({
          id: "link-1",
          tournamentId: "tournament-1",
          slug: "todeactivate",
          isActive: true,
          expiresAt: null,
          createdAt: new Date("2026-04-04T10:00:00.000Z")
        }),
        update: vi.fn().mockResolvedValue({
          id: "link-1",
          tournamentId: "tournament-1",
          slug: "todeactivate",
          isActive: false,
          expiresAt: null,
          createdAt: new Date("2026-04-04T10:00:00.000Z")
        })
      }
    } as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    const result = await service.deactivateShareLink("link-1");

    expect(result?.isActive).toBe(false);
  });

  it("returns undefined when deactivating non-existent link", async () => {
    const prisma = {
      shareLink: { findUnique: vi.fn().mockResolvedValue(null) }
    } as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    const result = await service.deactivateShareLink("non-existent");

    expect(result).toBeUndefined();
  });

  it("lists share links by tournament ordered by createdAt desc", async () => {
    const prisma = {
      shareLink: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "link-2",
            tournamentId: "tournament-1",
            slug: "newer",
            isActive: true,
            expiresAt: null,
            createdAt: new Date("2026-04-04T12:00:00.000Z")
          },
          {
            id: "link-1",
            tournamentId: "tournament-1",
            slug: "older",
            isActive: true,
            expiresAt: null,
            createdAt: new Date("2026-04-04T10:00:00.000Z")
          }
        ])
      }
    } as unknown as PrismaService;
    const service = new ShareLinksService(prisma);

    const links = await service.listByTournament("tournament-1");

    expect(links).toHaveLength(2);
    expect(links[0].slug).toBe("newer");
    expect(links[1].slug).toBe("older");
  });
});
