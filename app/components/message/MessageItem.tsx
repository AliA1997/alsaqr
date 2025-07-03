import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import TimeAgo from "react-timeago";
import { MessageToDisplay } from "typings";

type Props = {
    loggedInUserId: string;
    messageToDisplay: MessageToDisplay;
};

function MessageItem({ loggedInUserId, messageToDisplay }: Props) {
    return (
        <div
            key={messageToDisplay.message.id}
            className={`flex ${messageToDisplay.message.senderId === loggedInUserId ? 'justify-end' : 'justify-start'}`}
        >
            {!(messageToDisplay.message.senderId === loggedInUserId) && (
                <img
                    src={messageToDisplay.message.senderProfileImg}
                    alt={messageToDisplay.message.senderUsername}
                    className="w-8 h-8 rounded-full mr-2 mt-1"
                />
            )}
            <div className={`max-w-xs md:max-w-md lg:max-w-lg ${(messageToDisplay.message.senderId === loggedInUserId) ? 'flex flex-col items-end' : ''}`}>
                {!(messageToDisplay.message.senderId === loggedInUserId) && (
                    <span className="text-xs font-medium text-gray-700 mb-1">
                        {messageToDisplay.message.text}
                    </span>
                )}
                <div
                    className={`p-3 rounded-lg ${(messageToDisplay.message.senderId === loggedInUserId) ? 'bg-blue-500 text-white' : 'bg-maydan text-white'}`}
                >
                    <p>{messageToDisplay.message.text}</p>
                    {messageToDisplay.message.image && (
                        <img
                            src={messageToDisplay.message.image}
                            alt="img/tweet"
                            className="m-5 ml-0 max-h-60 rounded-lg object-cover shadow-sm"
                        />
                    )}
                </div>
                <TimeAgo
                    className="text-sm text-gray-500"
                    date={convertDateToDisplay(messageToDisplay.message.createdAt)}
                />
            </div>
        </div>
    );
}

export default MessageItem;