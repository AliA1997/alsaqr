import { MouseEventHandler, useMemo } from "react";

type CommonButtonProps = {
    disabled?: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>
}


type InfoButtonProps = {
    classNames?: string;
} & CommonButtonProps

export function InfoButton({ classNames, disabled, onClick, children }: React.PropsWithChildren<InfoButtonProps>) {
    const buttonClassName = useMemo(() => {
        let defaultClassName = `
            flex
            min-w-[4rem] max-w-[12rem] max-h-[3rem] 
            border px-3 py-1 
            font-bold 
            disabled:opacity-40
            text-xs
            border-none
            text-gray-900
            dark:text-gray-50
            cursor-pointer
        `;
        if(classNames)
            defaultClassName += " " + classNames;

        return defaultClassName;
    }, [classNames])

    return (
        <button
            type='button'
            disabled={disabled}
            onClick={onClick}
            className={buttonClassName}
        >
            {children}
        </button>

    );
}

export function AbsoluteSuccessButton({ children, disabled, onClick, }: React.PropsWithChildren<CommonButtonProps>) {
    return (
        <button
            type='button'
            disabled={disabled}
            onClick={onClick}
            className={`
                min-w-[4rem] max-w-[12rem] max-h-[3rem] border px-3 py-1 
                font-bold 
                text-gray-900
                dark:text-white 
                hover:opacity-60
                bg-green-400
                hover:opacity-90
                disabled:opacity-40
                text-xs
                border-none
                flex
             `}
        >
            {children}
        </button>
    );
}

export function AbsoluteDangerButton({ children, disabled, onClick }: React.PropsWithChildren<CommonButtonProps>) {

    return (
        <button
            type='button'
            disabled={disabled}
            onClick={onClick}
            className={`
                min-w-[4rem] max-w-[12rem] max-h-[3rem] border px-3 py-1 
                font-bold 
                text-gray-900
                dark:text-white 
                hover:opacity-90
                bg-red-400
                disabled:opacity-40
                text-xs
                border-none
                flex
            `}
        >
            {children}
        </button>
    );
}
