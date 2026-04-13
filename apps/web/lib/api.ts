import type { AthleteMatchHistoryRecord, BracketRecord, PublicTournamentView } from "@judo-bracket/types";

import { athleteHistoryDemo, publicTournamentDemo } from "./demo-data";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:4000/api";
const allowDemoFallback = process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK === "true";
const currentAthleteId = process.env.NEXT_PUBLIC_ATHLETE_ID ?? process.env.ATHLETE_ID ?? (allowDemoFallback ? athleteHistoryDemo.athlete.id : undefined);

type RemoteResult<T> =
  | { status: "success"; data: T }
  | { status: "not_found" }
  | { status: "error" };

async function readJson<T>(path: string): Promise<RemoteResult<T>> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: "no-store"
    });

    if (response.status === 404) {
      return { status: "not_found" };
    }

    if (!response.ok) {
      return { status: "error" };
    }

    return {
      status: "success",
      data: (await response.json()) as T
    };
  } catch {
    return { status: "error" };
  }
}

async function postJson<T>(path: string, token: string): Promise<RemoteResult<T>> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 404) {
      return { status: "not_found" };
    }

    if (!response.ok) {
      return { status: "error" };
    }

    return {
      status: "success",
      data: (await response.json()) as T
    };
  } catch {
    return { status: "error" };
  }
}

export async function getPublicTournamentViewByCode(code: string): Promise<RemoteResult<PublicTournamentView>> {
  const live = await readJson<PublicTournamentView>(`/tournaments/public/by-code/${code}`);
  if (live.status === "success") {
    if (!live.data.tournament) {
      return { status: "not_found" };
    }

    return live;
  }

  if (!allowDemoFallback) {
    return live;
  }

  return publicTournamentDemo.tournament?.code === code.toUpperCase()
    ? { status: "success", data: publicTournamentDemo }
    : live;
}

export async function getAthleteHistory(athleteId: string): Promise<RemoteResult<AthleteMatchHistoryRecord>> {
  const live = await readJson<AthleteMatchHistoryRecord>(`/athletes/${athleteId}/history`);
  if (live.status === "success") {
    return live;
  }

  if (!allowDemoFallback || athleteId !== athleteHistoryDemo.athlete.id) {
    return live;
  }

  return { status: "success", data: athleteHistoryDemo };
}

export function getCurrentAthleteId(): string | null {
  if (!currentAthleteId) {
    return null;
  }

  return currentAthleteId;
}

export async function generateBracket(divisionId: string, token: string): Promise<RemoteResult<BracketRecord>> {
  return postJson<BracketRecord>(`/brackets/divisions/${divisionId}/generate`, token);
}
