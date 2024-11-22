const bot = require("../index");
const { START_TEXT } = require("./core/formats");

// -------------- Buttons ------------------ //

const langMarkup = {
  inline_keyboard: [
    [{ text: "🇬🇧 English", callback_data: "maintainer_" }],
    [{ text: "🇮🇳 Hindi", callback_data: "maintainer_" }],
    [{ text: "🇨🇳 Chinese", callback_data: "maintainer_" }],
    [{ text: "🇷🇺 Russian", callback_data: "maintainer_" }],
    [{ text: "🔙 Back", callback_data: "start_" }]
  ]
};

const replyMarkup = {
  inline_keyboard: [
    [{ text: "🧰 Tools", callback_data: "tools_" }],
    [{ text: "🌐 Languages", callback_data: "languages_" }]
  ]
};

const toolsMarkup = {
  inline_keyboard: [
    [
      { text: "🔐 About", callback_data: "about_" },
      { text: "🔙 Back", callback_data: "start_" }
    ]
  ]
};


// ------------- Start Command ------------- //
bot.command("start", async (ctx) => {
  try {
    let name = ctx.from.first_name || "there"; 
    await ctx.reply(`Hello, ${name},\n\nWelcome to QuizBot! I'm here to help you create and organize quizzes effortlessly. Just save your questions, and let's turn them into interactive quizzes!`,
      { reply_markup: replyMarkup }
    );
  } catch (error) {
    console.error("Error in the start command:", error.message);
    await ctx.reply("Oops! Something went wrong. Please try again later."); 
  }
});




// ----------- Buttons Actions -------------- //

bot.action('tools_', async (ctx) => {
  await ctx.editMessageText("Tools Here!!",
  { reply_markup: toolsMarkup });
});

bot.action('languages_', async (ctx) => {
  await ctx.editMessageText("Select Your Preferred Languages.",
    { reply_markup: langMarkup });
});

bot.action("start_", async (ctx) => {
  try {
    let name = ctx.from.first_name || "there"; 
    await ctx.editMessageText(`Hello, ${name},\n\nWelcome to QuizBot! I'm here to help you create and organize quizzes effortlessly. Just save your questions, and let's turn them into interactive quizzes!`,
      { reply_markup: replyMarkup }
    );
  } catch (error) {
    console.error("Error in the start command:", error.message);
    await ctx.reply("Oops! Something went wrong. Please try again later."); 
  }
});

bot.action("about_", async (ctx) => {
  await ctx.editMessageText("About section", 
    {reply_markup: {inline_keyboard: [
    [
      { text: "⛪ Home", callback_data: "start_" },
      { text: "🔙 Back", callback_data: "tools_" },
    ]
        ]}});
});

bot.action("maintainer_", async (ctx) => {
  await ctx.answerCbQuery("The bot is under maintenance. Please check back later.");
});



// -------------- Quizes ------------- //
const userStates = {};

const questions = [
  "📝 Send your quiz question:",
  "📋 Provide the options (comma-separated, e.g., mango, onion, tomato, potato):",
  "✅ Which is the correct option? (e.g., 1 for the first option):",
  "💬 Give an explanation or type 'no':"
];

const AddmoreMarkup = {
  inline_keyboard: [
    [{ text: "➕ Add More Quiz ➕", callback_data: "add_more" }]
  ]
};

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

bot.command('addquiz', (ctx) => {
  ctx.reply(questions[0]);
  userStates[ctx.chat.id] = { step: 0, answers: [], active: true };
});

bot.action('add_more', (ctx) => {
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
      const optionsArray = options.split(',').map((opt) => opt.trim());
      const explanationText = explanation.toLowerCase() === 'no' ? "❌ No explanation provided." : explanation;

      if (isNaN(correctOption) || correctOption < 1 || correctOption > optionsArray.length) {
        ctx.reply("❌ Invalid correct option number. Please restart the quiz creation process.");
        delete userStates[ctx.chat.id];
        return;
      }

      ctx.replyWithHTML(`
<b>📚 Here is Your Quiz Question:</b>
    
<b>📝 Question:</b> ${quizQuestion}
<b>📋 Options:</b> ${optionsArray.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n')}
<b>✅ Correct Option:</b> ${correctOption}
<b>💬 Explanation:</b> ${explanationText}`,
        { reply_markup: AddmoreMarkup }
      );

      delete userStates[ctx.chat.id];
    }
  }
});









