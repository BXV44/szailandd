const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addWarn, getWarns, clearWarns, removeWarn } = require('../../utils/database');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embeds');

// ── WARN ──────────────────────────────────────────────────────────────────────
const warn = {
  name: 'warn',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un membre')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    const modId   = isSlash ? ctx.user.id : ctx.author.id;
    let target, reason;
    if (isSlash) {
      target = ctx.options.getMember('utilisateur');
      reason = ctx.options.getString('raison');
    } else {
      target = ctx.mentions.members.first() || guild.members.cache.get(args[0]);
      reason = args.slice(1).join(' ') || 'Aucune raison';
    }
    if (!target) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur introuvable.')] });
    const warnData = addWarn(guild.id, target.id, reason, modId);
    const warns    = getWarns(guild.id, target.id);

    await target.user.send({
      embeds: [new EmbedBuilder()
        .setColor(0xFFAA00)
        .setTitle(`⚠️ Avertissement sur ${guild.name}`)
        .setDescription(`**Raison :** ${reason}\n**Total avertissements :** ${warns.length}`)
        .setTimestamp()]
    }).catch(() => {});

    const embed = successEmbed('Avertissement ajouté',
      `**Utilisateur :** ${target.user.tag}\n**Raison :** ${reason}\n**Total warns :** ${warns.length}\n**Modérateur :** <@${modId}>`);
    reply(ctx, isSlash, { embeds: [embed] });

    // Auto-action selon le nombre de warns
    if (warns.length === 3) {
      await target.timeout(3_600_000, 'Warn #3 – auto-timeout 1h');
      const log = guild.channels.cache.find(c => c.name === 'mod-logs' || c.name === 'logs');
      if (log) log.send({ embeds: [new EmbedBuilder().setColor(0xFFAA00).setTitle('🤖 Auto-Modération').setDescription(`${target.user.tag} a reçu 3 warns → timeout 1h automatique.`).setTimestamp()] }).catch(() => {});
    } else if (warns.length >= 5) {
      if (target.bannable) {
        await target.ban({ reason: 'Warn #5 – ban automatique' });
        const log = guild.channels.cache.find(c => c.name === 'mod-logs' || c.name === 'logs');
        if (log) log.send({ embeds: [new EmbedBuilder().setColor(0xFF0000).setTitle('🤖 Auto-Modération').setDescription(`${target.user.tag} a reçu 5 warns → ban automatique.`).setTimestamp()] }).catch(() => {});
      }
    }
  },
};

// ── WARNS (voir les avertissements) ──────────────────────────────────────────
const warns = {
  name: 'warns',
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Voir les avertissements d\'un membre')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    let target;
    if (isSlash) target = ctx.options.getMember('utilisateur') || ctx.options.getUser('utilisateur');
    else target = ctx.mentions.members.first() || guild.members.cache.get(args[0]);
    if (!target) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur introuvable.')] });
    const userId   = target.id || target.user?.id;
    const userTag  = target.user?.tag || target.tag;
    const warnList = getWarns(guild.id, userId);
    if (warnList.length === 0) return reply(ctx, isSlash, { embeds: [infoEmbed('Aucun avertissement', `**${userTag}** n'a aucun avertissement.`)] });
    const desc = warnList.map((w, i) =>
      `**#${i + 1}** \`ID:${w.id}\` – ${w.reason}\n> Par <@${w.moderatorId}> · <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>`
    ).join('\n\n');
    reply(ctx, isSlash, { embeds: [infoEmbed(`Avertissements de ${userTag} (${warnList.length})`, desc)] });
  },
};

// ── CLEARWARNS ────────────────────────────────────────────────────────────────
const clearwarns = {
  name: 'clearwarns',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Effacer tous les avertissements d\'un membre')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    let target;
    if (isSlash) target = ctx.options.getMember('utilisateur') || ctx.options.getUser('utilisateur');
    else target = ctx.mentions.members.first() || guild.members.cache.get(args[0]);
    if (!target) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur introuvable.')] });
    const userId = target.id || target.user?.id;
    const userTag = target.user?.tag || target.tag;
    clearWarns(guild.id, userId);
    reply(ctx, isSlash, { embeds: [successEmbed('Warns effacés', `Tous les warns de **${userTag}** ont été supprimés.`)] });
  },
};

function reply(ctx, isSlash, payload) {
  return isSlash ? ctx.reply(payload) : ctx.reply(payload);
}

module.exports = { warn, warns, clearwarns };
