export type publicId = string;
export type gameId = string;


export interface PlayerData {
    createdAt: string;
    user: {
        id: string;
        username: string;
        discriminator: string;
        global_name: string;
        avatar: string;
    };
    games: {
        gameId: gameId
        start: string;
        mode: string;
        type: string;
        map: string;
        difficulty: string;
        cliendId: string;
    }[];
    stats: {
        Public: {
            "Free For All": {
                Medium: {
                    wins: string;
                    losses: string;
                    total: string;
                }
            }
        }
    }; // there are more stats but it's too much to list rn
}

export type LeaderboardData = {
    wlr: string;
    wins: string;
    losses: string;
    total: string;
    public_id: string | null;
    user: {
        id: string;
        username: string;
        discriminator: string;
        global_name: string;
        avatar: string;
    } | null;
}[];

export async function playerData(id: publicId) {
    const res = await fetch(`https://api.openfront.io/player/${id}`);
    if(!res.ok) {
        return undefined;
    }
    return (await res.json()) as PlayerData;
}

export async function getLeaderboard() {
    const res = await fetch("https://api.openfront.io/leaderboard/public/ffa");
    if(!res.ok) {
        return undefined;
    }
    return (await res.json()) as LeaderboardData;
}