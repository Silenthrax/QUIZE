const bot = require("../index");

// User states to track active quiz creation sessions
const userStates = {};

// Questions for quiz creation
const questions = [
  "📝 Send your quiz question:",
  "📋 Provide the options (comma-separated, e.g., mango, onion, tomato, potato):",
  "✅ Which is the correct option? (e.g., 1 for the first option):",
  "💬 Give an explanation or type 'no':"
];

// Reply markup for adding more quizzes
const replyMarkup = {
  inline_keyboard: [
    [{ text: "➕ Add More Quiz ➕", callback_data: "add_more" }]
  ]
};

// Command: /quiz
bot.command('quiz', (ctx) => {
  const question = "What is the capital of France?";
  const options = ["Berlin", "Madrid", "Paris", "Rome"];
  const correctOptionId = 2;

  ctx.telegram.sendPoll(ctx.chat.id, question, options, {
    type: 'quiz',
    correct_option_id: correctOptionId,
    explanation: "Paris is the capital of France.",
    is_anonymous: false,
  }).catch((error) => {
    console.error('Failed to send quiz:', error);
  });
});

// Command: /addquiz
bot.command('addquiz', (ctx) => {
  ctx.reply(questions[0]);
  userStates[ctx.chat.id] = { step: 0, answers: [], active: true };
});

// Inline button action for adding more quizzes
bot.action('add_more', (ctx) => {
  ctx.reply(questions[0]);
  userStates[ctx.chat.id] = { step: 0, answers: [], active: true };
});

// Middleware: Handle user responses during quiz creation
bot.on('text', (ctx) => {
  const userState = userStates[ctx.chat.id];

  if (userState && userState.active) {
    // Save user input for the current step
    userState.answers[userState.step] = ctx.message.text;

    // Proceed to the next step
    if (userState.step + 1 < questions.length) {
      userState.step += 1;
      ctx.reply(questions[userState.step]);
    } else {
      // Quiz creation complete
      const [quizQuestion, options, correctOption, explanation] = userState.answers;
      const optionsArray = options.split(',').map((opt) => opt.trim());
      const explanationText = explanation.toLowerCase() === 'no' ? "❌ No explanation provided." : explanation;

      // Validate correct option
      if (isNaN(correctOption) || correctOption < 1 || correctOption > optionsArray.length) {
        ctx.reply("❌ Invalid correct option number. Please restart the quiz creation process.");
        delete userStates[ctx.chat.id];
        return;
      }

      // Confirm quiz creation
      ctx.replyWithHTML(`
<b>📚 Here is Your Quiz Question:</b>
    
<b>📝 Question:</b> ${quizQuestion}
<b>📋 Options:</b> ${optionsArray.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n')}
<b>✅ Correct Option:</b> ${correctOption}
<b>💬 Explanation:</b> ${explanationText}`,
        { reply_markup: replyMarkup }
      );

      // Clear user state
      delete userStates[ctx.chat.id];
    }
  }
});



