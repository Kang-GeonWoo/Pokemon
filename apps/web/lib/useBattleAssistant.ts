// apps/web/lib/useBattleAssistant.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SlotNum = 1 | 2 | 3 | 4 | 5 | 6;

type PredictionMove = {
  move_id: string;
  p: number;
  locked: boolean;
};

type PredictionSlot = {
  slot: number;
  slot_id: string;
  species_id: string;
  moves: PredictionMove[];
};

type PredictResponse = {
  session_id: string;
  stats_version_id: string;
  predictions: PredictionSlot[];
};

type SessionResponse = {
  session: {
    id: string;
    userId: string;
    formatId: string;
    rulesetSnapshotId: string;
    statsVersionId: string;
    createdAt: string;
    updatedAt: string;
  };
};

function apiBase(): string {
  // Next.js client에서 NEXT_PUBLIC_* 만 접근 가능
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBase()}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${txt}`);
  }
  return (await res.json()) as T;
}

export function useBattleAssistant() {
  const [sid, setSid] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 입력 슬롯(1~6)
  const [slots, setSlots] = useState<Record<number, string>>({ 1: "", 2: "", 3: "", 4: "", 5: "", 6: "" });

  // 예측 결과
  const [pred, setPred] = useState<PredictResponse | null>(null);

  const canRun = useMemo(() => Boolean(sid), [sid]);

  const createSession = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = {
        user_id: "local-dev-user",
        format_id: "gen9ou",
      };
      const res = await apiFetch<SessionResponse>("/api/battle/session", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setSid(res.session.id);
      setPred(null);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // 최초 1회 세션 자동 생성
  useEffect(() => {
    createSession();
  }, [createSession]);

  const reset = useCallback(() => {
    setSlots({ 1: "", 2: "", 3: "", 4: "", 5: "", 6: "" });
    setPred(null);
    setError("");
  }, []);

  const resetSession = useCallback(async () => {
    reset();
    await createSession();
  }, [createSession, reset]);

  const saveSlotsAndPredict = useCallback(async () => {
    if (!sid) return;

    setLoading(true);
    setError("");

    try {
      // 1) opponent slot 6개 upsert
      const s1 = (slots[1] || "").trim().toLowerCase();
      const s2 = (slots[2] || "").trim().toLowerCase();
      const s3 = (slots[3] || "").trim().toLowerCase();
      const s4 = (slots[4] || "").trim().toLowerCase();
      const s5 = (slots[5] || "").trim().toLowerCase();
      const s6 = (slots[6] || "").trim().toLowerCase();

      const speciesList: Array<[SlotNum, string]> = [
        [1, s1],
        [2, s2],
        [3, s3],
        [4, s4],
        [5, s5],
        [6, s6],
      ];

      for (const [slot, species_id] of speciesList) {
        if (!species_id) continue;
        await apiFetch("/api/battle/opponent/slot", {
          method: "POST",
          body: JSON.stringify({ session_id: sid, slot, species_id }),
        });
      }

      // 2) predict
      const p = await apiFetch<PredictResponse>("/api/predict/moves", {
        method: "POST",
        body: JSON.stringify({ session_id: sid }),
      });

      setPred(p);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [sid, slots]);

  const lockMove = useCallback(
    async (slotId: string, moveId: string) => {
      if (!sid) return;
      setLoading(true);
      setError("");
      try {
        await apiFetch("/api/battle/opponent/move", {
          method: "POST",
          body: JSON.stringify({ slot_id: slotId, move_id: moveId, status: "LOCKED" }),
        });

        // 다시 예측 갱신(locked 반영)
        const p = await apiFetch<PredictResponse>("/api/predict/moves", {
          method: "POST",
          body: JSON.stringify({ session_id: sid }),
        });
        setPred(p);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    },
    [sid]
  );

  const banMove = useCallback(
    async (slotId: string, moveId: string) => {
      if (!sid) return;
      setLoading(true);
      setError("");
      try {
        await apiFetch("/api/battle/opponent/move", {
          method: "POST",
          body: JSON.stringify({ slot_id: slotId, move_id: moveId, status: "BANNED" }),
        });

        const p = await apiFetch<PredictResponse>("/api/predict/moves", {
          method: "POST",
          body: JSON.stringify({ session_id: sid }),
        });
        setPred(p);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    },
    [sid]
  );

  // ⚠️ clearMove: 서버에 "삭제/해제" 엔드포인트가 있어야 진짜로 지워짐
  // 일단은 “세션 새로 시작(resetSession)”이 MVP 안전 루트.
  const clearMove = useCallback(
    async (_slotId: string, _moveId: string) => {
      // 서버에 clear API가 없다면 여기서는 안전하게 세션 리셋 권장
      await resetSession();
    },
    [resetSession]
  );

  return {
    sid,
    loading,
    error,
    slots,
    setSlots,
    pred,
    saveSlotsAndPredict,
    lockMove,
    banMove,
    clearMove,
    reset,
    resetSession,
    canRun,
  };
}
