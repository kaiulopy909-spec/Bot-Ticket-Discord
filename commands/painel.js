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


// ========================================
// CARGO BLOQUEADO DO PAINEL ADMINISTRATIVO
// ========================================

// Cole entre as aspas o ID do cargo "Membro".
//
// Exemplo:
// const CARGO_MEMBRO_ID = "123456789012345678";

const CARGO_MEMBRO_ID = "1531432066783248434";


module.exports = {
    data: new SlashCommandBuilder()
        .setName("painel")
        .setDescription(
            "Abre a configuração do painel de tickets"
        )

        // Somente administradores conseguem usar
        // o comando /painel.
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),


    async execute(interaction) {
        try {
            // ========================================
            // VERIFICAR SE O COMANDO FOI USADO
            // DENTRO DE UM SERVIDOR
            // ========================================

            if (!interaction.guild) {
                await interaction.reply({
                    content:
                        "❌ Este comando só pode ser usado dentro de um servidor.",

                    flags: MessageFlags.Ephemeral
                });

                return;
            }


            // ========================================
            // PEGAR O MEMBRO QUE USOU O COMANDO
            // ========================================

            const membro = interaction.member;

            let possuiCargoMembro = false;


            // ========================================
            // VERIFICAR O CARGO MEMBRO
            // ========================================

            // Verificação normal usando o cache
            // de cargos do Discord.
            if (membro?.roles?.cache) {
                possuiCargoMembro =
                    membro.roles.cache.has(
                        CARGO_MEMBRO_ID
                    );
            }

            // Verificação alternativa caso o Discord
            // retorne somente uma lista de IDs.
            if (
                Array.isArray(membro?.roles) &&
                membro.roles.includes(
                    CARGO_MEMBRO_ID
                )
            ) {
                possuiCargoMembro = true;
            }


            // ========================================
            // BLOQUEAR O CARGO MEMBRO
            // ========================================

            if (possuiCargoMembro) {
                await interaction.reply({
                    content:
                        "🚫 O cargo **Membro** não possui permissão para acessar o painel de configuração dos tickets.",

                    flags: MessageFlags.Ephemeral
                });

                console.log(
                    `🚫 Acesso ao /painel bloqueado para: ` +
                    `${interaction.user.tag}`
                );

                return;
            }


            // ========================================
            // CARREGAR AS CONFIGURAÇÕES
            // ========================================

            const configuracao =
                pegarConfiguracao(
                    interaction.guild.id
                );


            // ========================================
            // MOSTRAR O PAINEL ADMINISTRATIVO
            // ========================================

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

        } catch (error) {
            console.error(
                "❌ Erro ao abrir o painel administrativo:",
                error
            );

            try {
                const resposta = {
                    content:
                        "❌ Não foi possível abrir o painel de configuração.",

                    flags: MessageFlags.Ephemeral
                };

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {
                    await interaction.followUp(
                        resposta
                    );
                } else {
                    await interaction.reply(
                        resposta
                    );
                }
            } catch (responseError) {
                console.error(
                    "❌ Não foi possível enviar a mensagem de erro:",
                    responseError
                );
            }
        }
    }
};