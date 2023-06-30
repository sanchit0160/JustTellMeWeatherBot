const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require('axios');

const YOUR_BOT_TOKEN = process.env.YOUR_BOT_TOKEN;
const XRapidAPIKey = process.env.YOUR_XRapidAPIKey;

const bot = new TelegramBot(YOUR_BOT_TOKEN, { polling: true });

const keyboard = [
    [
        {
            text: 'Get current weather',
            callback_data: 'current'
        }
    ]
];

const keyboardMarkup = {
    inline_keyboard: keyboard
};

bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;

    if (callbackQuery.data === 'current') {
        await getCurrentWeather(chatId);
    }
});

bot.onText(/\/start/, (message) => {
    const chatId = message.chat.id;

    bot.sendMessage(chatId, 'Welcome! Click on the button below to get the current weather:', {
        reply_markup: keyboardMarkup
    });
});

async function getCurrentWeather(chatId) {
    try {
        const ipApiResponse = await axios.get('http://ip-api.com/json');
        const { lat, lon } = ipApiResponse.data;
        const latitude = lat.toFixed(2);
        const longitude = lon.toFixed(2);

        const query = `${latitude},${longitude}`;
        const options = {
            headers: {
                'X-RapidAPI-Key': XRapidAPIKey,
                'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
            }
        };

        const weatherApiResponse = await axios.get(`https://weatherapi-com.p.rapidapi.com/current.json?q=${query}`, options);
        const { location, current } = weatherApiResponse.data;

        const animationUrl = 'https://media.giphy.com/media/za5xikuRr0OzK/giphy.gif';
        await bot.sendAnimation(chatId, animationUrl);

        const messageText = `The weather in ${location.name} is ${current.condition.text} with a temperature of ${current.temp_c} °C.`;
        await bot.sendMessage(chatId, messageText);

        const buttonMessage = 'Get the current weather again.';
        await bot.sendMessage(chatId, buttonMessage, { reply_markup: keyboardMarkup });
    } catch (error) {
        console.error(error);
    }
}