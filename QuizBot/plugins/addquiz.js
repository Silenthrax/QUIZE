const { Telegraf } = require('telegraf');
const bot = require("../index");



const replyMarkup = {
  inline_keyboard: [
    [{ text: "➕ Add More Quiz ➕", callback_data: "add_more" }]
  ]
};

const userStates = {};

const questions = [
  "📝 Send your quiz question:",
  "📋 Provide the options (comma-separated, e.g., mango, onion, tomato, potato):",
  "✅ Which is the correct option? (e.g., 1 for the first option):",
  "💬 Give an explanation or type 'no':"
];


async function AddUsersQuiz(ctx) {
  ctx.reply(questions[0]);
  userStates[ctx.chat.id] = { step: 0, answers: [], active: true };
}

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
      const explanationText = explanation.toLowerCase() === 'no' ? "❌ No explanation provided." : explanation;

      if (
        isNaN(correctOption) ||
        correctOption < 1 ||
        correctOption > options.split(',').length
      ) {
        ctx.reply("❌ Invalid correct option number. Please restart the quiz creation process.");
        delete userStates[ctx.chat.id];
        return;
      }

      ctx.replyWithHTML(
        `<b>📚 Here is Your Quiz Question:</b>\n\n` +
        `<b>📝 Question</b>: <pre>${quizQuestion}</pre>\n\n` +
        `<b>📋 Options</b>:\n<pre>${optionsArray}</pre>\n\n` +
        `<b>✅ Correct Option</b>: <pre>${correctOption}</pre>\n\n` +
        `<b>💬 Explanation</b>: <pre>${explanationText}</pre>`,
        { reply_markup: replyMarkup }
      );

      delete userStates[ctx.chat.id];
    }
  }
});

bot.command('adquiz', (ctx) => {
  ctx.reply(questions[0]);
  userStates[ctx.chat.id] = { step: 0, answers: [], active: true };
});

bot.command('addquiz', async (ctx) => {
  await AddUsersQuiz(ctx);
});

module.exports = AddUsersQuiz;





