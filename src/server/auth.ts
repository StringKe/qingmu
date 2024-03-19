import { PrismaAdapter } from '@auth/prisma-adapter';
import { getServerSession } from 'next-auth';
import { type Adapter } from 'next-auth/adapters';
import DiscordProvider from 'next-auth/providers/discord';
import GithubProvider from 'next-auth/providers/github';
import { type OAuthConfig } from 'next-auth/providers/oauth';

import type { DefaultSession, NextAuthOptions } from 'next-auth';

import { env } from '~/env';
import { db } from '~/server/db';

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string;
        } & User &
            DefaultSession['user'];
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User {
        // id: string;
    }
}

export const authOptions: NextAuthOptions = {
    callbacks: {
        session: ({ session, user }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id,
            },
        }),
    },
    adapter: PrismaAdapter(db) as Adapter,
    providers: [
        // Gitee
        {
            id: 'gitee',
            name: 'Gitee',
            type: 'oauth',
            version: '2.0',
            authorization: {
                url: 'https://gitee.com/oauth/authorize',
                params: { response_type: 'code', scope: 'user_info' },
            },
            token: 'https://gitee.com/oauth/token',
            userinfo: 'https://gitee.com/api/v5/user',
            profile: (profile) => {
                const isEmail = /@/.test(profile.email);
                return {
                    id: profile.id.toString(),
                    name: profile.name,
                    email: isEmail ? profile.email : undefined,
                    image: profile.avatar_url,
                };
            },
            clientId: env.GITEE_CLIENT_ID,
            clientSecret: env.GITEE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        } as OAuthConfig<{
            id: number;
            name: string;
            email: string;
            avatar_url: string;
        }>,
        DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        GithubProvider({
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
