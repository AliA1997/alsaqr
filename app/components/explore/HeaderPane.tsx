
type Props = {
    exploreImage: string;
}
export function HeaderPane({ exploreImage }: Props) {
    return (
        <div className="text-base text-black dark:text-white cursor-pointer flex flex-col items-stretch bg-transparent border-0 box-border list-none m-0 min-h-0 min-w-0 no-underline z-0 p-4 justify-end absolute inset-0">
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl p-4 sm:p-6 md:p-8 lg:p-10 ...">
            </div>
        </div>
    );
}