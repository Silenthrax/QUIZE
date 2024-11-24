const { MongoClient } = require("mongodb");
const { configs } = require("../config");

const client = new MongoClient(configs.MONGO_DB);

const db = client.db("QuizBot");
const langs = db.collection("language");



async function add_lang(user_id, lang) {
    try {        
        const result = await langs.updateOne(
            { _id: user_id },
            { $set: { lang } }, 
            { upsert: true }    
        );

        console.log(
            result.upsertedCount > 0
                ? "Language added successfully (new user)."
                : "Language updated successfully."
        );
        return true;
    } catch (error) {
        console.error("Error adding/updating language:", error);
        throw error;
    }
}


async function remove_lang(user_id) {
    try {    
        const result = await langs.deleteOne({ _id: user_id });

        if (result.deletedCount === 1) {
            console.log("Language removed successfully.");
            return true;
        } else {
            console.log("No language found for the specified user_id.");
            return false;
        }
    } catch (error) {
        console.error("Error removing language:", error);
        throw error;
    }
}


async function get_lang(user_id) {
    try {     
        const result = await langs.findOne({ _id: user_id });

        if (result) {
            console.log("Language retrieved successfully:", result.lang);
            return result.lang;
        } else {
            console.log("No language found for the specified user_id.");
            return null;
        }
    } catch (error) {
        console.error("Error retrieving language:", error);
        throw error;
    }
}


module.exports = {
  add_lang,
  remove_lang,
  get_lang
}




  
