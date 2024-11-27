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
    console.log(quizData);

    // Loop through each quiz in the quizData array
    for (let i = 0; i < quizData.length; i++) {
      const quiz = quizData[i];
      const question = quiz.question;
      
      // Extract the options from the quiz and filter out invalid ones
      const options = Object.values(quiz.option).filter(Boolean);

      // Check if we have at least two valid options
      if (options.length < 2) {
        console.error("Insufficient options:", options);
        await ctx.reply(`Error: At least two valid options are required for question "${question}".`);
        continue;
      }

      // Correct answer index: quiz.correctAnswer should be 1-based, so subtract 1 for 0-based indexing
      const correctIndex = quiz.correct - 1;

      // Validate that the correct answer index is within bounds
      if (correctIndex < 0 || correctIndex >= options.length) {
        await ctx.reply(`Error: Correct answer index out of bounds for question "${question}".`);
        continue;
      }

      // Send poll for the current question
      await ctx.sendPoll(question, options, {
        type: "quiz",
        correct_option_id: correctIndex,
        is_anonymous: false,
        explanation: quiz.explanation || "",
      });

      // Wait for 60 seconds before sending the next poll
      console.log(`Waiting for 60 seconds before sending the next poll...`);
      await new Promise((resolve) => setTimeout(resolve, 60000)); // 60 seconds delay
    }

    // After all the polls, summarize the results
    await summarizeResults(ctx);
  } catch (error) {
    console.error("Error uploading poll:", error);
    await ctx.reply("Failed to upload the poll. Please try again.");
  }
}

async function summarizeResults(ctx) {
  let summary = "🏆 **Quiz Leaderboard** 🏆\n\n";
  let totalParticipants = Object.keys(userResponses).length;
  summary += `**Total Participants**: ${totalParticipants}\n\n`;

  // Sort users by the number of correct answers in descending order
  const sortedUsers = Object.values(userResponses).sort((a, b) => b.correct - a.correct);

  // Format leaderboard information
  sortedUsers.forEach((user, index) => {
    summary += `${index + 1}. **${user.name}**\n   - Correct: ${user.correct}\n   - Wrong: ${user.wrong}\n   - Total Answered: ${user.total}\n\n`;
  });

  await ctx.replyWithMarkdown(summary);
}

module.exports = { pollUploader };
