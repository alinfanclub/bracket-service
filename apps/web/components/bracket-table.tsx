import type { BracketRecord, MatchRecord } from "@judo-bracket/types";

interface BracketTableProps {
  bracket?: BracketRecord;
}

interface RoundColumn {
  roundNumber: number;
  label: string;
  matches: MatchRecord[];
}

const COLUMN_WIDTH = 240;
const COLUMN_GAP = 56;
const MATCH_HEIGHT = 88;
const MATCH_HEADER_HEIGHT = 32;
const ROW_GAP = 24;
const HEADER_HEIGHT = 44;
const CANVAS_PADDING = 16;
const LINE_WIDTH = 2;

function getRoundLabel(matchCount: number, roundIndex: number): string {
  if (matchCount === 1) {
    return "결승";
  }

  if (matchCount === 2) {
    return "4강";
  }

  if (matchCount === 4) {
    return "8강";
  }

  if (matchCount === 8) {
    return "16강";
  }

  if (roundIndex === 0) {
    return "1라운드";
  }

  return `${matchCount * 2}강`;
}

function getStatusLabel(status: MatchRecord["status"]): string {
  switch (status) {
    case "PENDING":
      return "대기";
    case "READY":
      return "준비";
    case "IN_PROGRESS":
      return "진행 중";
    case "COMPLETED":
      return "종료";
    case "BYE":
      return "부전승";
    default:
      return status;
  }
}

function getStatusStyle(status: MatchRecord["status"]) {
  if (status === "IN_PROGRESS") {
    return {
      background: "var(--color-text-strong)",
      border: "1px solid var(--color-text-strong)",
      color: "var(--color-surface)"
    };
  }

  if (status === "COMPLETED") {
    return {
      background: "var(--color-surface-muted)",
      border: "1px solid var(--color-border-subtle)",
      color: "var(--color-text-strong)"
    };
  }

  return {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border-subtle)",
    color: "var(--color-text-muted)"
  };
}

function buildRounds(bracket?: BracketRecord): RoundColumn[] {
  if (!bracket || bracket.matches.length === 0) {
    return [];
  }

  const grouped = bracket.matches.reduce<Map<number, MatchRecord[]>>((acc, match) => {
    const current = acc.get(match.roundNumber) ?? [];
    current.push(match);
    acc.set(match.roundNumber, current);
    return acc;
  }, new Map());

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left - right)
    .map(([roundNumber, matches], roundIndex) => ({
      roundNumber,
      label: getRoundLabel(matches.length, roundIndex),
      matches: matches.slice().sort((left, right) => left.matchNumber - right.matchNumber)
    }));
}

function getWinnerName(match: MatchRecord): string | undefined {
  if (match.winnerAthleteName) {
    return match.winnerAthleteName;
  }

  if (match.status === "BYE") {
    return match.homeAthleteName ?? match.awayAthleteName;
  }

  return undefined;
}

function getSlotName(match: MatchRecord, side: "home" | "away"): string {
  const name = side === "home" ? match.homeAthleteName : match.awayAthleteName;

  if (name) {
    return name;
  }

  if (match.status === "BYE") {
    return side === "home" ? (match.awayAthleteName ? "부전승" : "미정") : match.homeAthleteName ? "부전승" : "미정";
  }

  return "TBD";
}

function getSlotState(match: MatchRecord, side: "home" | "away") {
  const name = getSlotName(match, side);
  const winnerName = getWinnerName(match);
  const isWinner = Boolean(winnerName) && name === winnerName;
  const isEmpty = name === "TBD" || name === "미정";

  return { name, isWinner, isEmpty };
}

function getMatchTop(roundIndex: number, matchIndex: number): number {
  const blockHeight = (MATCH_HEIGHT + ROW_GAP) * (2 ** roundIndex);
  return CANVAS_PADDING + blockHeight / 2 - MATCH_HEIGHT / 2 + matchIndex * blockHeight;
}

export function BracketTable({ bracket }: BracketTableProps) {
  const rounds = buildRounds(bracket);

  if (rounds.length === 0) {
    return (
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          border: "1px dashed var(--color-border-strong)",
          background: "var(--color-surface)",
          padding: "var(--space-6)",
          color: "var(--color-text-muted)",
          textAlign: "center"
        }}
      >
        생성된 대진표가 없습니다.
      </div>
    );
  }

  const firstRoundMatches = rounds[0]?.matches.length ?? 1;
  const canvasWidth = rounds.length * COLUMN_WIDTH + Math.max(0, rounds.length - 1) * COLUMN_GAP;
  const canvasHeight = Math.max(
    MATCH_HEIGHT + CANVAS_PADDING * 2,
    firstRoundMatches * (MATCH_HEIGHT + ROW_GAP) - ROW_GAP + CANVAS_PADDING * 2
  );

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--space-4)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border-subtle)",
        background: "var(--color-surface)",
        padding: "var(--space-4)",
        boxShadow: "var(--shadow-card)"
      }}
    >
      <div style={{ overflowX: "auto", paddingBottom: "var(--space-2)" }}>
        <div style={{ minWidth: canvasWidth }}>
          <div
            style={{
              display: "flex",
              gap: `${COLUMN_GAP}px`,
              marginBottom: "var(--space-4)"
            }}
          >
            {rounds.map((round) => (
              <div
                key={round.roundNumber}
                style={{
                  width: COLUMN_WIDTH,
                  minWidth: COLUMN_WIDTH,
                  height: HEADER_HEIGHT,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border-subtle)",
                  background: "var(--color-surface-muted)",
                  padding: "0 var(--space-4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <strong style={{ color: "var(--color-text-strong)", fontSize: 14 }}>{round.label}</strong>
                <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{round.matches.length}경기</span>
              </div>
            ))}
          </div>

          <div
            style={{
              position: "relative",
              width: canvasWidth,
              height: canvasHeight
            }}
          >
            {rounds.map((round, roundIndex) => {
              const columnLeft = roundIndex * (COLUMN_WIDTH + COLUMN_GAP);
              const connectorLeft = columnLeft + COLUMN_WIDTH + COLUMN_GAP / 2 - LINE_WIDTH / 2;

              return (
                <div key={round.roundNumber}>
                  {round.matches.map((match, matchIndex) => {
                    const top = getMatchTop(roundIndex, matchIndex);
                    const centerY = top + MATCH_HEIGHT / 2;
                    const home = getSlotState(match, "home");
                    const away = getSlotState(match, "away");
                    const statusStyle = getStatusStyle(match.status);

                    return (
                      <div key={match.id}>
                        {roundIndex > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              left: columnLeft - COLUMN_GAP / 2,
                              top: centerY - LINE_WIDTH / 2,
                              width: COLUMN_GAP / 2,
                              height: LINE_WIDTH,
                              background: "var(--color-border-strong)"
                            }}
                          />
                        )}

                        {roundIndex < rounds.length - 1 && (
                          <div
                            style={{
                              position: "absolute",
                              left: columnLeft + COLUMN_WIDTH,
                              top: centerY - LINE_WIDTH / 2,
                              width: COLUMN_GAP / 2,
                              height: LINE_WIDTH,
                              background: "var(--color-border-strong)"
                            }}
                          />
                        )}

                        <article
                          style={{
                            position: "absolute",
                            left: columnLeft,
                            top,
                            width: COLUMN_WIDTH,
                            height: MATCH_HEIGHT,
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid var(--color-border-subtle)",
                            background: "var(--color-surface)",
                            overflow: "hidden",
                            boxShadow: "var(--shadow-card)"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "var(--space-2)",
                              height: MATCH_HEADER_HEIGHT,
                              padding: "0 var(--space-3)",
                              borderBottom: "1px solid var(--color-border-subtle)",
                              background: "var(--color-surface-muted)"
                            }}
                          >
                            <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                              Match {match.matchNumber}
                            </span>
                            <span
                              style={{
                                ...statusStyle,
                                borderRadius: 9999,
                                padding: "2px 8px",
                                fontSize: 11,
                                fontWeight: 700,
                                lineHeight: 1.4,
                                whiteSpace: "nowrap"
                              }}
                            >
                              {getStatusLabel(match.status)}
                            </span>
                          </div>

                          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", height: MATCH_HEIGHT - MATCH_HEADER_HEIGHT }}>
                            {[home, away].map((slot, slotIndex) => (
                              <div
                                key={`${match.id}-${slotIndex}`}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0 var(--space-3)",
                                  background: slot.isWinner ? "var(--color-surface-muted)" : "var(--color-surface)",
                                  borderTop: slotIndex === 1 ? "1px solid var(--color-border-subtle)" : "none"
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 14,
                                    fontWeight: slot.isWinner ? 700 : 500,
                                    color: slot.isEmpty ? "var(--color-text-muted)" : "var(--color-text-strong)",
                                    opacity: slot.isEmpty ? 0.7 : 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {slot.name}
                                </span>
                                {slot.isWinner && (
                                  <span style={{ color: "var(--color-text-strong)", fontSize: 12, fontWeight: 700 }}>
                                    WIN
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </article>
                      </div>
                    );
                  })}

                  {roundIndex < rounds.length - 1 &&
                    round.matches.map((_, matchIndex) => {
                      if (matchIndex % 2 !== 0 || !round.matches[matchIndex + 1]) {
                        return null;
                      }

                      const upperCenter = getMatchTop(roundIndex, matchIndex) + MATCH_HEIGHT / 2;
                      const lowerCenter = getMatchTop(roundIndex, matchIndex + 1) + MATCH_HEIGHT / 2;

                      return (
                        <div
                          key={`connector-${round.roundNumber}-${matchIndex}`}
                          style={{
                            position: "absolute",
                            left: connectorLeft,
                            top: upperCenter,
                            width: LINE_WIDTH,
                            height: lowerCenter - upperCenter,
                            background: "var(--color-border-strong)"
                          }}
                        />
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
