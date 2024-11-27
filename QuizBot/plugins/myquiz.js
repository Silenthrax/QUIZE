const bot = require("../index");
const { getQuiz, getAllQuizNames, deleteAllQuizzes } = require("../core/mongo/quizesdb");


// ------------------ Buttons ------------------ //
const removeAllMarkup = {
  inline_keyboard: [
    [
      { text: "Remove All Quizzes", callback_data: "remove_all_quizzes" }
    ]
  ]
};

// ---------------- My Quiz Command ---------------- //
bot.command("myquiz", async (ctx) => {
  const user_id = ctx.message.from.id;
  const allquizNames = await getAllQuizNames(user_id);

  if (!allquizNames || allquizNames.length === 0) {
    ctx.reply('Quiz not found.');
    return;
  }

  let NameText = 'Here are all your Quiz Names:\n\n';
  const botName = ctx.botInfo.username;

  allquizNames.forEach((name, index) => {
    NameText += `Quiz ${index + 1}\nhttps://t.me/${botName}?start=QuizName_${name}\n\n`;
  });

  await ctx.reply(NameText, {
    reply_markup: removeAllMarkup 
  });
});


// ------------- Actions -------------- //
bot.action('remove_all_quizzes', async (ctx) => {
  const user_id = ctx.from.id;
  await deleteAllQuizzes(user_id);  
  await ctx.answerCbQuery('All quizzes have been removed.');
  await ctx.editMessageText('All quizzes have been removed successfully!');
});





bot.command("viewquiz", async (ctx) => {
  try {
    const user_id = ctx.from.id;
    const name = "88FIJ1-152"; // Use 'const' to declare variables when the value doesn't change
    const quizData = await getQuiz(user_id, name);
    await ctx.reply(quizData);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    await ctx.reply("There was an error fetching the quiz. Please try again later.");
  }
});

// ---------------- Poll Function --------------- //

async function pollUploader(ctx, user_id, name) {
  try {
    const quizData = await getQuiz(user_id, name);
    await ctx.reply(quizData);
  } catch (error) {
    console.error("Error uploading poll:", error);
    await ctx.reply("Failed to upload the poll. Please try again.");
  }
}

module.exports = { pollUploader };





