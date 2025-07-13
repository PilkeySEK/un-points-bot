import { CommandInteraction, GuildMember, OverwriteResolvable, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder, User } from "discord.js";
import { addDailyPoints } from "./db";
import { staff_roles } from "../../config.json";
import { getLeaderboard, LeaderboardData } from "../api/api";

export class Command {
    constructor(data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>) {
        this.data = data;
        this.execute = execute;
    }
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

export function getLastMonthEnd(): number {
    let date = new Date();

    let end_of_last_month = new Date();
    let last_month = date.getUTCMonth() - 1;
    if (last_month == -1) last_month = 11;
    end_of_last_month.setUTCMonth(last_month);
    end_of_last_month.setUTCHours(23);
    end_of_last_month.setUTCMinutes(59);
    end_of_last_month.setUTCSeconds(59);
    end_of_last_month.setUTCDate(daysInMonth(last_month, date.getUTCFullYear()));
    console.log(`DaysInMonth: ${daysInMonth(last_month, date.getUTCFullYear())}\nLast Month: ${last_month}`);
    return end_of_last_month.getTime();
}

function daysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getUTCDate() + 1;
}

export async function addPointsToCurrentDay(user_id: string, points: number) {
    let date = new Date();
    const current_day = date.getUTCDate();
    const current_month = date.getUTCMonth();
    const current_year = date.getUTCFullYear();
    await addDailyPoints(user_id, points, current_day, current_month, current_year);
}

export async function isStaff(user: GuildMember): Promise<boolean> {
    let is_staff: boolean = false;
    for(const id in staff_roles) {
        if(user.roles.cache.some(role => role.id == id)) {
            is_staff = true;
            break;
        }
    }
    return user.permissions.has(PermissionsBitField.Flags.Administrator) || is_staff;
}

export function getStaffRolesForPermissionOverwrites() {
    let ret: OverwriteResolvable[] = [];
    staff_roles.forEach(id => {
        ret.push({id: id, allow: [PermissionFlagsBits.ViewChannel]});
    });
    return ret;
}

/**
 * Page is zero-indexed
 */
export async function getLeaderboardPage(lb: LeaderboardData | undefined, page: number, entriesPerPage: number = 5) {
    if(lb === undefined) return undefined;
    const start = page * entriesPerPage;
    const end = start + entriesPerPage;
    const ret: LeaderboardData = [];
    for(let i = start; i < end; i++) {
        ret.push(lb[i]);
    }
    return ret;
}

export function countLeaderboardPages(lb: LeaderboardData | undefined, entriesPerPage: number = 5) {
    if(lb === undefined) return -1;
    return Math.ceil(lb.length / entriesPerPage);
}