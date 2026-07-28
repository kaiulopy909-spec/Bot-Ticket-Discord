const fs = require("fs");
const path = require("path");

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


// ========================================
// LOCAL DO ARQUIVO DE CONFIGURAÇÃO
// ========================================

const dataPath = path.join(
    __dirname,
    "..",
    "data",
    "painel.json"
);


// ========================================
// CONFIGURAÇÃO PADRÃO
// ========================================

const configuracaoPadrao = {
    titulo: "🎫 Central de Tickets",

    descricao:
        "Precisa de ajuda?\n\n" +
        "Clique no botão abaixo para criar um ticket.",

    imagem: "",

    cor: "#5865F2",

    botaoPrincipalTexto: "Criar Ticket",
    botaoPrincipalEmoji: "🎫",

    botaoSuporteTexto: "Suporte",
    botaoSuporteEmoji: "🛠️",

    botaoDenunciaTexto: "Denúncia",
    botaoDenunciaEmoji: "🚨"
};


// ========================================
// GARANTIR QUE O ARQUIVO EXISTE
// ========================================

function garantirArquivo() {
    const pastaData = path.dirname(dataPath);

    if (!fs.existsSync(pastaData)) {
        fs.mkdirSync(pastaData, {
            recursive: true
        });
    }

    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(
            dataPath,
            JSON.stringify(
                {
                    servidores: {}
                },
                null,
                4
            ),
            "utf8"
        );
    }
}


// ========================================
// LER TODO O ARQUIVO
// ========================================

function lerArquivo() {
    garantirArquivo();

    try {
        const conteudo = fs.readFileSync(
            dataPath,
            "utf8"
        );

        const dados = JSON.parse(conteudo);

        if (!dados.servidores) {
            dados.servidores = {};
        }

        return dados;
    } catch (error) {
        console.error(
            "❌ Erro ao ler data/painel.json:",
            error
        );

        return {
            servidores: {}
        };
    }
}


// ========================================
// SALVAR TODO O ARQUIVO
// ========================================

function salvarArquivo(dados) {
    garantirArquivo();

    fs.writeFileSync(
        dataPath,
        JSON.stringify(dados, null, 4),
        "utf8"
    );
}


// ========================================
// PEGAR CONFIGURAÇÃO DO SERVIDOR
// ========================================

function pegarConfiguracao(guildId) {
    const dados = lerArquivo();

    const configuracaoSalva =
        dados.servidores[guildId] || {};

    return {
        ...configuracaoPadrao,
        ...configuracaoSalva
    };
}


// ========================================
// ATUALIZAR CONFIGURAÇÃO DO SERVIDOR
// ========================================

function salvarConfiguracao(guildId, alteracoes) {
    const dados = lerArquivo();

    const configuracaoAtual =
        pegarConfiguracao(guildId);

    dados.servidores[guildId] = {
        ...configuracaoAtual,
        ...alteracoes
    };

    salvarArquivo(dados);

    return dados.servidores[guildId];
}


// ========================================
// COLOCAR EMOJI COM SEGURANÇA
// ========================================

function colocarEmoji(botao, emoji) {
    if (!emoji || !emoji.trim()) {
        return botao;
    }

    try {
        botao.setEmoji(emoji.trim());
    } catch (error) {
        console.log(
            `⚠️ Emoji inválido ignorado: ${emoji}`
        );
    }

    return botao;
}


// ========================================
// CRIAR EMBED DO PAINEL DE TICKETS
// ========================================

function criarEmbedTicket(configuracao) {
    const embed = new EmbedBuilder()
        .setColor(configuracao.cor)
        .setTitle(configuracao.titulo)
        .setDescription(configuracao.descricao)
        .setFooter({
            text: "Sistema de Tickets"
        })
        .setTimestamp();

    if (
        configuracao.imagem &&
        configuracao.imagem.startsWith("https://")
    ) {
        embed.setImage(configuracao.imagem);
    }

    return embed;
}


// ========================================
// CRIAR BOTÃO PRINCIPAL
// ========================================

function criarBotaoPrincipal(configuracao) {
    const botao = new ButtonBuilder()
        .setCustomId("abrir_ticket")
        .setLabel(
            configuracao.botaoPrincipalTexto
        )
        .setStyle(ButtonStyle.Success);

    colocarEmoji(
        botao,
        configuracao.botaoPrincipalEmoji
    );

    return new ActionRowBuilder().addComponents(
        botao
    );
}


// ========================================
// CRIAR BOTÕES SUPORTE E DENÚNCIA
// ========================================

function criarBotoesTipos(configuracao) {
    const suporte = new ButtonBuilder()
        .setCustomId("suporte_ticket")
        .setLabel(
            configuracao.botaoSuporteTexto
        )
        .setStyle(ButtonStyle.Primary);

    colocarEmoji(
        suporte,
        configuracao.botaoSuporteEmoji
    );

    const denuncia = new ButtonBuilder()
        .setCustomId("denuncia_ticket")
        .setLabel(
            configuracao.botaoDenunciaTexto
        )
        .setStyle(ButtonStyle.Danger);

    colocarEmoji(
        denuncia,
        configuracao.botaoDenunciaEmoji
    );

    return new ActionRowBuilder().addComponents(
        suporte,
        denuncia
    );
}


// ========================================
// CRIAR PAINEL ADMINISTRATIVO
// ========================================

function criarEmbedAdministrativo(configuracao) {
    const imagemAtual = configuracao.imagem
        ? "Configurada"
        : "Nenhuma imagem";

    return new EmbedBuilder()
        .setColor("#2B2D31")
        .setTitle("⚙️ Configuração do painel")
        .setDescription(
            "Use os botões abaixo para configurar " +
            "o painel de tickets.\n\n" +

            `**Título atual:**\n` +
            `${configuracao.titulo}\n\n` +

            `**Descrição atual:**\n` +
            `${configuracao.descricao}\n\n` +

            `**Cor atual:** ${configuracao.cor}\n` +
            `**Imagem:** ${imagemAtual}\n\n` +

            `**Botão principal:** ` +
            `${configuracao.botaoPrincipalEmoji} ` +
            `${configuracao.botaoPrincipalTexto}\n` +

            `**Botão de suporte:** ` +
            `${configuracao.botaoSuporteEmoji} ` +
            `${configuracao.botaoSuporteTexto}\n` +

            `**Botão de denúncia:** ` +
            `${configuracao.botaoDenunciaEmoji} ` +
            `${configuracao.botaoDenunciaTexto}`
        )
        .setFooter({
            text:
                "Somente você consegue ver este painel administrativo."
        });
}


// ========================================
// BOTÕES DO PAINEL ADMINISTRATIVO
// ========================================

function criarBotoesAdministrativos() {
    const primeiraLinha =
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("config_titulo")
                .setLabel("Título")
                .setEmoji("📝")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("config_descricao")
                .setLabel("Descrição")
                .setEmoji("📄")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("config_imagem")
                .setLabel("Imagem")
                .setEmoji("🖼️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("config_cor")
                .setLabel("Cor")
                .setEmoji("🎨")
                .setStyle(ButtonStyle.Secondary)
        );

    const segundaLinha =
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("config_textos_botoes")
                .setLabel("Nomes")
                .setEmoji("🔤")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("config_emojis_botoes")
                .setLabel("Emojis")
                .setEmoji("😀")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("config_visualizar")
                .setLabel("Visualizar")
                .setEmoji("👁️")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("config_enviar")
                .setLabel("Publicar")
                .setEmoji("📤")
                .setStyle(ButtonStyle.Danger)
        );

    return [
        primeiraLinha,
        segundaLinha
    ];
}


module.exports = {
    pegarConfiguracao,
    salvarConfiguracao,
    criarEmbedTicket,
    criarBotaoPrincipal,
    criarBotoesTipos,
    criarEmbedAdministrativo,
    criarBotoesAdministrativos
};