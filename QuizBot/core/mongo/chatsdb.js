const { MongoClient } = require("mongodb");
const { configs } = require("../config");

const client = new MongoClient(configs.MONGO_DB);

db = client.db("QuizBot");
chats = db.collection("chats");



async function add_chats(chat) {
    try {
        const result = await chats.insertOne(chat);
        console.log("Chat added successfully:", result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error("Error adding chat:", error);
        throw error;
    }
}


async function get_all_chats() {
    try {
        const allChats = await chats.find({}).toArray();
        console.log("Chats retrieved successfully allChats");
        return allChats;
    } catch (error) {
        console.error("Error retrieving chats:", error);
        throw error;
    }
}


module.exports = {
    add_chats,
    get_all_chats
};




