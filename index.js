require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const api = require('covid19-api');
const COUNTRY_LIST = require('./constants');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) =>
  ctx.reply(
    `
Привет ${ctx.message.from.first_name}!
Узнай статистику по COVID-19.
Для этого надо ввести название интересующей страны на английском.
Посмотреть список всех стран можно с помощью команды /help.
`,
    Markup.keyboard(['Russia', 'Kazakhstan', 'Belarus', 'China']).resize()
  )
);
bot.help((ctx) => ctx.reply(COUNTRY_LIST));
// bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.on('text', async (ctx) => {
  let data = {};
  try {
    data = await api.getReportsByCountries(ctx.message.text);

    let formatData = `
Страна: ${data[0][0].country}
Случаев: ${data[0][0].cases}
Смертей: ${data[0][0].deaths}
Выздоровевших: ${data[0][0].recovered}
    `;

    ctx.reply(formatData);

    console.log(`
Имя: ${ctx.message.from.first_name} 
ID: ${ctx.message.from.id}
Запрошенная страна: ${data[0][0].country}`);
  } catch {
    ctx.reply(`
Ошибка: такой страны не существует.
Используйте команду /help для просмотра списка стран.
`);
    console.log('Ошибка');
  }
});
bot.hears('hi', (ctx) => ctx.reply(`Привет ${ctx.message.from.first_name}`));
bot.launch();

// eslint-disable-next-line no-console
console.log('Бот запущен');
