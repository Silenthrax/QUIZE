const bot = require("../index");
const { START_TEXT, TOOLS_TEXT, ABOUT_TEXT } = require("../core/formats");
const { add_lang, get_lang } = require("../core/mongo/langsdb");


// -------------- Buttons ------------------ //

const langMarkup = {
  inline_keyboard: [
    [{ text: "🇬🇧 English", callback_data: "English_" }],
    [{ text: "🇮🇳 Hindi", callback_data: "Hindi_" }],
    [{ text: "🇨🇳 Chinese", callback_data: "Chinese_" }],
    [{ text: "🇷🇺 Russian", callback_data: "Russian_" }],
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
    let user_id = ctx.from.id
    let langs = await get_lang(user_id)
    if(langs){
      console.log("not a single lang selected. ");
    }else{
      await add_lang(user_id, "English")
    }
    await ctx.reply(START_TEXT.langs.replace("{}",name),
      { reply_markup: replyMarkup }
    );
  } catch (error) {
    console.error("Error in the start command:", error.message);
    await ctx.reply("Oops! Something went wrong. Please try again later."); 
  }
});




// ----------- Buttons Actions -------------- //

bot.action('tools_', async (ctx) => {
  let user_id = ctx.from.id
  let langs = await get_lang(user_id)
  await ctx.editMessageText(TOOLS_TEXT.langs,
  { parse_mode: "HTML",
   reply_markup: toolsMarkup });
});

bot.action('languages_', async (ctx) => {
  await ctx.editMessageText("Select Your Preferred Languages.",
    { reply_markup: langMarkup });
});

bot.action("start_", async (ctx) => {
  try {
    let name = ctx.from.first_name || "there"; 
    let user_id = ctx.from.id
    let langs = await get_lang(user_id)
    await ctx.editMessageText(START_TEXT.langs.replace("{}",name),
      { reply_markup: replyMarkup }
    );
  } catch (error) {
    console.error("Error in the start command:", error.message);
    await ctx.reply("Oops! Something went wrong. Please try again later."); 
  }
});


bot.action("about_", async (ctx) => {
  let user_id = ctx.from.id
  let langs = await get_lang(user_id)
  await ctx.editMessageText(ABOUT_TEXT.langs,{
    parse_mode: "HTML",
    reply_markup: {inline_keyboard: [
    [
      { text: "⛪ Home", callback_data: "start_" },
      { text: "🔙 Back", callback_data: "tools_" },
    ]
        ]}});
});

bot.action("maintainer_", async (ctx) => {
  await ctx.answerCbQuery("The bot is under maintenance. Please check back later.");
});


// ------------- Multi Lang ------------- //

bot.action("English_", async (ctx) => {
  let user_id = ctx.from.id
  await add_lang(user_id, "English")
  await ctx.answerCbQuery("Hey Babe:), You selected English language.");
});

bot.action("Hindi_", async (ctx) => {
  let user_id = ctx.from.id
  await add_lang(user_id, "Hindi")
  await ctx.answerCbQuery("Hey Babe:), You selected Hindi language.");
});

bot.action("Chinese_", async (ctx) => {
  let user_id = ctx.from.id
  await add_lang(user_id, "Chinese")
  await ctx.answerCbQuery("Hey Babe:), You selected Chinese language.");
});

bot.action("Russian_", async (ctx) => {
  let user_id = ctx.from.id
  await add_lang(user_id, "Russian")
  await ctx.answerCbQuery("Hey Babe:), You selected Russian language.");
});

// -------------------------------------- //








