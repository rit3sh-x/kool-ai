import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import SuperJSON from 'superjson';
export const createTRPCContext = cache(async () => {
    return { auth: await auth() }
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
    transformer: SuperJSON,
});


const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.auth.userId) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this Kool.',
        })
    }
    return next({
        ctx: {
            auth: ctx.auth,
        }
    });
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);