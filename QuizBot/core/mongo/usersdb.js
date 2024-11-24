const { MongoClient } = require("mongodb");
const { configs } = require("../config");

const client = new MongoClient(configs.MONGO_DB);

db = client.db("QuizBot");
users = db.collection("users");



async function add_users(user) {
    try {
        const result = await users.insertOne(user);
        console.log("user added successfully:", result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error("Error adding users:", error);
        throw error;
    }
}


async function get_all_users() {
    try {
        const allusers = await users.find({}).toArray();
        console.log("Chats retrieved successfully all users");
        return allusers;
    } catch (error) {
        console.error("Error retrieving users:", error);
        throw error;
    }
}


module.exports = {
    add_users,
    get_all_users
};





