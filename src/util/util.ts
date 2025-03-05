import { CommandInteraction, SlashCommandBuilder } from "discord.js";

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

export function addPointsToCurrentMonth(user_id: string, points: number) {
    // TODO
}