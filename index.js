// ========================================
// CONFIGURAÇÕES INICIAIS
// ========================================

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    MessageFlags
} = require("discord.js");


// ========================================
// CANAL QUE DARÁ BAN AUTOMÁTICO
// ========================================

// Cole entre as aspas o ID do canal.
// Exemplo:
// const CANAL_DE_BANIMENTO = "123456789012345678";

const CANAL_DE_BANIMENTO = "1531658073478008832";


// ========================================
// SERVIDOR HTTP PARA O RENDER
// ========================================

const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });

    response.end("Bot está online!");
});

server.listen(PORT, () => {
    console.log(`🌐 Servidor HTTP iniciado na porta ${PORT}`);
});


// ========================================
// CRIAR O BOT
// ========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});


// ========================================
// CARREGAR COMANDOS
// ========================================

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        try {
            const command = require(filePath);

            if (
                !command ||
                !command.data ||
                typeof command.execute !== "function"
            ) {
                console.log(`⚠️ Comando ignorado: ${file}`);
                continue;
            }

            client.commands.set(command.data.name, command);

            console.log(`✅ Comando carregado: ${command.data.name}`);
        } catch (error) {
            console.error(
                `❌ Erro ao carregar o comando ${file}:`,
                error
            );
        }
    }
}


// ========================================
// CARREGAR BOTÕES
// ========================================

const abrirTicket = require("./buttons/abrirTicket.js");
const fecharTicket = require("./buttons/fecharTicket.js");
const atendenteTicket = require("./buttons/atendenteTicket.js");
const suporte = require("./buttons/suporte.js");
const denuncia = require("./buttons/denuncia.js");

const botoes = new Map();

botoes.set("abrir_ticket", abrirTicket);
botoes.set("fechar_ticket", fecharTicket);
botoes.set("atendente_ticket", atendenteTicket);
botoes.set("suporte_ticket", suporte);
botoes.set("denuncia_ticket", denuncia);


// ========================================
// BOT CONECTADO
// ========================================

client.once(Events.ClientReady, readyClient => {
    console.log(`✅ Bot conectado como ${readyClient.user.tag}`);

    console.log(
        `✅ Bot está em ${readyClient.guilds.cache.size} servidor(es)`
    );

    console.log(
        `🔨 Canal de banimento configurado: ${CANAL_DE_BANIMENTO}`
    );
});


// ========================================
// COMANDOS E BOTÕES
// ========================================

client.on(Events.InteractionCreate, async interaction => {
    try {
        // Comandos de barra
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(
                interaction.commandName
            );

            if (!command) {
                console.log(
                    `⚠️ Comando não encontrado: ${interaction.commandName}`
                );

                return;
            }

            console.log(
                `⌨️ Comando utilizado: /${interaction.commandName}`
            );

            await command.execute(interaction);
            return;
        }

        // Botões
        if (interaction.isButton()) {
            console.log(
                `🔘 Botão clicado: ${interaction.customId}`
            );

            const botao = botoes.get(interaction.customId);

            if (!botao) {
                console.log(
                    `⚠️ Botão não encontrado: ${interaction.customId}`
                );

                return;
            }

            if (typeof botao.execute !== "function") {
                console.log(
                    `❌ O botão ${interaction.customId} não possui execute()`
                );

                return;
            }

            await botao.execute(interaction);
            return;
        }
    } catch (error) {
        console.error("❌ Erro ao executar interação:", error);

        try {
            const resposta = {
                content: "❌ Ocorreu um erro ao executar esta ação.",
                flags: MessageFlags.Ephemeral
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(resposta);
            } else {
                await interaction.reply(resposta);
            }
        } catch (responseError) {
            console.error(
                "❌ Não foi possível enviar a mensagem de erro:",
                responseError
            );
        }
    }
});


// ========================================
// BAN AUTOMÁTICO POR MENSAGEM
// ========================================

client.on(Events.MessageCreate, async message => {
    try {
        // Ignora mensagens enviadas no privado.
        if (!message.guild) return;

        // Ignora mensagens enviadas por bots.
        if (message.author.bot) return;

        // Ignora mensagens enviadas em outros canais.
        if (message.channel.id !== CANAL_DE_BANIMENTO) return;

        const membro = message.member;

        if (!membro) {
            console.log(
                `⚠️ Não foi possível encontrar o membro ${message.author.tag}`
            );

            return;
        }

        // O dono do servidor não pode ser banido.
        if (message.guild.ownerId === membro.id) {
            console.log(
                `⚠️ O dono do servidor escreveu no canal: ${membro.user.tag}`
            );

            return;
        }

        // Verifica se o Discord permite que o bot bana esse membro.
        if (!membro.bannable) {
            console.log(
                `❌ Não consigo banir ${membro.user.tag}. ` +
                "O cargo da pessoa pode estar acima do cargo do bot."
            );

            return;
        }

        const motivo =
            `Enviou uma mensagem no canal proibido ` +
            `#${message.channel.name}.`;

        await membro.ban({
            reason: motivo,
            deleteMessageSeconds: 60 * 60
        });

        console.log(
            `🔨 Usuário banido: ${membro.user.tag}`
        );

        console.log(
            `📄 Motivo: ${motivo}`
        );
    } catch (error) {
        console.error(
            "❌ Erro ao tentar banir o usuário:",
            error
        );
    }
});


// ========================================
// TRATAMENTO DE ERROS
// ========================================

process.on("unhandledRejection", error => {
    console.error("❌ Erro não tratado:", error);
});

process.on("uncaughtException", error => {
    console.error("❌ Exceção não tratada:", error);
});


// ========================================
// CONECTAR AO DISCORD
// ========================================

if (!process.env.TOKEN) {
    console.error("❌ A variável TOKEN não foi configurada.");
    process.exit(1);
}

if (
    !CANAL_DE_BANIMENTO ||
    CANAL_DE_BANIMENTO === "COLE_O_ID_DO_CANAL_AQUI"
) {
    console.error(
        "❌ Você ainda não colocou o ID do canal de banimento."
    );

    process.exit(1);
}

client.login(process.env.TOKEN);