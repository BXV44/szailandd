const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embeds');

// ── UNMUTE ────────────────────────────────────────────────────────────────────
const unmute = {
  name: 'unmute',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Retirer le timeout d\'un membre')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const target  = isSlash ? ctx.options.getMember('utilisateur') : (ctx.mentions.members.first() || ctx.guild.members.cache.get(args[0]));
    if (!target) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur introuvable.')] });
    await target.timeout(null);
    reply(ctx, isSlash, { embeds: [successEmbed('Unmute', `**${target.user.tag}** n'est plus mute.`)] });
  },
};

// ── UNBAN ─────────────────────────────────────────────────────────────────────
const unban = {
  name: 'unban',
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Débannir un utilisateur par son ID')
    .addStringOption(o => o.setName('id').setDescription('ID de l\'utilisateur').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    const userId  = isSlash ? ctx.options.getString('id') : args[0];
    const reason  = isSlash ? (ctx.options.getString('raison') || 'Aucune raison') : (args.slice(1).join(' ') || 'Aucune raison');
    if (!userId) return reply(ctx, isSlash, { embeds: [errorEmbed('Fournis un ID utilisateur.')] });
    try {
      await guild.members.unban(userId, reason);
      reply(ctx, isSlash, { embeds: [successEmbed('Unban', `Utilisateur \`${userId}\` débanni.\n**Raison :** ${reason}`)] });
    } catch {
      reply(ctx, isSlash, { embeds: [errorEmbed('Cet utilisateur n\'est pas banni ou l\'ID est invalide.')] });
    }
  },
};

// ── CLEAR (purge) ─────────────────────────────────────────────────────────────
const clear = {
  name: 'clear',
  aliases: ['purge', 'clean'],
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprimer des messages')
    .addIntegerOption(o => o.setName('nombre').setDescription('Nombre de messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption(o => o.setName('utilisateur').setDescription('Supprimer uniquement les messages de cet utilisateur').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const channel = ctx.channel;
    let amount, filterUser;
    if (isSlash) {
      amount     = ctx.options.getInteger('nombre');
      filterUser = ctx.options.getUser('utilisateur');
    } else {
      amount     = parseInt(args[0]);
      filterUser = ctx.mentions.users.first() || null;
      if (isNaN(amount) || amount < 1 || amount > 100) return ctx.reply({ embeds: [errorEmbed('Fournis un nombre entre 1 et 100.')] });
    }
    if (isSlash) await ctx.deferReply({ ephemeral: true });
    let messages = await channel.messages.fetch({ limit: 100 });
    if (filterUser) messages = messages.filter(m => m.author.id === filterUser.id);
    messages = [...messages.values()].slice(0, amount);
    const deleted = await channel.bulkDelete(messages, true).catch(() => null);
    const count   = deleted?.size ?? messages.length;
    const text    = `**${count}** message(s) supprimé(s)${filterUser ? ` de ${filterUser.tag}` : ''}.`;
    if (isSlash) ctx.editReply({ embeds: [successEmbed('Messages supprimés', text)] });
    else {
      const msg = await ctx.reply({ embeds: [successEmbed('Messages supprimés', text)] });
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    }
  },
};

function reply(ctx, isSlash, payload) {
  return isSlash ? ctx.reply(payload) : ctx.reply(payload);
}

module.exports = { unmute, unban, clear };
