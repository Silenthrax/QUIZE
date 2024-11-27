const bot = require("../index");
const { getQuiz, getAllQuizNames, removeAllQuizzes } = require("../core/mongo/quizesdb");


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
  await removeAllQuizzes(user_id);  
  await ctx.answerCallbackQuery('All quizzes have been removed.');
  await ctx.editMessageText('All quizzes have been removed successfully!');
});



// ---------------- Poll Function --------------- //
const userResults = {};

const pollFunction = async (ctx, userId, quizName) => {
  try {
    const quizData = await getQuiz(userId, quizName);
    if (!quizData) {
      ctx.reply('Quiz not found.');
      return;
    }

    let correctCount = 0;
    let wrongCount = 0;

    const questions = quizData.map(q => q.question);
    const options = quizData.map(q => q.options);
    const correctAnswers = quizData.map(q => q.correctAnswer);

    let questionIndex = 0;
    const totalQuestions = questions.length;

    const timer = setTimeout(() => {
      ctx.reply('Time is up! No more answers will be accepted.');
      displayResults(correctCount, wrongCount, totalQuestions, userId, ctx);
    }, 60000);

    ctx.reply('Quiz started! You have 1 minute to answer each question.');

    const askQuestion = async () => {
      if (questionIndex < totalQuestions) {
        const question = questions[questionIndex];
        const questionOptions = options[questionIndex];

        let optionsText = 'Options:\n';
        Object.keys(questionOptions).forEach(key => {
          optionsText += `${key}: ${questionOptions[key]}\n`;
        });

        ctx.reply(`Question ${questionIndex + 1}: ${question}\n${optionsText}`);

        const userAnswer = await getUserAnswer();

        if (userAnswer === correctAnswers[questionIndex]) {
          correctCount++;
          ctx.reply('Correct answer!');
        } else {
          wrongCount++;
          ctx.reply('Wrong answer!');
        }

        questionIndex++;
        askQuestion();
      }
    };

    askQuestion();

    function displayResults(correctCount, wrongCount, totalQuestions, userId, ctx) {
      ctx.reply(`Quiz Finished for user ${userId}!\nTotal Questions: ${totalQuestions}\nCorrect Answers: ${correctCount}\nWrong Answers: ${wrongCount}`);

      userResults[userId] = { correctCount, wrongCount };

      const leaderboard = getLeaderboard();
      let leaderboardText = 'Leaderboard (Descending Order):\n';
      leaderboard.forEach((user, index) => {
        leaderboardText += `${index + 1}. User ID: ${user.userId}, Correct Answers: ${user.correctCount}\n`;
      });

      ctx.reply(leaderboardText);
    }

    function getLeaderboard() {
      const leaderboardArray = Object.keys(userResults).map(userId => ({
        userId: userId,
        correctCount: userResults[userId].correctCount
      }));

      return leaderboardArray.sort((a, b) => b.correctCount - a.correctCount);
    }

  } catch (err) {
    console.error('Error in quiz function:', err);
  }
};

async function getUserAnswer() {
  return new Promise(resolve => setTimeout(() => resolve(Math.floor(Math.random() * 4) + 1), 500));
}






module.exports = { pollFunction };

