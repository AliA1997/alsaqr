// import { faker } from "@faker-js/faker";
// import { Tweet, User } from "../../typings";
// export const generateRandomUser = (): User => ({
//   id: faker.datatype.uuid(),
//   createdAt: faker.date.past().toISOString(),
//   updatedAt: faker.date.recent().toISOString(),
//   username: faker.internet.userName(),
//   countryOfOrigin: faker.address.country(),
//   email: faker.internet.email(),
//   phone: faker.phone.number(),
//   dateOfBirth: faker.date.past(30, new Date(2000, 0, 1)).toISOString(),
//   geoId: faker.address.zipCode(),
//   maritalStatus: faker.helpers.arrayElement([
//     "single",
//     "married",
//     "divorced",
//     "widowed",
//   ]),
//   hobbies: faker.helpers.arrayElements(
//     ["reading", "traveling", "sports", "cooking", "music"],
//     3
//   ),
//   preferredMadhab: faker.helpers.arrayElement([
//     "Hanafi",
//     "Shafi'i",
//     "Maliki",
//     "Hanbali",
//     "Salafi",
//   ]),
//   frequentMasjid: faker.company.name(),
//   favoriteQuranReciters: faker.helpers.arrayElements(
//     [faker.name.fullName(), faker.name.fullName(), faker.name.fullName()],
//     2
//   ),
//   favoriteIslamicScholars: faker.helpers.arrayElements(
//     [faker.name.fullName(), faker.name.fullName(), faker.name.fullName()],
//     2
//   ),
//   islamicStudyTopics: faker.helpers.arrayElements(
//     ["Fiqh", "Aqidah", "Tafsir", "Hadith"],
//     2
//   ),
// });

// export const generateRandomTweet = (username: string): Tweet => ({
//   id: faker.datatype.uuid(),
//   createdAt: faker.date.past().toISOString(),
//   updatedAt: faker.date.recent().toISOString(),
//   _rev: faker.datatype.uuid(),
//   _type: "tweet",
//   blockTweet: faker.datatype.boolean(),
//   text: faker.lorem.sentence(),
//   username: username,
//   profileImg: faker.image.avatar(),
//   image: faker.image.imageUrl(),
// });
