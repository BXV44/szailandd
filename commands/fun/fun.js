const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { infoEmbed, errorEmbed } = require('../../utils/embeds');
const INVITE = 'discord.gg/szailand';

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── 8BALL ─────────────────────────────────────────────────────────────────────
const eightball = {
  name: '8ball',
  aliases: ['8b', 'boule'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Pose une question à la boule magique')
    .addStringOption(o => o.setName('question').setDescription('Ta question').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const question = isSlash ? ctx.options.getString('question') : args.join(' ');
    const positives = ['Oui, absolument!', 'Sans aucun doute!', 'Très probablement.', 'Les signes pointent vers oui.', 'Compte là-dessus.'];
    const neutrals  = ['Difficile à dire.', 'Demande à nouveau plus tard.', 'Mieux vaut ne pas te répondre maintenant.', 'Impossible de prédire.'];
    const negatives = ['Non.', 'Mes sources disent non.', 'Très probablement pas.', 'Les perspectives ne sont pas bonnes.', 'Oublie ça.'];
    const all = [...positives, ...neutrals, ...negatives];
    const answer = rnd(all);
    const color = positives.includes(answer) ? 0x00FF88 : negatives.includes(answer) ? 0xFF4444 : 0xFFAA00;
    const embed = new EmbedBuilder().setColor(color).setTitle('🎱 Boule Magique').addFields(
      { name: '❓ Question', value: question },
      { name: '🔮 Réponse', value: answer },
    ).setFooter({ text: INVITE }).setTimestamp();
    reply(ctx, isSlash, { embeds: [embed] });
  },
};

// ── COINFLIP ──────────────────────────────────────────────────────────────────
const coinflip = {
  name: 'coinflip',
  aliases: ['flip', 'pile'],
  requireMod: false,
  data: new SlashCommandBuilder().setName('coinflip').setDescription('Pile ou face'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const result  = Math.random() > 0.5 ? '🌝 **Face**' : '🌚 **Pile**';
    reply(ctx, isSlash, { embeds: [infoEmbed('Pile ou Face', result)] });
  },
};

// ── ROLL ─────────────────────────────────────────────────────────────────────
const roll = {
  name: 'roll',
  aliases: ['dé', 'dice'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Lancer un dé (ex: 1d6, 2d20)')
    .addStringOption(o => o.setName('dé').setDescription('Format: NdX (ex: 2d6, 1d20)').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const input   = (isSlash ? ctx.options.getString('dé') : args[0]) || '1d6';
    const match   = input.match(/^(\d+)d(\d+)$/i);
    if (!match) return reply(ctx, isSlash, { embeds: [errorEmbed('Format invalide. Utilise `1d6`, `2d20`, etc.')] });
    const [, n, x] = match.map(Number);
    if (n > 20 || x > 1000) return reply(ctx, isSlash, { embeds: [errorEmbed('Max 20 dés et 1000 faces.')] });
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * x) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);
    const desc  = n > 1 ? `Dés: ${rolls.join(', ')}\n**Total: ${total}**` : `**Résultat: ${total}**`;
    reply(ctx, isSlash, { embeds: [infoEmbed(`🎲 Dé ${input}`, desc)] });
  },
};

// ── RPS (Pierre Feuille Ciseaux) ─────────────────────────────────────────────
const rps = {
  name: 'rps',
  aliases: ['pfc'],
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Pierre Feuille Ciseaux')
    .addStringOption(o => o.setName('choix').setDescription('pierre / feuille / ciseaux').setRequired(true).addChoices(
      { name: '🪨 Pierre', value: 'pierre' },
      { name: '📄 Feuille', value: 'feuille' },
      { name: '✂️ Ciseaux', value: 'ciseaux' },
    )),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const choices = ['pierre', 'feuille', 'ciseaux'];
    const emojis  = { pierre: '🪨', feuille: '📄', ciseaux: '✂️' };
    const player  = isSlash ? ctx.options.getString('choix') : args[0]?.toLowerCase();
    if (!choices.includes(player)) return reply(ctx, isSlash, { embeds: [errorEmbed('Choisis `pierre`, `feuille` ou `ciseaux`.')] });
    const bot = rnd(choices);
    let result;
    if (player === bot) result = '🤝 **Égalité!**';
    else if ((player === 'pierre' && bot === 'ciseaux') || (player === 'feuille' && bot === 'pierre') || (player === 'ciseaux' && bot === 'feuille')) result = '🎉 **Tu as gagné!**';
    else result = '💀 **Tu as perdu!**';
    reply(ctx, isSlash, { embeds: [infoEmbed('Pierre Feuille Ciseaux', `Tu: ${emojis[player]} **${player}** vs Moi: ${emojis[bot]} **${bot}**\n\n${result}`)] });
  },
};

// ── PP ────────────────────────────────────────────────────────────────────────
const pp = {
  name: 'pp',
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('pp')
    .setDescription('...')
    .addUserOption(o => o.setName('utilisateur').setDescription('Membre').setRequired(false)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    let user;
    if (isSlash) user = ctx.options.getUser('utilisateur') || ctx.user;
    else user = ctx.mentions.users.first() || ctx.author;
    const size = Math.floor(Math.random() * 20);
    const bar  = '8' + '='.repeat(size) + 'D';
    reply(ctx, isSlash, { embeds: [infoEmbed(`📏 PP de ${user.username}`, `\`${bar}\`\n**${size} cm**`)] });
  },
};

// ── ROAST ─────────────────────────────────────────────────────────────────────
const roast = {
  name: 'roast',
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Troll un membre')
    .addUserOption(o => o.setName('utilisateur').setDescription('Victime').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    let user;
    if (isSlash) user = ctx.options.getUser('utilisateur');
    else user = ctx.mentions.users.first();
    if (!user) return reply(ctx, isSlash, { embeds: [errorEmbed('Mentionne quelqu\'un.')] });
    const roasts = [
      'es aussi utile qu\'un adblocker sur un site sans pubs.',
      'as un visage que seule ta mère pourrait aimer... certains jours.',
      'es la preuve que même les erreurs ont une mère.',
      'confonds "être drôle" et "être nul".',
      'ressembles à une notification Discord en sourdine: ignoré.',
      'es aussi charismatique qu\'un bug 404.',
      'fais planter le bot rien qu\'en tapant.',
      'as le QI d\'une variable non définie.',
    ];
    reply(ctx, isSlash, { embeds: [infoEmbed('🔥 Roast', `<@${user.id}>, tu ${rnd(roasts)}`)] });
  },
};

function reply(ctx, isSlash, payload) {
  return isSlash ? ctx.reply(payload) : ctx.reply(payload);
}

module.exports = { eightball, coinflip, roll, rps, pp, roast };
