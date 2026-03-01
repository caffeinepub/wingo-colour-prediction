import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bet, BetType, Round, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ─── User Profile ──────────────────────────────────────
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5_000,
  });
}

// ─── Current Round ─────────────────────────────────────
export function useCurrentRound() {
  const { actor, isFetching } = useActor();
  return useQuery<Round>({
    queryKey: ["currentRound"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCurrentRound();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 2_000,
    staleTime: 1_000,
  });
}

// ─── Is Admin ──────────────────────────────────────────
export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── Leaderboard ───────────────────────────────────────
export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, bigint]>>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

// ─── Bet History (for current user) ────────────────────
export function useBetHistory(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<Bet>>({
    queryKey: ["betHistory", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getBetHistory(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 5_000,
  });
}

// ─── Place Bet Mutation ─────────────────────────────────
export function usePlaceBet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      betType,
      amount,
    }: {
      betType: BetType;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.placeBet(betType, amount);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["currentRound"] });
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      void queryClient.invalidateQueries({ queryKey: ["betHistory"] });
    },
  });
}

// ─── Save Profile Mutation ──────────────────────────────
export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ─── Admin: Start Round ────────────────────────────────
export function useStartNewRound() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.startNewRound();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["currentRound"] });
    },
  });
}

// ─── Admin: Resolve Round ──────────────────────────────
export function useResolveRound() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.resolveRound(result);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["currentRound"] });
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      void queryClient.invalidateQueries({ queryKey: ["betHistory"] });
    },
  });
}

// ─── Check Round Timeout ───────────────────────────────
export function useCheckRoundTimeout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.checkRoundTimeout();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["currentRound"] });
    },
  });
}
