import { faker } from "@faker-js/faker";
import { extractQryParams } from "@utils/common";
import { getEmailUsername } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";


async function POST(request: NextRequest) {
    const { values: data }: { values: any } = await request.json();

    const checkUserQuery = `MATCH (user:User {email: $email}) return user`;

    // console.log("PROFILE:", profile);
    if (!data?.email) {
        throw new Error("Profile doesn't exist.");
    }
    const driver = defineDriver();
    const session = driver.session();

    //Upsert functionality
    try {
        const user = await read(
            session,
            checkUserQuery,
            {
                email: data.email,
            },
            "user"
        );
        let profileAvatar = '';
        const isDiscordAccount = (data as any)['image_url'] ? (data as any)['image_url'].includes('discord') : false;
        if (typeof (data as any)["picture"] === 'object' && typeof (data as any)["picture"]['data'] === 'object')
            profileAvatar = (data as any)["picture"]['data']['url'];
        else if (isDiscordAccount)
            profileAvatar = (data as any)['image_url'];
        else
            profileAvatar = (data as any)["picture"] ?? '';

        // console.log("Neo4j User:", user);
        if (!user?.length)
            await write(
                session,
                `
                  CREATE (u:User {
                    id: $id,
                    createdAt: $createdAt,
                    updatedAt: $updatedAt,
                    username: $username,
                    countryOfOrigin: $countryOfOrigin,
                    email: $email,
                    firstName: $firstName,
                    lastName: $lastName,
                    phone: $phone,
                    bio: $bio,
                    bgThumbnail: $bgThumbnail,
                    avatar: $avatar,
                    dateOfBirth: $dateOfBirth,
                    geoId: $geoId,
                    maritalStatus: $maritalStatus,
                    religion: $religion,
                    preferredMadhab: $preferredMadhab,
                    hobbies: $hobbies,
                    frequentMasjid: $frequentMasjid,
                    favoriteQuranReciters: $favoriteQuranReciters,
                    favoriteIslamicScholars: $favoriteIslamicScholars,
                    islamicStudyTopics: $islamicStudyTopics,
                    verified: false,
                    isCompleted: false
                  })`,
                {
                    id: faker.datatype.uuid(),
                    createdAt: new Date().toUTCString(),
                    updatedAt: null,
                    username: isDiscordAccount ? (data as any)['global_name'] : getEmailUsername(data?.email),
                    email: data.email,
                    firstName: data?.name ?? '',
                    lastName: '',
                    bio: '',
                    countryOfOrigin: 'United States',
                    phone: null,
                    avatar: profileAvatar,
                    bgThumbnail: faker.image.city(),
                    dateOfBirth: null,
                    geoId: null,
                    maritalStatus: 'Single',
                    preferredMadhab: 'Hanafi',
                    religion: "Muslim",
                    hobbies: [],
                    frequentMasjid: '',
                    favoriteQuranReciters: [],
                    favoriteIslamicScholars: [],
                    islamicStudyTopics: [],
                }
            );
    } catch (error) {
        console.log("Profile Login Error:", error);
    } finally {
        await session.close();
    }

    return NextResponse.json({
        success: true
    });
}

export { POST };