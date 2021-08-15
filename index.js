require('dotenv').config();

const DATABASE = require('./db/db');
const users = require('./db/users-model');
const requestedCountries = require('./db/requested-countries-model');
const { Telegraf, Markup } = require('telegraf');
const api = require('covid19-api');
const COUNTRY_LIST_EN = require('./country-list-en');
const COUNTRY_LIST_RU = require('./country-list-ru');
const { flag, name } = require('country-emoji');
const translate = require('@iamtraction/google-translate');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('help_en', async (ctx) => {
  ctx.reply(COUNTRY_LIST_EN);
});
bot.command('help_ru', async (ctx) => {
  ctx.reply(COUNTRY_LIST_RU);
});

bot.start(async (ctx) => {
  ctx.replyWithHTML(
    `
Привет ${ctx.message.from.first_name}!

Узнай статистику по COVID-19.
Для этого надо ввести название интересующей страны на русском или английском, или отправить emoji флаг(поддерживаются не все флаги поэтому лучше отправляй текст).
Посмотреть список всех стран можно с помощью команды /help_ru (русский) или /help_en (english).
Из-за обработки большого количества информации ответ может приходить с небольшой задержкой)

Вся информация взята с сайта <b><a href="https://www.worldometers.info/">worldometers</a></b>
`,
    { disable_web_page_preview: true },
    Markup.keyboard(['Россия', 'Казахстан', 'Беларусь', 'Китай']).resize()
  );

  await DATABASE.sync();
  let isUser = false;
  await users
    .findOne({
      where: {
        id_telegram: String(ctx.message.from.id),
      },
    })
    .then(async (users) => {
      if (users != null) {
        isUser = true;
      }
    });
  if (!isUser) {
    await users.create({
      id_telegram: ctx.message.from.id,
      first_name: ctx.message.from.first_name,
      last_name: ctx.message.from.last_name,
      user_name: ctx.message.from.username,
    });
  }
});

bot.on('text', async (ctx) => {
  let worldData = {};
  let tableCountrys = {};
  let country = (await translate(ctx.message.text, { from: 'ru', to: 'en' })).text;
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

    country = (await translate(country, { from: 'en', to: 'ru' })).text;

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

    await DATABASE.sync();
    await requestedCountries.create({
      id_telegram: ctx.message.from.id,
      first_name: ctx.message.from.first_name,
      last_name: ctx.message.from.last_name,
      user_name: ctx.message.from.username,
      requested_countries: country,
    });
  } catch (e) {
    ctx.reply(`
Ошибка: такой страны не существует.
Используйте команду /help_ru (русский) или /help_en (english) для просмотра списка стран.
`);
    console.log(e);
    console.log('Ошибка');
  }
});

bot.hears('hi', (ctx) => ctx.reply(`Привет ${ctx.message.from.first_name}`));
bot.launch();

console.log('Бот запущен');
