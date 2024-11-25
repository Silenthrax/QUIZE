const { MongoClient } = require("mongodb");
const { MONGO_DB } = require("../../../config");

const client = new MongoClient(MONGO_DB);

const db = client.db("QuizBot");
const users = db.collection("users");

async function check_if_user_exists(userid) {
    const user = await users.findOne({ "user_id": userid });
    return user !== null; // Returns true if user exists, false otherwise
}

async function add_user(userid, name) {
    const if_exists = await check_if_user_exists(userid);
    if (!if_exists) {
        await users.insertOne({
            "user_id": userid,
            "name": name
        });
        console.log("User added successfully!");
    } else {
        console.log("User already exists. Skipping insertion.");
    }
}

async function find_user(userid) {
    const user = await users.findOne({ "user_id": userid });
    if (user) {
        console.log("User found:", user);
        return user;
    } else {
        console.log("No user found with the given user_id.");
        return null;
    }
}


async function get_total_users() {
    const userIds = await users.find({}, { projection: { user_id: 1, _id: 0 } }).toArray();
    const userIdList = userIds.map(user => user.user_id); 
    console.log("Retrive of user IDs");
    return userIdList;
}


module.exports = {
    add_user,
    get_total_users
};



