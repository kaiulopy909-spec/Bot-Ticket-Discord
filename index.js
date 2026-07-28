// ========================================
// CONFIGURAÇÕES INICIAIS
// ========================================

// Carrega as variáveis do arquivo .env no computador.
// No Render, utiliza as variáveis configuradas em Environment.
require("dotenv").config();

// Ferramentas do Node.js para trabalhar com arquivos e pastas.
const fs = require("fs");
const path = require("path");

// Cria um pequeno servidor para o Render manter o bot online.
const http = require("http");

// Importações do Discord.js.
const {
    Client,
    Collection,
    Events,
    GatewayIntentBits
} = require("discord.js");


// ========================================
// SERVIDOR HTTP PARA O RENDER
// ========================================

const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });

    response.end("Bot de tickets está online!");
});

server.listen(PORT, () => {
    console.log(`🌐 Servidor HTTP iniciado na porta ${PORT}`);
});


// ========================================
// CRIAR O CLIENTE DO DISCORD
// ========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});


// ========================================
// COLEÇÃO DE COMANDOS
// ========================================

// Aqui serão guardados os comandos encontrados
// dentro da pasta commands.
client.commands = new Collection();


// ========================================
// CARREGAR COMANDOS DA PASTA COMMANDS
// ========================================

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        try {
            const command = require(filePath);

            // Verifica se o comando possui as partes necessárias.
            if (
                !command ||
                !command.data ||
                typeof command.execute !== "function"
            ) {
                console.log(`⚠️ Comando ignorado: ${file}`);
                continue;
            }

            // Guarda o comando usando o nome dele.
            client.commands.set(command.data.name, command);

            console.log(`✅ Comando carregado: ${command.data.name}`);

        } catch (error) {
            console.error(`❌ Erro ao carregar o comando ${file}:`, error);
        }
    }
}


// ========================================
// CARREGAR OS BOTÕES
// ========================================

// Cada arquivo possui o código que será executado
// quando o respectivo botão for clicado.

const abrirTicket = require("./buttons/abrirTicket.js");
const fecharTicket = require("./buttons/fecharTicket.js");
const atendenteTicket = require("./buttons/atendenteTicket.js");
const suporte = require("./buttons/suporte.js");
const denuncia = require("./buttons/denuncia.js");


// Relaciona o customId do botão com o arquivo responsável.
const botoes = new Map();

botoes.set("abrir_ticket", abrirTicket);
botoes.set("fechar_ticket", fecharTicket);
botoes.set("atendente_ticket", atendenteTicket);
botoes.set("suporte_ticket", suporte);
botoes.set("denuncia_ticket", denuncia);


// ========================================
// BOT PRONTO
// ========================================

// Este evento é executado uma única vez,
// quando o bot consegue entrar no Discord.
client.once(Events.ClientReady, readyClient => {
    console.log(`✅ Bot conectado como ${readyClient.user.tag}`);
    console.log(`✅ Bot está em ${readyClient.guilds.cache.size} servidor(es)`);
});


// ========================================
// RECEBER COMANDOS E BOTÕES
// ========================================

// Este é o único lugar que recebe interações.
// Não deve existir outro interactionCreate na pasta events.
client.on(Events.InteractionCreate, async interaction => {

    try {

        // ========================================
        // COMANDOS DE BARRA
        // ========================================

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


        // ========================================
        // BOTÕES
        // ========================================

        if (interaction.isButton()) {
            console.log(`🔘 Botão clicado: ${interaction.customId}`);

            // Procura o arquivo correspondente ao botão.
            const botao = botoes.get(interaction.customId);

            if (!botao) {
                console.log(
                    `⚠️ Botão não encontrado: ${interaction.customId}`
                );

                return;
            }

            // Verifica se o arquivo possui a função execute.
            if (typeof botao.execute !== "function") {
                console.log(
                    `❌ O botão ${interaction.customId} não possui execute()`
                );

                return;
            }

            // Executa o arquivo do botão apenas uma vez.
            await botao.execute(interaction);

            return;
        }

    } catch (error) {
        console.error("❌ Erro ao executar interação:", error);

        // Evita tentar responder duas vezes à mesma interação.
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "❌ Ocorreu um erro ao executar esta ação.",
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: "❌ Ocorreu um erro ao executar esta ação.",
                    ephemeral: true
                });
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
// TRATAMENTO DE ERROS GERAIS
// ========================================

process.on("unhandledRejection", error => {
    console.error("❌ Erro não tratado:", error);
});

process.on("uncaughtException", error => {
    console.error("❌ Exceção não tratada:", error);
});


// ========================================
// CONECTAR O BOT AO DISCORD
// ========================================

if (!process.env.TOKEN) {
    console.error("❌ A variável TOKEN não foi configurada.");
    process.exit(1);
}

client.login(process.env.TOKEN);