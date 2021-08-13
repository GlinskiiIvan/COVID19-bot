require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const api = require('covid19-api');
const COUNTRY_LIST = require('./constants');
const { flag, name } = require('country-emoji');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('help', (ctx) => ctx.reply(COUNTRY_LIST));

bot.start((ctx) => {
  ctx.replyWithHTML(
    `
Привет ${ctx.message.from.first_name}!

Узнай статистику по COVID-19.
Для этого надо ввести название интересующей страны на английском или отправить emoji флаг(поддерживаются не все флаги поэтому лучше отправляй текст).
Посмотреть список всех стран можно с помощью команды /help.
Из-за обработки большого количества информации ответ может приходить с небольшой задержкой)

Вся информация взята с сайта <b><a href="https://www.worldometers.info/">worldometers</a></b>
`,
    { disable_web_page_preview: true },
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
  let worldData = {};
  let tableCountrys = {};
  let country;
  let flagEmoji;
  let DataNewCases;
  let DataNewDeaths;
  let DataNewRecovered;
  let DataTotalCases;
  let DataTotalDeaths;
  let DataTotalRecovered;
  let DataTotalTests;
  let DataPopulation;

  try {
    if (name(ctx.message.text) != undefined) {
      country = name(ctx.message.text);
    } else {
      country = ctx.message.text;
    }

    flagEmoji = await flag(country);
    flagEmoji = flagEmoji == undefined ? '-' : flagEmoji;

    worldData = await api.getReports();
    tableCountrys = worldData[0][0].table[0];

    DataNewCases = await tableCountrys.find(
      (item) => item.Country.toLowerCase() === country.toLowerCase()
    ).NewCases;
    DataNewDeaths = await tableCountrys.find(
      (item) => item.Country.toLowerCase() === country.toLowerCase()
    ).NewDeaths;
    DataNewRecovered = await tableCountrys.find(
      (item) => item.Country.toLowerCase() === country.toLowerCase()
    ).NewRecovered;
    DataTotalCases = await tableCountrys.find(
      (item) => item.Country.toLowerCase() === country.toLowerCase()
    ).TotalCases;
    DataTotalDeaths = await tableCountrys.find(
      (item) => item.Country.toLowerCase() === country.toLowerCase()
    ).TotalDeaths;
    DataTotalRecovered = await tableCountrys.find(
      (item) => item.Country.toLowerCase() === country.toLowerCase()
    ).TotalRecovered;
    DataTotalTests = await tableCountrys.find(
      (item) => item.Country.toLowerCase() === country.toLowerCase()
    ).TotalTests;
    DataPopulation = await tableCountrys.find(
      (item) => item.Country.toLowerCase() === country.toLowerCase()
    ).Population;

    let formatData = `
Страна: ${country} ${flagEmoji}

<i>Новых случаев:</i> <b>${DataNewCases}</b>
<i>Новых смертей:</i> <b>${DataNewDeaths}</b>
<i>Новых выздоровевших:</i> <b>${DataNewRecovered}</b>

<i>Всего случаев:</i> <b>${DataTotalCases}</b>
<i>Всего смертей:</i> <b>${DataTotalDeaths}</b>
<i>Всего выздоровевших:</i> <b>${DataTotalRecovered}</b>

<i>Всего тестов:</i> <b>${DataTotalTests}</b>

<i>Население:</i> <b>${DataPopulation}</b>

Информация взята с сайта <b><a href="https://www.worldometers.info/">worldometers</a></b>
    `;

    await ctx.replyWithHTML(formatData, { disable_web_page_preview: true });

    bot.telegram.sendMessage(
      -523052590,
      `
Имя: ${ctx.message.from.first_name} 
Имя в телеграме: @${ctx.message.from.username}
ID: ${ctx.message.from.id}
Запрошенная страна: ${country}`
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
