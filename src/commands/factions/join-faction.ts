import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getAllFactions, getFaction, joinFaction } from "../../util/db";
import { footer_icon_url } from "../../../config.json";

export default {
    data: await (async () => {
        const factions = await getAllFactions();

        return new SlashCommandBuilder()
            .setName("join-faction")
            .setDescription("Join the specified faction")
            .addStringOption(option =>
                option.setName("faction")
                    .setDescription("The faction")
                    .setRequired(true)
                    .addChoices(((): { name: string, value: string }[] => {
                        let ret: { name: string, value: string }[] = [];
                        factions.forEach(faction => {
                            ret.push({ name: faction.name, value: faction.id });
                        });
                        return ret;
                    })())
            )
    })(),
    execute: async (interaction: CommandInteraction) => {
        const faction_id = interaction.options.get("faction")?.value as string;
        const faction = await getFaction(faction_id);
        if(faction == null) {
            await interaction.reply("Faction was not found :(");
            return;
        }
        const user = interaction.user;
        await interaction.guild?.members.addRole({role: faction.role, user: user, reason: "Adding role for joining faction"});
        await joinFaction(user.id, faction_id);
        const faction_name = (await getAllFactions()).find(f => f.id == faction_id)?.name;
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x42baff)
                .setDescription(faction_name == undefined ? `The faction **${faction_id}** was not found :(` : `Joined **${faction_name}**!`)
                .setTimestamp()
                .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url })
            ]
        });
    }
};