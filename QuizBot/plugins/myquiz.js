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
    const quizData = await getQuiz(user_id, name);
    console.log(`Quiz Name: ${name}`);
    console.log(quizData);

    if (!Array.isArray(quizData) || quizData.length === 0) {
      await ctx.reply("Bruh, Quiz Not Found!!");
      return;
    }

    for (const quiz of quizData) {
      if (typeof quiz !== "object" || !quiz.question || typeof quiz.options !== "object") {
        console.error("Invalid question or options format:", JSON.stringify(quiz));
        await ctx.reply("Error: Invalid question or options format. Please check the quiz data.");
        continue;
      }

      const question = quiz.question;
      const options = Object.values(quiz.options);

      if (options.length < 2) {
        console.error("Insufficient options:", options);
        await ctx.reply(`Error: At least two options are required for question "${question}".`);
        continue;
      }

      const correctIndex = quiz.correctAnswer - 1;
      if (correctIndex < 0 || correctIndex >= options.length) {
        await ctx.reply(`Error: Correct answer index out of bounds for question "${question}".`);
        continue;
      }

      await ctx.sendPoll(question, options, {
        type: "quiz",
        correct_option_id: correctIndex,
        is_anonymous: false,
        explanation: quiz.explanation || "",
      });

      await new Promise((resolve) => setTimeout(resolve, 60000));
    }

    await summarizeResults(ctx);
  } catch (error) {
    console.error("Error uploading poll:", error);
    await ctx.reply("Failed to upload the poll. Please try again.");
  }
}

bot.on("poll_answer", async (pollAnswerCtx) => {
  const userId = pollAnswerCtx.user.id;
  const userName = `${pollAnswerCtx.user.first_name} ${pollAnswerCtx.user.last_name || ""}`.trim();
  const answerIndex = pollAnswerCtx.option_ids[0];
  const pollId = pollAnswerCtx.poll_id;

  if (!userResponses[userId]) {
    userResponses[userId] = { name: userName, correct: 0, wrong: 0, total: 0 };
  }

  const userScore = userResponses[userId];
  userScore.total++;

  const correctIndex = quizData.find((q) => q.pollId === pollId)?.correctAnswer - 1;

  if (answerIndex === correctIndex) {
    userScore.correct++;
  } else {
    userScore.wrong++;
  }
});

async function summarizeResults(ctx) {
  let summary = "🏆 **Quiz Leaderboard** 🏆\n\n";
  let totalParticipants = Object.keys(userResponses).length;
  summary += `**Total Participants**: ${totalParticipants}\n\n`;

  const sortedUsers = Object.values(userResponses).sort((a, b) => b.correct - a.correct);

  sortedUsers.forEach((user, index) => {
    summary += `${index + 1}. **${user.name}**\n   - Correct: ${user.correct}\n   - Wrong: ${user.wrong}\n   - Total Answered: ${user.total}\n\n`;
  });

  await ctx.replyWithMarkdown(summary);
}

module.exports = { pollUploader };



