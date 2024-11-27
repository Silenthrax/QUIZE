const { MongoClient } = require("mongodb");
const { MONGO_DB } = require("../../../config");

const client = new MongoClient(MONGO_DB);
const db = client.db("QuizBot");
const quizes = db.collection("quizes");

// -------------- Generate Quiz Name ---------------- //
const generateRandomName = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
};

async function addQuiz(userId, quizData) {
  try {
    const randomName = generateRandomName();
    const user = await quizes.findOne({ _id: userId });

    if (user) {
      await quizes.updateOne(
        { _id: userId },
        { $push: { quizzes: { [randomName]: quizData } } }
      );
    } else {
      const quiz = {
        _id: userId,
        quizzes: [{ [randomName]: quizData }]
      };
      await quizes.insertOne(quiz);
    }

    console.log(`Quiz added successfully for user ${userId} with random name ${randomName}`);
  } catch (err) {
    console.error('Error adding quiz:', err);
  }
}

async function getQuiz(userId, name) {
  try {
    const user = await quizes.findOne({ _id: userId });
    if (user) {
      const quiz = user.quizzes.find(quiz => Object.keys(quiz)[0] === name);
      return quiz ? quiz[name] : null;
    }
    return null;
  } catch (err) {
    console.error('Error retrieving quiz:', err);
    return null;
  }
}

async function deleteQuiz(userId, name) {
  try {
    const result = await quizes.updateOne(
      { _id: userId },
      { $pull: { quizzes: { [name]: { $exists: true } } } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Quiz with random name ${name} deleted successfully for user ${userId}`);
    } else {
      console.log(`No quiz found with the name ${name} for user ${userId}`);
    }
  } catch (err) {
    console.error('Error deleting quiz:', err);
  }
}

async function getAllQuizNames(userId) {
  try {
    const user = await quizes.findOne({ _id: userId });
    if (user) {
      return user.quizzes.map(quiz => Object.keys(quiz)[0]);
    }
    return [];
  } catch (err) {
    console.error('Error retrieving all quiz names:', err);
    return [];
  }
}

async function deleteAllQuizzes(userId) {
  try {
    await quizes.updateOne(
      { _id: userId },
      { $set: { quizzes: [] } }
    );
    console.log(`All quizzes deleted for user ${userId}`);
  } catch (err) {
    console.error('Error deleting all quizzes:', err);
  }
}


module.exports = {
  addQuiz,
  getQuiz,
  deleteQuiz,
  getAllQuizNames,
  deleteAllQuizzes
};






