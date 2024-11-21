const bot = require("../index");

// -------------- Buttons ------------------ //

const replyMarkup = {
  inline_keyboard: [
    [{ text: "English", callback_data: "maintainer_" }],
    [{ text: "Hindi", callback_data: "maintainer_" }],
    [{ text: "Chinese", callback_data: "maintainer_" }],
    [{ text: "Russian", callback_data: "maintainer_" }]
  ]
};


const langMarkup = {
  inline_keyboard: [
    [{ text: "🧰 Tools", callback_data: "tools_" }],
    [{ text: "🌐 Languages", callback_data: "languages_" }] // Fixed typo
  ]
};


bot.command("help", (ctx) => {
  try {
    let name = ctx.from.first_name || "there"; 
    ctx.reply(`Hello, ${name},\n\nWelcome to QuizBot! I'm here to help you create and organize quizzes effortlessly. Just save your questions, and let's turn them into interactive quizzes!`,
      { reply_markup: replyMarkup }
    );
  } catch (error) {
    console.error("Error in the start command:", error.message);
    ctx.reply("Oops! Something went wrong. Please try again later."); 
  }
});


bot.action('tools_', async (ctx) => {
  await ctx.reply("Tools Hered !!");
});

bot.action('languages_', async (ctx) => {
  await ctx.reply("Select Your Preferred Languanges.",
  { reply_markup: langMarkup });
});


bot.action("maintainer_", async (ctx) => {
  await ctx.reply("soon!!/nBot under in Maintenanced.");
});


