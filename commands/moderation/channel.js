const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

// ── SLOWMODE ──────────────────────────────────────────────────────────────────
const slowmode = {
  name: 'slowmode',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Définir le slowmode d\'un salon')
    .addIntegerOption(o => o.setName('secondes').setDescription('0 pour désactiver, max 21600').setRequired(true).setMinValue(0).setMaxValue(21600)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const seconds = isSlash ? ctx.options.getInteger('secondes') : parseInt(args[0]);
    if (isNaN(seconds)) return reply(ctx, isSlash, { embeds: [errorEmbed('Fournis un nombre de secondes valide.')] });
    await ctx.channel.setRateLimitPerUser(seconds);
    const msg = seconds === 0 ? 'Slowmode désactivé.' : `Slowmode défini à **${seconds}s**.`;
    reply(ctx, isSlash, { embeds: [successEmbed('Slowmode', msg)] });
  },
};

// ── LOCK ──────────────────────────────────────────────────────────────────────
const lock = {
  name: 'lock',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Verrouiller un salon (empêcher d\'écrire)'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const channel = ctx.channel;
    await channel.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: false });
    reply(ctx, isSlash, { embeds: [successEmbed('Salon verrouillé', `🔒 ${channel} est maintenant verrouillé.`)] });
  },
};

// ── UNLOCK ────────────────────────────────────────────────────────────────────
const unlock = {
  name: 'unlock',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Déverrouiller un salon'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const channel = ctx.channel;
    await channel.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: null });
    reply(ctx, isSlash, { embeds: [successEmbed('Salon déverrouillé', `🔓 ${channel} est maintenant ouvert.`)] });
  },
};

// ── ADDROLE ───────────────────────────────────────────────────────────────────
const addrole = {
  name: 'addrole',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Ajouter un rôle à un membre')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre').setRequired(true))
    .addRoleOption(o => o.setName('rôle').setDescription('Rôle à ajouter').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    let target, role;
    if (isSlash) {
      target = ctx.options.getMember('utilisateur');
      role   = ctx.options.getRole('rôle');
    } else {
      target = ctx.mentions.members.first() || guild.members.cache.get(args[0]);
      role   = ctx.mentions.roles.first() || guild.roles.cache.get(args[1]);
    }
    if (!target || !role) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur ou rôle introuvable.')] });
    await target.roles.add(role);
    reply(ctx, isSlash, { embeds: [successEmbed('Rôle ajouté', `Rôle ${role} ajouté à **${target.user.tag}**.`)] });
  },
};

// ── REMOVEROLE ────────────────────────────────────────────────────────────────
const removerole = {
  name: 'removerole',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Retirer un rôle à un membre')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre').setRequired(true))
    .addRoleOption(o => o.setName('rôle').setDescription('Rôle à retirer').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    let target, role;
    if (isSlash) {
      target = ctx.options.getMember('utilisateur');
      role   = ctx.options.getRole('rôle');
    } else {
      target = ctx.mentions.members.first() || guild.members.cache.get(args[0]);
      role   = ctx.mentions.roles.first() || guild.roles.cache.get(args[1]);
    }
    if (!target || !role) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur ou rôle introuvable.')] });
    await target.roles.remove(role);
    reply(ctx, isSlash, { embeds: [successEmbed('Rôle retiré', `Rôle ${role} retiré de **${target.user.tag}**.`)] });
  },
};

// ── NICKNAME ──────────────────────────────────────────────────────────────────
const nickname = {
  name: 'nick',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Changer le surnom d\'un membre')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre').setRequired(true))
    .addStringOption(o => o.setName('surnom').setDescription('Nouveau surnom (vide = reset)').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    let target, nick;
    if (isSlash) {
      target = ctx.options.getMember('utilisateur');
      nick   = ctx.options.getString('surnom') || null;
    } else {
      target = ctx.mentions.members.first() || guild.members.cache.get(args[0]);
      nick   = args.slice(1).join(' ') || null;
    }
    if (!target) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur introuvable.')] });
    await target.setNickname(nick);
    reply(ctx, isSlash, { embeds: [successEmbed('Surnom modifié', `Surnom de **${target.user.tag}** → \`${nick || 'réinitialisé'}\`.`)] });
  },
};

function reply(ctx, isSlash, payload) {
  return isSlash ? ctx.reply(payload) : ctx.reply(payload);
}

module.exports = { slowmode, lock, unlock, addrole, removerole, nickname };
