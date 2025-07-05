import { motion } from "framer-motion";
import { BookmarkIcon, HeartIcon, UploadIcon } from "@heroicons/react/outline";
import { BookmarkIcon as BookmarkFillIcon, HeartIcon as HeartFillIcon } from "@heroicons/react/solid";
import { FilterKeys } from "@stores/index";
import { useRouter } from "next/navigation";

interface CommentIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    numberOfComments: number;
}
interface LikesIconButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
    numberOfLikes: number;
    isLiked: boolean;
}
interface BookmarkIconButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
    isBookmarked: boolean;
}
interface RePostedIconButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
    numberOfRePosts: number;
    isRePosted: boolean;
}
interface AddOrFollowIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isAdded: boolean;
    isFollowing?: boolean;
    filterKey: FilterKeys;
    onIsAlreadyAdded: () => Promise<void> ;
    onIsAlreadyFollowing?: () => Promise<void>;
}

interface GoBackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{}

interface MoreButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    containerClassNames?: string;
}

export function CommentIconButton({ onClick, numberOfComments, disabled }: CommentIconButtonProps) {
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="flex cursor-pointer item-center space-x-3 text-gray-400 hover:text-maydan"
            disabled={disabled}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                />
            </svg>

            <p className="text-center">{numberOfComments}</p>
        </motion.button>
    );
}


export function LikesIconButton({ onClick, numberOfLikes, isLiked, disabled }: LikesIconButtonProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
                flex cursor-pointer item-center space-x-3 
                ${isLiked ? "text-liked" : "text-gray-400"} hover:text-liked`}
            onClick={onClick}
        >
            {isLiked ? <HeartFillIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
            
            <p className="text-center">{numberOfLikes}</p>
        </motion.div>
    );
}

export function RePostedIconButton({ onClick, numberOfRePosts, isRePosted }: RePostedIconButtonProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
            flex cursor-pointer item-center space-x-3 ${isRePosted ? "text-retweet" : "text-gray-400"
                } hover:text-retweet
            `}
            onClick={onClick}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                />
            </svg>

            <p className="text-center">{numberOfRePosts}</p>
        </motion.div>
    );
}

export function BookmarkedIconButton({ onClick, isBookmarked }: BookmarkIconButtonProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              flex cursor-pointer item-center space-x-3 ${isBookmarked ? "text-maydan" : "text-gray-400"
                } hover:text-maydan
            `}
            onClick={onClick}
        >
            {isBookmarked ? (
                <BookmarkFillIcon className="h-5 w-5" />
            ) : (
                <BookmarkIcon className="h-5 w-5" />
            )}
        </motion.div>
    );
}


export function AddOrFollowButton({ isAdded, isFollowing, onIsAlreadyAdded, onIsAlreadyFollowing, filterKey }:AddOrFollowIconButtonProps) {
    
    return (
        <div className='p-1'>

            {isAdded || isFollowing
                ? (
                    <button
                        type='button'
                        onClick={filterKey === FilterKeys.SearchUsers || filterKey === FilterKeys.SearchPosts ? onIsAlreadyAdded : onIsAlreadyFollowing}
                        className={`w-[2.5rem] h-[2.5rem] border rounded-full bg-maydan p-2 hover:bg-[transparent]`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </button>
                )
                : (
                    <button
                        type='button'
                        onClick={filterKey === FilterKeys.SearchUsers || filterKey === FilterKeys.SearchPosts ? onIsAlreadyAdded : onIsAlreadyFollowing}
                        className='w-[2.5rem] h-[2.5rem] border rounded-full p-2 hover:bg-maydan cursor-pointer'
                    >
                        {filterKey === FilterKeys.SearchUsers
                            ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            )
                            : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            )}
                    </button>
                )
            }
        </div>
    );
}


export function GoBackButton(props: GoBackButtonProps) {
    const router = useRouter();
    const handleOnClick = (e: any) => {
        if(props.onClick)
            props.onClick(e);
        else
            router.back()
    };
    
    return (
        <div className="px-4 py-3 mx-2">
            <div
              className="text-2xl font-medium rounded-full text-blue-400  hover:text-blue-300 float-right cursor-pointer items-center"
              onClick={handleOnClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
                />
              </svg>
            </div>
          </div>
    );
}


export function MoreButton({onClick, containerClassNames}: MoreButtonProps) {
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={`
                flex bg-gray-100 p-0 rounded-full cursor-pointer item-center space-x-3 text-gray-400 hover:text-maydan
                ${containerClassNames && containerClassNames}
            `}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
        </motion.button>
    );
}