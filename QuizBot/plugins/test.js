const { Telegraf } = require('telegraf');
const bot = require("../index");


// just testing //

const userStates = {};

const questions = [
  "What is your name?",
  "How old are you?",
  "What is your favorite hobby?"
];

bot.command('ask', (ctx) => {
  ctx.reply(questions[0]);
  userStates[ctx.chat.id] = { step: 0, answers: [] };
});

bot.on('text', (ctx) => {
  const userState = userStates[ctx.chat.id];

  if (userState) {
    userState.answers[userState.step] = ctx.message.text;

    if (userState.step + 1 < questions.length) {
      userState.step += 1;
      ctx.reply(questions[userState.step]);
    } else {
      const [name, age, hobby] = userState.answers;
      ctx.reply(`Thanks for answering!\nName: ${name}\nAge: ${age}\nHobby: ${hobby}`);
      delete userStates[ctx.chat.id];
    }
  } else {
    ctx.reply("Please start with the /ask command.");
  }
});



