import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "@/lib/prismaClient";
import { auth } from "@clerk/nextjs/server";

const FREE_TIER_LIMIT = 10;
const PREMIUM_TIER_LIMIT = 100;
const GENERATION_COST = 1;

export async function getUsageTracker() {
    const { has } = await auth();
    const hasPremiumAccess = has({ plan: "premium" });
    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: "Usage",
        points: hasPremiumAccess ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT,
        duration: 60 * 60 * 24 * 30,
    });
    return usageTracker;
}

export async function consumeCredit() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not Authenticated");
    }

    const usageTracker = await getUsageTracker();
    const result = await usageTracker.consume(userId, GENERATION_COST);
    return result;
}

export async function getUsageStatus() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not Authenticated");
    }

    const usageTracker = await getUsageTracker();
    const result = await usageTracker.get(userId);
    return result;
}