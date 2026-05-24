const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { infoEmbed } = require('../../utils/embeds');
const INVITE = 'discord.gg/szailand';

// ── USERINFO ──────────────────────────────────────────────────────────────────
const userinfo = {
  name: 'userinfo',
  aliases: ['ui', 'profil'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Informations sur un utilisateur')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre (optionnel)').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash  = !!ctx.isChatInputCommand;
    const guild    = ctx.guild;
    let member;
    if (isSlash) {
      member = ctx.options.getMember('utilisateur') || ctx.member;
    } else {
      member = ctx.mentions.members.first() || ctx.member;
    }
    const user     = member.user;
    const roles    = member.roles.cache.filter(r => r.id !== guild.id).sort((a, b) => b.position - a.position);
    const topRole  = roles.first()?.toString() || 'Aucun';
    const badges   = user.flags?.toArray().map(f => `\`${f}\``).join(', ') || 'Aucun';

    const embed = new EmbedBuilder()
      .setColor(member.displayHexColor || 0x5865F2)
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '🤖 Bot', value: user.bot ? 'Oui' : 'Non', inline: true },
        { name: '📅 Compte créé', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '📥 A rejoint le serveur', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
        { name: `🎭 Rôles (${roles.size})`, value: roles.size > 0 ? roles.map(r => r.toString()).slice(0, 10).join(', ') : 'Aucun', inline: false },
        { name: '⭐ Rôle principal', value: topRole, inline: true },
        { name: '🏅 Badges', value: badges, inline: false },
      )
      .setFooter({ text: INVITE })
      .setTimestamp();

    reply(ctx, isSlash, { embeds: [embed] });
  },
};

// ── SERVERINFO ────────────────────────────────────────────────────────────────
const serverinfo = {
  name: 'serverinfo',
  aliases: ['si', 'server'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Informations sur le serveur'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    await guild.fetch();
    const owner   = await guild.fetchOwner();
    const online  = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const bots    = guild.members.cache.filter(m => m.user.bot).size;
    const humans  = guild.memberCount - bots;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Propriétaire', value: `${owner.user.tag}`, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '👥 Membres', value: `Total: **${guild.memberCount}** | Humains: **${humans}** | Bots: **${bots}**`, inline: false },
        { name: '🟢 En ligne', value: `${online}`, inline: true },
        { name: '💬 Salons', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount} (Niveau ${guild.premiumTier})`, inline: true },
        { name: '🛡️ Vérification', value: guild.verificationLevel.toString(), inline: true },
      )
      .setFooter({ text: INVITE })
      .setTimestamp();

    reply(ctx, isSlash, { embeds: [embed] });
  },
};

// ── BOTINFO ───────────────────────────────────────────────────────────────────
const botinfo = {
  name: 'botinfo',
  aliases: ['bot'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Informations sur le bot'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const uptime  = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const mem = process.memoryUsage().heapUsed / 1024 / 1024;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🤖 Informations du Bot')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '📛 Nom', value: client.user.tag, inline: true },
        { name: '🆔 ID', value: client.user.id, inline: true },
        { name: '📡 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Utilisateurs', value: `${client.users.cache.size}`, inline: true },
        { name: '⏱️ Uptime', value: `${h}h ${m}m ${s}s`, inline: true },
        { name: '💾 RAM', value: `${mem.toFixed(2)} MB`, inline: true },
        { name: '⚡ Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: '📦 Discord.js', value: require('discord.js').version, inline: true },
        { name: '🟩 Node.js', value: process.version, inline: true },
        { name: '🔗 Invite', value: INVITE, inline: false },
      )
      .setFooter({ text: INVITE })
      .setTimestamp();

    reply(ctx, isSlash, { embeds: [embed] });
  },
};

// ── AVATAR ────────────────────────────────────────────────────────────────────
const avatar = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Voir l\'avatar d\'un utilisateur')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre (optionnel)').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    let user;
    if (isSlash) user = ctx.options.getUser('utilisateur') || ctx.user;
    else user = ctx.mentions.users.first() || ctx.author;
    const url = user.displayAvatarURL({ dynamic: true, size: 1024 });
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🖼️ Avatar de ${user.tag}`)
      .setImage(url)
      .addFields({ name: 'Liens', value: `[PNG](${user.displayAvatarURL({ format: 'png', size: 1024 })}) | [WebP](${user.displayAvatarURL({ format: 'webp', size: 1024 })}) | [JPG](${user.displayAvatarURL({ format: 'jpg', size: 1024 })})` })
      .setFooter({ text: INVITE });
    reply(ctx, isSlash, { embeds: [embed] });
  },
};

// ── PING ─────────────────────────────────────────────────────────────────────
const ping = {
  name: 'ping',
  requireMod: false,
  data: new SlashCommandBuilder().setName('ping').setDescription('Voir la latence du bot'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const embed   = new EmbedBuilder()
      .setColor(0x00FF88)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: '⚡ Latence Bot', value: `${client.ws.ping}ms`, inline: true },
        { name: '🔗', value: INVITE, inline: true },
      )
      .setTimestamp();
    reply(ctx, isSlash, { embeds: [embed] });
  },
};

function reply(ctx, isSlash, payload) {
  return isSlash ? ctx.reply(payload) : ctx.reply(payload);
}

module.exports = { userinfo, serverinfo, botinfo, avatar, ping };
