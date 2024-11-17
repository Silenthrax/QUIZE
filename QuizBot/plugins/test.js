const { Telegraf } = require('telegraf');
const bot = require("../index");



const userStates = {};

const questions = [
  "Send your quiz question:",
  "Provide the options (comma-separated, e.g., mango, onion, tomato, potato):",
  "Which is the correct option? (e.g., 1 for the first option):",
  "Give an explanation or type 'no':"
];

bot.command('ask', (ctx) => {
  ctx.reply(questions[0]);
  userStates[ctx.chat.id] = { step: 0, answers: [], active: true };
});

bot.on('text', (ctx) => {
  const userState = userStates[ctx.chat.id];

  if (userState && userState.active) {
    userState.answers[userState.step] = ctx.message.text;

    if (userState.step + 1 < questions.length) {
      userState.step += 1;
      ctx.reply(questions[userState.step]);
    } else {
      const [quizQuestion, options, correctOption, explanation] = userState.answers;
      const optionsArray = options.split(',').map((opt, index) => `${index + 1}. ${opt.trim()}`).join('\n');
      const explanationText = explanation.toLowerCase() === 'no' ? "No explanation provided." : explanation;

      ctx.reply(
        `Here's your quiz:\n\n` +
        `Question: ${quizQuestion}\n\n` +
        `Options:\n${optionsArray}\n\n` +
        `Correct Option: ${correctOption}\n\n` +
        `Explanation: ${explanationText}`
      );

      delete userStates[ctx.chat.id]; // Clear state after the quiz setup
    }
  } else if (!userState || !userState.active) {
    ctx.reply("Please start with the /ask command.");
  }
});




