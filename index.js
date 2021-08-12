require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const api = require('covid19-api');
const COUNTRY_LIST = require('./constants');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('help', (ctx) => ctx.reply(COUNTRY_LIST));

bot.start((ctx) => {
  ctx.reply(
    `
Привет ${ctx.message.from.first_name}!
Узнай статистику по COVID-19.
Для этого надо ввести название интересующей страны на английском.
Посмотреть список всех стран можно с помощью команды /help.
`,
    Markup.keyboard(['Russia', 'Kazakhstan', 'Belarus', 'China']).resize()
  );

  // Notification of a new user in my telegram
  bot.telegram.sendMessage(
    -523052590,
    `
Новый пользователь!
Имя: ${ctx.message.from.first_name}
Имя в телеграме: @${ctx.message.from.username}
ID:  ${ctx.message.from.id}
    `
  );
});
bot.help((ctx) => ctx.reply(COUNTRY_LIST));

bot.on('text', async (ctx) => {
  let data = {};
  let worldData = {};
  let tableCountrys = {};
  try {
    data = await api.getReportsByCountries(ctx.message.text);
    worldData = await api.getReports();
    tableCountrys = worldData[0][0].table[0];

    let formatData = `
Страна: ${data[0][0].country}

<i>Новых случаев:</i> <b>${
      tableCountrys.find((item) => item.Country === ctx.message.text).NewCases
    }</b>
<i>Новых смертей:</i> <b>${
      tableCountrys.find((item) => item.Country === ctx.message.text).NewDeaths
    }</b>
<i>Новых выздоровевших:</i> <b>${
      tableCountrys.find((item) => item.Country === ctx.message.text).NewRecovered
    }</b>

<i>Всего случаев:</i> <b>${data[0][0].cases}</b>
<i>Всего смертей:</i> <b>${data[0][0].deaths}</b>
<i>Всего выздоровевших:</i> <b>${data[0][0].recovered}</b>
    `;

    ctx.replyWithHTML(formatData);

    bot.telegram.sendMessage(
      -523052590,
      `
Имя: ${ctx.message.from.first_name} 
Имя в телеграме: @${ctx.message.from.username}
ID: ${ctx.message.from.id}
Запрошенная страна: ${data[0][0].country}`
    );
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

console.log('Бот запущен');
