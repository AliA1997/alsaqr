import { NextRequest, NextResponse } from "next/server";
import { defineDriver, getUserIdFromSession, write } from "@utils/neo4j/neo4j";
import type { UpdateUserFormDto } from "models/users";
import { getServerSession } from "next-auth";

async function PUT_UPDATE_USER(
    request: NextRequest,
    { params }: { params: { user_id: string } }
) {
    const { values: data }: { values: UpdateUserFormDto } = await request.json();
    const { user_id } = params;
    const userId = user_id as string;

    if (!userId) {
        return new NextResponse("User ID is required for updating your user.", { status: 400 });
    }

    const driver = defineDriver();
    const session = driver.session();

    try {
        const authSessionUserId = await getUserIdFromSession(session);
        if (userId != authSessionUserId) {
            return new NextResponse("Only logged in user can delete themselves.", { status: 400 });   
        }

        await write(
            session,
            `
        MATCH (u:User { id: $userId })
          SET u.username = $username,
            u.avatar = $avatar,
            u.bgThumbnail = $bgThumbnail,
            u.bio = $bio,
            u.firstName = $firstName,
            u.lastName = $lastName,
            u.dateOfBirth = $dateOfBirth,
            u.maritalStatus = $maritalStatus,
            u.hobbies = $hobbies,
            u.religion = $religion,
            u.countryOfOrigin = $countryOfOrigin,
            u.preferredMadhab = $preferredMadhab,
            u.frequentMasjid = $frequentMasjid,
            u.favoriteQuranReciters = $favoriteQuranReciters,
            u.favoriteIslamicScholars = $favoriteIslamicScholars,
            u.islamicStudyTopics = $islamicStudyTopics,
            u.updatedAt = timestamp()
      `,
            {
                userId,
                ...data
            }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ message: "Update User error!", success: false });

    }
}

async function DELETE_USER(
    request: NextRequest,
    { params }: { params: { user_id: string } }
) {
    const { user_id } = params;
    const userId = user_id as string;

    if (!userId) {
        return new NextResponse("User ID is required for following someone", { status: 400 });
    }

    const driver = defineDriver();
    const session = driver.session();

    try {
        await write(
            session,
            `
                MATCH (user: User { id: $userId })
                DETACH DELETE user
            `,
            { userId }
        );

        await write(
            session,
            `
                MATCH (pst: Post { userId: $userId })
                DETACH DELETE pst
      `,
            { userId }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ message: "Delete User error!", success: false });

    }
}

export {
    PUT_UPDATE_USER as PUT,
    DELETE_USER as DELETE
};
