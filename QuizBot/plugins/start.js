const bot = require("../index");


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
    [{ text: "🔙 Back", callback_data: "start_" }]
        ]}});
});

bot.action("maintainer_", async (ctx) => {
  await ctx.answerCbQuery("The bot is under maintenance. Please check back later.");
});


