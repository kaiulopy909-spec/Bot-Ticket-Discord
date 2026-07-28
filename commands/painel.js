const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require("discord.js");

const {
    pegarConfiguracao,
    criarEmbedAdministrativo,
    criarBotoesAdministrativos
} = require("../utils/painelConfig.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("painel")
        .setDescription(
            "Abre a configuração do painel de tickets"
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {
        const configuracao =
            pegarConfiguracao(interaction.guild.id);

        await interaction.reply({
            embeds: [
                criarEmbedAdministrativo(
                    configuracao
                )
            ],

            components:
                criarBotoesAdministrativos(),

            flags: MessageFlags.Ephemeral
        });
    }
};