const {MongoClient} = require("mongodb")
const { configs } = require("../config")

const client = new MongoClient(configs.MONGO_DB)


const db = client.db("QuizBot")
const users = db.collection("chats")

