import { MessagesImagePreview } from "@components/common/Containers";
import CustomPageLoader from "@components/common/CustomLoader";
import { MessageToDisplay, User } from "typings";
import MessageItem from "./MessageItem";
import { NoRecordsTitle } from "@components/common/Titles";

type Props = {
    loggedInUserId: string | undefined;
    loading: boolean;
    showMessages: boolean;
    messages: MessageToDisplay[];
    noRecordsText: string;
};

function MessageContent({ 
    loggedInUserId,
    loading,
    showMessages,
    messages,
    noRecordsText
 }: Props) {
    return (
        <div className="flex-1 p-4 overflow-y-auto">
            {loading ? (
                <CustomPageLoader title="Loading" /> 
            ) : showMessages && loggedInUserId
                ? messages.map((dirMessage, idx) => (
                    <MessageItem 
                        key={dirMessage.message.id ?? idx}
                        loggedInUserId={loggedInUserId}
                        messageToDisplay={dirMessage}
                    />
                ))
                : <NoRecordsTitle>{noRecordsText}</NoRecordsTitle>}
        </div>
    );
}

export default MessageContent;