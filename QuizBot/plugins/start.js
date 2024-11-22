const bot = require("../index");
const { START_TEXT, TOOLS_TEXT, ABOUT_TEXT } = require("../core/formats");

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
    await ctx.reply(START_TEXT.English.replace("{}",name),
      { reply_markup: replyMarkup }
    );
  } catch (error) {
    console.error("Error in the start command:", error.message);
    await ctx.reply("Oops! Something went wrong. Please try again later."); 
  }
});




// ----------- Buttons Actions -------------- //

bot.action('tools_', async (ctx) => {
  await ctx.editMessageText(TOOLS_TEXT.English,
  { reply_markup: toolsMarkup });
});

bot.action('languages_', async (ctx) => {
  await ctx.editMessageText("Select Your Preferred Languages.",
    { reply_markup: langMarkup });
});

bot.action("start_", async (ctx) => {
  try {
    let name = ctx.from.first_name || "there"; 
    await ctx.editMessageText(START_TEXT.English.replace("{}",name),
      { reply_markup: replyMarkup }
    );
  } catch (error) {
    console.error("Error in the start command:", error.message);
    await ctx.reply("Oops! Something went wrong. Please try again later."); 
  }
});

bot.action("about_", async (ctx) => {
  await ctx.editMessageText(ABOUT_TEXT.English, 
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
/*
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


*/


bot.on('message', (ctx) => {
    // Check if the message contains a quiz poll
    if (ctx.message.poll && ctx.message.poll.is_quiz) {
        // Convert the poll to JSON and log it
        const quizData = ctx.message.poll;
        console.log('Quiz Poll JSON:', JSON.stringify(quizData, null, 2));

        // Reply to the user with the JSON data
        ctx.reply(`Here is the JSON of your quiz poll:\n\`\`\`\n${JSON.stringify(quizData, null, 2)}\n\`\`\``, {
            parse_mode: 'Markdown'
        });
    } else {
        ctx.reply("Please send a quiz poll to get the JSON data.");
    }
});










