const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

const timeUnits = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

function parseDuration(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  const ms = parseInt(match[1]) * timeUnits[match[2].toLowerCase()];
  if (ms > 28 * 24 * 3_600_000) return null; // max 28j Discord
  return ms;
}

module.exports = {
  name: 'mute',
  aliases: ['timeout', 'silence'],
  requireMod: true,
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mettre en sourdine un membre (timeout)')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre à mute').setRequired(true))
    .addStringOption(o => o.setName('durée').setDescription('Durée ex: 10m, 2h, 1d (max 28j)').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(false)),

  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const guild   = ctx.guild;
    const modId   = isSlash ? ctx.user.id : ctx.author.id;

    let target, durationStr, reason;
    if (isSlash) {
      target      = ctx.options.getMember('utilisateur');
      durationStr = ctx.options.getString('durée');
      reason      = ctx.options.getString('raison') || 'Aucune raison';
    } else {
      target      = ctx.mentions.members.first() || guild.members.cache.get(args[0]);
      durationStr = args[1];
      reason      = args.slice(2).join(' ') || 'Aucune raison';
    }

    if (!target) return reply(ctx, isSlash, { embeds: [errorEmbed('Utilisateur introuvable.')] });
    const ms = parseDuration(durationStr);
    if (!ms) return reply(ctx, isSlash, { embeds: [errorEmbed('Durée invalide. Utilise: `10m`, `2h`, `1d` (max 28j).')] });
    if (!target.moderatable) return reply(ctx, isSlash, { embeds: [errorEmbed('Je ne peux pas mute cet utilisateur.')] });

    await target.timeout(ms, `${reason} | Par: ${modId}`);

    const until = `<t:${Math.floor((Date.now() + ms) / 1000)}:R>`;
    const embed = successEmbed('Membre mute', `**Utilisateur :** ${target.user.tag}\n**Durée :** ${durationStr} (expire ${until})\n**Raison :** ${reason}\n**Modérateur :** <@${modId}>`);

    await target.user.send({
      embeds: [new EmbedBuilder()
        .setColor(0xFFAA00)
        .setTitle(`🔇 Tu as été mis en sourdine sur ${guild.name}`)
        .setDescription(`**Durée :** ${durationStr}\n**Raison :** ${reason}\n**Expire :** ${until}`)
        .setTimestamp()]
    }).catch(() => {});

    reply(ctx, isSlash, { embeds: [embed] });
    const log = guild.channels.cache.find(c => c.name === 'mod-logs' || c.name === 'logs');
    if (log) log.send({ embeds: [embed] }).catch(() => {});
  },
};

function reply(ctx, isSlash, payload) {
  return isSlash ? ctx.reply(payload) : ctx.reply(payload);
}
