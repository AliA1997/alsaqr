import { MessagesImagePreview } from "@components/common/Containers";
import { GoBackButton } from "@components/common/IconButtons";
import { User } from "typings";

type Props = {
    sessionUser: User | undefined;
    userToMessageId: string;
    userToMessageUsername: string;
    userToMessageAvatar: string;
    onGoBack: () => void;
};

function MessageHeader({ 
    sessionUser,
    userToMessageId,
    userToMessageUsername,
    userToMessageAvatar,
    onGoBack
 }: Props) {
    return (
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center">
            {userToMessageId && sessionUser ? (
              <>
              <GoBackButton 
                onClick={onGoBack}
              />
              <div className="flex space-x-2">
                  {[
                    sessionUser,
                    { 
                      id: userToMessageId,
                      username: userToMessageUsername,
                      avatar: userToMessageAvatar
                    } as User
                  ].map((user: User, index: number) => (
                      <MessagesImagePreview key={index} user={user} index={index} />
                    ))}
              </div>
              <div className="ml-3">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-50">
                      Direct Message to {userToMessageUsername}
                  </h2>
                  <p className="text-xs text-gray-500">
                      {/* {users.filter(user => user.isOnline).length} online */}
                  </p>
              </div>
              </>
            ) : (
              <>
                <div className="ml-3">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-50">
                      Select a User to Direct Message
                    </h2>
                    <p className="text-xs text-gray-500">
                        {/* {users.filter(user => user.isOnline).length} online */}
                    </p>
                </div>
              </>
            )}
        </div>
    );
}

export default MessageHeader;