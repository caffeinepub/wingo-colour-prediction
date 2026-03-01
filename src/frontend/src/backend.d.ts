import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type BetType = {
    __kind__: "number";
    number: bigint;
} | {
    __kind__: "colour";
    colour: Colour;
};
export interface Bet {
    result?: bigint;
    user: Principal;
    betType: BetType;
    roundId: bigint;
    amount: bigint;
    payout: bigint;
}
export interface Round {
    id: bigint;
    startTime: bigint;
    status: RoundStatus;
    result?: bigint;
    bets: Array<Bet>;
}
export interface UserProfile {
    balance: bigint;
    betHistory: Array<Bet>;
}
export enum Colour {
    red = "red",
    green = "green",
    violet = "violet"
}
export enum RoundStatus {
    resolved = "resolved",
    closed = "closed",
    open = "open"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkRoundTimeout(): Promise<void>;
    getBetHistory(user: Principal): Promise<Array<Bet>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentRound(): Promise<Round>;
    getLeaderboard(): Promise<Array<[Principal, bigint]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeBet(betType: BetType, amount: bigint): Promise<void>;
    resolveRound(result: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startNewRound(): Promise<void>;
}
