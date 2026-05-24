const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { infoEmbed, successEmbed, errorEmbed } = require('../../utils/embeds');
const INVITE = 'discord.gg/szailand';

// ── HELP ─────────────────────────────────────────────────────────────────────
const help = {
  name: 'help',
  aliases: ['aide', 'commands'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Voir toutes les commandes du bot'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Commandes du Bot')
      .setDescription(`Préfixe: \`${client.PREFIX}\` | Slash: \`/\`\n🔗 **${INVITE}**`)
      .addFields(
        {
          name: '🛡️ Modération (mod requis)',
          value: [
            '`ban` – Bannir un membre',
            '`kick` – Expulser un membre',
            '`mute` – Mettre en timeout',
            '`unmute` – Retirer le timeout',
            '`unban` – Débannir par ID',
            '`warn` – Avertir un membre',
            '`clearwarns` – Effacer les warns',
            '`clear` – Supprimer des messages',
            '`slowmode` – Définir le slowmode',
            '`lock` / `unlock` – Verrouiller un salon',
            '`addrole` / `removerole` – Gérer les rôles',
            '`nick` – Changer le surnom',
          ].join('\n'),
        },
        {
          name: 'ℹ️ Informations',
          value: [
            '`userinfo` / `ui` – Infos sur un utilisateur',
            '`serverinfo` / `si` – Infos sur le serveur',
            '`botinfo` – Infos sur le bot',
            '`avatar` / `av` – Voir un avatar',
            '`ping` – Latence du bot',
            '`warns` – Voir les warns d\'un membre',
          ].join('\n'),
        },
        {
          name: '🔧 Utilitaires',
          value: [
            '`poll` – Créer un sondage',
            '`remind` – Se rappeler de quelque chose',
            '`calc` – Calculatrice',
            '`8ball` – Boule magique',
            '`say` – Faire parler le bot',
            '`embed` – Créer un embed',
          ].join('\n'),
        },
        {
          name: '🎉 Fun',
          value: [
            '`coinflip` – Pile ou face',
            '`roll` – Lancer un dé',
            '`rps` – Pierre-feuille-ciseaux',
            '`pp` – ...',
            '`roast` – Troll un membre',
          ].join('\n'),
        },
        {
          name: '👑 Owner seulement',
          value: [
            '`license add` – Ajouter une licence à un serveur',
            '`license remove` – Retirer une licence',
            '`license list` – Voir les serveurs licenciés',
            '`announce` – Annoncer sur tous les serveurs',
            '`shutdown` – Éteindre le bot',
            '`eval` – Exécuter du code JS',
          ].join('\n'),
        },
      )
      .setFooter({ text: `${INVITE} | Pour utiliser ce bot, rejoins le serveur!` })
      .setTimestamp();

    reply(ctx, isSlash, { embeds: [embed] });
  },
};

// ── POLL ─────────────────────────────────────────────────────────────────────
const poll = {
  name: 'poll',
  aliases: ['sondage'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Créer un sondage')
    .addStringOption(o => o.setName('question').setDescription('Question du sondage').setRequired(true))
    .addStringOption(o => o.setName('choix').setDescription('Choix séparés par | (optionnel, max 4)').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash  = !!ctx.isChatInputCommand;
    const authorId = isSlash ? ctx.user.id : ctx.author.id;
    let question, rawChoices;
    if (isSlash) {
      question   = ctx.options.getString('question');
      rawChoices = ctx.options.getString('choix');
    } else {
      const full = args.join(' ');
      const parts = full.split('|');
      question   = parts[0]?.trim();
      rawChoices = parts.slice(1).map(p => p.trim()).join('|') || null;
    }
    if (!question) return reply(ctx, isSlash, { embeds: [errorEmbed('Fournis une question.')] });

    const choices = rawChoices ? rawChoices.split('|').map(c => c.trim()).filter(Boolean).slice(0, 4) : null;
    const emojis  = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📊 Sondage')
      .setDescription(question + (choices ? '\n\n' + choices.map((c, i) => `${emojis[i]} ${c}`).join('\n') : ''))
      .setFooter({ text: `Sondage créé par ${isSlash ? ctx.user.tag : ctx.author.tag} · ${INVITE}` })
      .setTimestamp();

    let msg;
    if (isSlash) {
      await ctx.reply({ embeds: [embed] });
      msg = await ctx.fetchReply();
    } else {
      msg = await ctx.channel.send({ embeds: [embed] });
      ctx.delete().catch(() => {});
    }

    if (choices && choices.length > 0) {
      for (let i = 0; i < choices.length; i++) await msg.react(emojis[i]).catch(() => {});
    } else {
      await msg.react('👍').catch(() => {});
      await msg.react('👎').catch(() => {});
    }
  },
};

// ── REMIND ───────────────────────────────────────────────────────────────────
const remind = {
  name: 'remind',
  aliases: ['reminder', 'rappel'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Se rappeler de quelque chose')
    .addStringOption(o => o.setName('durée').setDescription('Ex: 10m, 2h, 1d').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Quoi te rappeler').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const userId  = isSlash ? ctx.user.id : ctx.author.id;
    let durStr, message;
    if (isSlash) {
      durStr  = ctx.options.getString('durée');
      message = ctx.options.getString('message');
    } else {
      durStr  = args[0];
      message = args.slice(1).join(' ');
    }
    const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = durStr?.match(/^(\d+)([smhd])$/i);
    if (!match) return reply(ctx, isSlash, { embeds: [errorEmbed('Durée invalide. Utilise: `10m`, `2h`, `1d`.')] });
    const ms = parseInt(match[1]) * units[match[2].toLowerCase()];
    if (ms > 7 * 86400000) return reply(ctx, isSlash, { embeds: [errorEmbed('Max 7 jours pour un rappel.')] });

    reply(ctx, isSlash, { embeds: [successEmbed('Rappel défini', `Je te rappellerai dans **${durStr}** !\n**Message :** ${message}`)] });

    setTimeout(async () => {
      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) return;
      user.send({ embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle('⏰ Rappel!').setDescription(message).setFooter({ text: INVITE }).setTimestamp()] }).catch(() => {});
    }, ms);
  },
};

// ── CALC ─────────────────────────────────────────────────────────────────────
const calc = {
  name: 'calc',
  aliases: ['calculate', 'math'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('Calculatrice')
    .addStringOption(o => o.setName('expression').setDescription('Expression mathématique').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const expr    = isSlash ? ctx.options.getString('expression') : args.join(' ');
    if (!expr) return reply(ctx, isSlash, { embeds: [errorEmbed('Fournis une expression.')] });
    // Sécuriser l'eval (seulement chiffres et opérateurs)
    if (!/^[\d\s\+\-\*\/\(\)\.\,\%\^]+$/.test(expr.replace(/[eE]/g, ''))) {
      return reply(ctx, isSlash, { embeds: [errorEmbed('Expression invalide. Utilise seulement des chiffres et opérateurs.')] });
    }
    try {
      const result = Function(`'use strict'; return (${expr.replace(/\^/g, '**')})`)();
      reply(ctx, isSlash, { embeds: [successEmbed('Calculatrice', `\`${expr}\` = **${result}**`)] });
    } catch {
      reply(ctx, isSlash, { embeds: [errorEmbed('Expression invalide.')] });
    }
  },
};

// ── SAY ──────────────────────────────────────────────────────────────────────
const say = {
  name: 'say',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Faire parler le bot')
    .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true))
    .addChannelOption(o => o.setName('salon').setDescription('Salon (optionnel)').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    let message, channel;
    if (isSlash) {
      message = ctx.options.getString('message');
      channel = ctx.options.getChannel('salon') || ctx.channel;
    } else {
      channel = ctx.mentions.channels.first() || ctx.channel;
      message = args.filter(a => !a.startsWith('<#')).join(' ');
    }
    if (!message) return reply(ctx, isSlash, { embeds: [errorEmbed('Fournis un message.')] });
    await channel.send(message);
    if (isSlash) ctx.reply({ content: '✅ Message envoyé!', ephemeral: true });
    else ctx.delete().catch(() => {});
  },
};

// ── EMBED (créer un embed custom) ────────────────────────────────────────────
const embedCmd = {
  name: 'embed',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Envoyer un embed personnalisé')
    .addStringOption(o => o.setName('titre').setDescription('Titre').setRequired(true))
    .addStringOption(o => o.setName('description').setDescription('Description').setRequired(true))
    .addStringOption(o => o.setName('couleur').setDescription('Couleur hex (ex: #FF0000)').setRequired(false))
    .addChannelOption(o => o.setName('salon').setDescription('Salon cible').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    if (!isSlash) {
      return ctx.reply({ embeds: [errorEmbed('Utilise la commande slash `/embed` pour créer un embed.')] });
    }
    const title   = ctx.options.getString('titre');
    const desc    = ctx.options.getString('description');
    const color   = ctx.options.getString('couleur') || '#5865F2';
    const channel = ctx.options.getChannel('salon') || ctx.channel;
    const embed   = new EmbedBuilder()
      .setTitle(title)
      .setDescription(desc)
      .setColor(color)
      .setFooter({ text: INVITE })
      .setTimestamp();
    await channel.send({ embeds: [embed] });
    ctx.reply({ content: '✅ Embed envoyé!', ephemeral: true });
  },
};

function reply(ctx, isSlash, payload) {
  return isSlash ? ctx.reply(payload) : ctx.reply(payload);
}

module.exports = { help, poll, remind, calc, say, embed: embedCmd };
