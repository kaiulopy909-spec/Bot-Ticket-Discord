const config = require("../config.json");

module.exports = {
    customId: "fechar_ticket",

    async execute(interaction) {
        try {
            const staffRoles = Array.isArray(config.staffRoles)
                ? config.staffRoles
                : [];

            const permitido = interaction.member.roles.cache.some(role =>
                staffRoles.includes(role.id)
            );

            if (!permitido) {
                return interaction.reply({
                    content: "❌ Você não tem permissão para fechar tickets.",
                    ephemeral: true
                });
            }

            const canal = interaction.channel;

            await interaction.reply({
                content: "📜 Salvando conversa e enviando para o usuário..."
            });

            // Aceita canais:
            // ticket-ID
            // suporte-ID
            // denuncia-ID
            const partesNome = canal.name.split("-");
            const userId = partesNome[partesNome.length - 1];

            if (!/^\d{17,20}$/.test(userId)) {
                await interaction.editReply({
                    content:
                        "❌ Não consegui identificar o dono deste ticket pelo nome do canal."
                });

                return;
            }

            let usuario;

            try {
                usuario = await interaction.client.users.fetch(userId);
            } catch (error) {
                console.error("Erro ao buscar usuário:", error);

                await interaction.editReply({
                    content: "❌ Não consegui localizar o dono deste ticket."
                });

                return;
            }

            // Busca todas as mensagens do canal
            const mensagens = [];
            let antes;

            while (true) {
                const busca = await canal.messages.fetch({
                    limit: 100,
                    before: antes
                });

                if (busca.size === 0) {
                    break;
                }

                mensagens.push(...busca.values());
                antes = busca.last().id;

                if (busca.size < 100) {
                    break;
                }
            }

            mensagens.reverse();

            let historico = "";

            for (const msg of mensagens) {
                const data = msg.createdAt.toLocaleString("pt-BR");

                let conteudo = msg.content || "[Mensagem sem texto]";

                if (msg.attachments.size > 0) {
                    const anexos = msg.attachments
                        .map(anexo => anexo.url)
                        .join(", ");

                    conteudo += ` | Anexos: ${anexos}`;
                }

                historico += `[${data}] ${msg.author.tag}: ${conteudo}\n`;
            }

            if (!historico.trim()) {
                historico = "Nenhuma mensagem encontrada no ticket.";
            }

            // Tenta enviar o histórico no privado
            try {
                await usuario.send({
                    content:
                        "📩 Seu ticket foi fechado. Segue o histórico completo:",
                    files: [
                        {
                            attachment: Buffer.from(historico, "utf-8"),
                            name: `historico-${canal.name}.txt`
                        }
                    ]
                });

                console.log("Histórico enviado para:", usuario.tag);
            } catch (error) {
                console.log("Não consegui enviar o histórico no privado:", error);
            }

            await interaction.editReply({
                content: "✅ Histórico salvo. Este canal será fechado em 5 segundos."
            });

            setTimeout(async () => {
                try {
                    await canal.delete("Ticket fechado pela equipe");
                } catch (error) {
                    console.error("Erro ao excluir o canal:", error);
                }
            }, 5000);
        } catch (error) {
            console.error("Erro ao fechar ticket:", error);

            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({
                        content: "❌ Ocorreu um erro ao fechar este ticket."
                    });
                } else {
                    await interaction.reply({
                        content: "❌ Ocorreu um erro ao fechar este ticket.",
                        ephemeral: true
                    });
                }
            } catch (replyError) {
                console.error("Erro ao responder interação:", replyError);
            }
        }
    }
};