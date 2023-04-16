const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

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

bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;

  if (callbackQuery.data === 'current') {
	getCurrentWeather(chatId);
  }
});

bot.onText(/\/start/, (message) => {
  const chatId = message.chat.id;

  bot.sendMessage(chatId, 'Welcome! Click on the button below to get the current weather:', {
	reply_markup: keyboardMarkup
  });
});

function getCurrentWeather(chatId) {
  fetch('http://ip-api.com/json')
    .then(response => response.json())
    .then(data => {
      const latitude = data.lat.toFixed(2);
      const longitude = data.lon.toFixed(2);

      const query = `${latitude},${longitude}`;
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': XRapidAPIKey,
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
        }
      };
      
      fetch(`https://weatherapi-com.p.rapidapi.com/current.json?q=${query}`, options)
        .then(response => response.json())
        .then(data => {
          const animationUrl = 'https://media.giphy.com/media/za5xikuRr0OzK/giphy.gif';
          bot.sendAnimation(chatId, animationUrl)
            .then(() => {
              const messageText = `The weather in ${data.location.name} is ${data.current.condition.text} with a temperature of ${data.current.temp_c} °C.`;
              bot.sendMessage(chatId, messageText)
              	.then(() => {              	  
              	  const buttonMessage = 'Click on the button below to get the current weather again.';
              	  bot.sendMessage(chatId, buttonMessage, { reply_markup: keyboardMarkup });
              	})
              	.catch(error => console.error(error));
            })
            .catch(error => console.error(error));
        })
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error));
}
