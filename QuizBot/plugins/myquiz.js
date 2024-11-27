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




// ------------- Poll Uploader ---------------- //

const userResponses = {};

async function pollUploader(ctx, user_id, name) {
  try {
    const quizData = await getQuiz(user_id, name); // Get quiz data
    console.log(`Quiz Name: ${name}`);
    
    for (let i = 0; i < quizData.length; i++) {
      
      const quiz = quizData[i];
      const question = quiz.question;    
      const options = Object.values(quiz.options);
      const correctIndex = quiz.correctAnswer;
      const explanation = quiz.explanation || "";

      if (options.length < 2) {
        console.error("Insufficient options:", options);
        await ctx.reply(`Error: At least two valid options are required for question "${question}".`);
        continue;
      }

      await ctx.sendPoll(question, options, {
        type: "quiz",
        correct_option_id: correctIndex,
        is_anonymous: false,
        explanation: explanation,
      });
      
      console.log(`Waiting for 60 seconds before sending the next poll...`);
      await new Promise((resolve) => setTimeout(resolve, 60000)); // 60 seconds delay
    }
  } catch (error) {
    console.error("Error uploading poll:", error);
    await ctx.reply("Failed to upload the poll. Please try again.");
  }
}





module.exports = { pollUploader };
