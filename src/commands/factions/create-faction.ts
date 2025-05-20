import { ChannelType, CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { createFaction } from "../../util/db";
import { deploy } from "../../deploy-commands";
import { faction_channel_category, faction_role_create_below_role } from "../../../config.json";
import { getStaffRolesForPermissionOverwrites } from "../../util/util";

export default {
    data: new SlashCommandBuilder()
        .setName("create-faction")
        .setDescription("Create a new faction")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("The display name")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("id")
                .setDescription("The id")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("tag")
                .setDescription("The tag, e.g. NUKE")
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName("icon")
                .setDescription("The Faction's icon")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (interaction: CommandInteraction) => {
        if (interaction.guild == null) return;
        const name = interaction.options.get("name", true).value as string;
        const id = interaction.options.get("id", true).value as string;
        const tag = interaction.options.get("tag", true).value as string;
        let icon = interaction.options.get("icon")?.attachment;
        let attachment_url = "";
        if (icon == undefined) attachment_url = "";
        else attachment_url = icon.url;

        const faction_role_create_below = await interaction.guild.roles.fetch(faction_role_create_below_role);
        if (faction_role_create_below == null) {
            interaction.reply("Could not find the role to create the clan role below :(");
            return;
        }

        const faction_role = await interaction.guild.roles.create({
            name: tag,
            reason: "Creating role for new faction",
            position: faction_role_create_below.position
        });
        const faction_category = await interaction.guild.channels.fetch(faction_channel_category);
        if (faction_category == null || faction_category == undefined) {
            await interaction.reply("The category doesn't exist or could not be fetched :(");
            return;
        }
        let overwrites = getStaffRolesForPermissionOverwrites();
        overwrites.push({ id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: faction_role.id, allow: [PermissionFlagsBits.ViewChannel] });
        const channel = await interaction.guild?.channels.create({
            name: `🚩┃${tag}-talk`,
            reason: "Creating channel for new faction",
            type: ChannelType.GuildText,
            permissionOverwrites: overwrites,
            parent: faction_category.id
        });

        await createFaction({ name: name, id: id, icon: attachment_url, channel: channel.id, role: faction_role.id, tag: tag });
        await deploy();
        if (attachment_url == "") await interaction.reply({ content: "Done" });
        else await interaction.reply({ content: "Done", files: [attachment_url] });
    }
};