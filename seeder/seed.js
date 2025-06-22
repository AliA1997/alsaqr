require('dotenv').config({ path: '../.env.local' });
const { generateRandomTweet, generateRandomUser, generateRandomComment } = require("./faker");
const { seed } = require("./neo4j");

function getRandomEntities(num, entities) {
    let result = [];
    for(let i = 0; i < num; i++) {
        const randomIndex = Math.floor(Math.random() * entities.length);
        const entity = entities[randomIndex];
        result.push(entity);
    }
    return result;
}

async function main() {
    try {
        const fakeUsers = Array.from({ length: 10 }, generateRandomUser);

        const fakeTweets = fakeUsers.flatMap((user) =>
            Array.from({ length: 10 }, () => generateRandomTweet(user.username, user.avatar))
        );
        const randomTweets = getRandomEntities(7, fakeTweets);
        const fakeComments = randomTweets.flatMap((twt) =>
            Array.from({ length: 10 }, () => generateRandomComment(twt.id ,twt.username, twt.profileImg))
        );

        await seed(fakeUsers, fakeTweets, fakeComments);
    } catch (err) {
        console.log("Error:", err);
    } finally {
        console.log("Seeder Job Finished!");
        
    }
}

main()
.then(() => process.exit())
.catch(err => console.log("Main Error:", err));