const { MongoClient } = require("mongodb");
const configs = require('../../config');

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


async function remove_chat(chatId) {
    try {
        const result = await users.deleteOne({ _id: chatId });
        if (result.deletedCount === 1) {
            console.log("Chat removed successfully");
            return true;
        } else {
            console.log("No chat found with the specified ID");
            return false;
        }
    } catch (error) {
        console.error("Error removing chat:", error);
        throw error;
    }
}


module.exports = {
    add_chats,
    get_all_chats,
    remove_chat
};




