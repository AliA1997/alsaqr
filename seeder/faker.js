const { faker } = require("@faker-js/faker");

const generateRandomImage = () => {
  const images = [ faker.image.animals(), faker.image.people(), faker.image.cats(), faker.image.sports()];
  const randomIdx = Math.floor(Math.random() * images.length);
  return images[randomIdx]
}
const generateRandomUser = () => ({
  id: faker.datatype.uuid(),
  username: faker.internet.userName(),
  bgThumbnail: faker.image.city(),
  avatar: faker.image.people(),
  countryOfOrigin: faker.address.country(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  dateOfBirth: faker.date.past(30, new Date(2000, 0, 1)).toISOString(),
  geoId: faker.address.zipCode(),
  maritalStatus: faker.helpers.arrayElement([
    "single",
    "married",
    "divorced",
    "widowed",
  ]),
  hobbies: faker.helpers.arrayElements(
    ["reading", "traveling", "sports", "cooking", "music", "technology", "joe biden"],
    3
  ),
  preferredMadhab: faker.helpers.arrayElement([
    "Hanafi",
    "Shafi'i",
    "Maliki",
    "Hanbali",
    "Salafi",
  ]),
  frequentMasjid: faker.company.name(),
  favoriteQuranReciters: faker.helpers.arrayElements(
    [faker.name.fullName(), faker.name.fullName(), faker.name.fullName()],
    2
  ),
  favoriteIslamicScholars: faker.helpers.arrayElements(
    [faker.name.fullName(), faker.name.fullName(), faker.name.fullName()],
    2
  ),
  islamicStudyTopics: faker.helpers.arrayElements(
    ["Fiqh", "Aqidah", "Tafsir", "Hadith"],
    2
  )
});

const generateRandomTweet = (username, profileImg) => ({
  id: faker.datatype.uuid(),
  _rev: faker.datatype.uuid(),
  _type: "tweet",
  blockTweet: faker.datatype.boolean(),
  text: faker.lorem.sentence(3),
  username: username,
  profileImg: profileImg,
  image: generateRandomImage(),
});

const generateRandomComment = (tweetId, username, profileImg) => ({
    tweetId: tweetId,
    comments: [
      {
        username: username,
        id: faker.datatype.uuid(),
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        text: faker.lorem.sentence(25),
        profileImg: profileImg,
      },
      // {
      //   "username": "user2",
      //   "id": "comment2",
      //   "createdAt": "2024-06-10T12:05:00Z",
      //   "updatedAt": "2024-06-10T12:05:00Z",
      //   "text": "This is the second comment!",
      //   "profileImg": "http://example.com/user2.jpg"
      // },
      // {
      //   "username": "user3",
      //   "id": "comment3",
      //   "createdAt": "2024-06-10T12:10:00Z",
      //   "updatedAt": "2024-06-10T12:10:00Z",
      //   "text": "This is the third comment!",
      //   "profileImg": "http://example.com/user3.jpg"
      // }
    ]  
})

module.exports = { generateRandomComment, generateRandomUser, generateRandomTweet };
