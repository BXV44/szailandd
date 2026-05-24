const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'ban',
  aliases: ['bannir'],
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre du serveur')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre à bannir').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison du ban').setRequired(false))
    .addIntegerOption(o => o.setName('jours').setDescription('Jours de messages à supprimer (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)),

  async execute(ctx, args, client) {
    const isSlash  = !!ctx.isChatInputCommand;
    const guild    = ctx.guild;
    const modId    = isSlash ? ctx.user.id : ctx.author.id;

    let target, reason, days;
    if (isSlash) {
      target = ctx.options.getMember('utilisateur');
      reason = ctx.options.getString('raison') || 'Aucune raison fournie';
      days   = ctx.options.getInteger('jours') ?? 0;
    } else {
      const mention = ctx.mentions.members.first() || guild.members.cache.get(args[0]);
      target = mention;
      reason = args.slice(1).join(' ') || 'Aucune raison fournie';
      days   = 0;
    }

    if (!target) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur introuvable.')] });
    if (!target.bannable) return reply(ctx, isSlash, { embeds: [errorEmbed('Je ne peux pas bannir cet utilisateur (rôle supérieur ou protection).')] });
    if (target.id === modId) return reply(ctx, isSlash, { embeds: [errorEmbed('Tu ne peux pas te bannir toi-même.')] });

    try {
      // DM avant le ban
      await target.user.send({
        embeds: [new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle(`🔨 Tu as été banni de ${guild.name}`)
          .setDescription(`**Raison :** ${reason}\n**Modérateur :** <@${modId}>\n\n🔗 discord.gg/szailand`)
          .setTimestamp()]
      }).catch(() => {});

      await target.ban({ deleteMessageDays: days, reason: `${reason} | Par: ${modId}` });

      const embed = successEmbed('Membre banni', `**Utilisateur :** ${target.user.tag}\n**Raison :** ${reason}\n**Modérateur :** <@${modId}>`);
      reply(ctx, isSlash, { embeds: [embed] });

      // Log
      const log = guild.channels.cache.find(c => c.name === 'mod-logs' || c.name === 'logs');
      if (log) log.send({ embeds: [embed] }).catch(() => {});
    } catch (e) {
      reply(ctx, isSlash, { embeds: [errorEmbed(`Erreur: ${e.message}`)] });
    }
  },
};

function reply(ctx, isSlash, payload) {
  if (isSlash) return ctx.reply({ ...payload, ephemeral: false });
  return ctx.reply(payload);
}
