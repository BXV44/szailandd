const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'kick',
  aliases: ['expulser'],
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulser un membre du serveur')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre à kick').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(false)),

  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    const modId   = isSlash ? ctx.user.id : ctx.author.id;

    let target, reason;
    if (isSlash) {
      target = ctx.options.getMember('utilisateur');
      reason = ctx.options.getString('raison') || 'Aucune raison fournie';
    } else {
      target = ctx.mentions.members.first() || guild.members.cache.get(args[0]);
      reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    }

    if (!target) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur introuvable.')] });
    if (!target.kickable) return reply(ctx, isSlash, { embeds: [errorEmbed('Je ne peux pas kick cet utilisateur.')] });
    if (target.id === modId) return reply(ctx, isSlash, { embeds: [errorEmbed('Tu ne peux pas te kick toi-même.')] });

    await target.user.send({
      embeds: [new EmbedBuilder()
        .setColor(0xFF8800)
        .setTitle(`👢 Tu as été expulsé de ${guild.name}`)
        .setDescription(`**Raison :** ${reason}\n**Modérateur :** <@${modId}>\n\n🔗 discord.gg/szailand`)
        .setTimestamp()]
    }).catch(() => {});

    await target.kick(`${reason} | Par: ${modId}`);
    const embed = successEmbed('Membre expulsé', `**Utilisateur :** ${target.user.tag}\n**Raison :** ${reason}\n**Modérateur :** <@${modId}>`);
    reply(ctx, isSlash, { embeds: [embed] });

    const log = guild.channels.cache.find(c => c.name === 'mod-logs' || c.name === 'logs');
    if (log) log.send({ embeds: [embed] }).catch(() => {});
  },
};

function reply(ctx, isSlash, payload) {
  return isSlash ? ctx.reply(payload) : ctx.reply(payload);
}
