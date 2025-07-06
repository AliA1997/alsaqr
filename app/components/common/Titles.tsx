
export function PageTitle({ children }: React.PropsWithChildren<any>) {
    return (
        <h1 className="p-5 pb-0 text-xl font-bold">{children}</h1>
    );
}


export function NoRecordsTitle({ children }: React.PropsWithChildren<any>) {
    return (
        <h1 className="pt-5">{children}</h1>
    );
}

interface TagOrLabelProps extends React.ButtonHTMLAttributes<HTMLSpanElement> {
    color?: 'primary' | 'gold' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'
    | "postGradient" | "userGradient" | "communityGradient"
    | "communityDiscussionGradient" | "communityDiscussionGradient" | "communityDiscussionMessageGradient" | "defaultSavedItemGradient";
    size?: 'sm' | 'md' | 'lg';
    rounded?: boolean;
    outlined?: boolean;
}

export function TagOrLabel({
    children,
    color = 'primary',
    size = 'md',
    rounded = false,
    outlined = false,
    className = '',
    ...props
}: TagOrLabelProps) {
    // Base classes
    const baseClasses = 'inline-flex items-center font-medium whitespace-nowrap';

    // Size classes
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    // Color classes
    const colorClasses = {
        primary: {
            bg: 'bg-blue-100',
            text: 'text-maydan',
            border: 'border-blue-300',
        },
        gold: {
            bg: 'bg-yellow-400',
            text: 'text-yellow-900',
            border: 'border-yellow-500',
        },
        secondary: {
            bg: 'bg-purple-100',
            text: 'text-purple-800',
            border: 'border-purple-300',
        },
        success: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
        },
        danger: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
        },
        warning: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
        },
        info: {
            bg: 'bg-cyan-100',
            text: 'text-cyan-800',
            border: 'border-cyan-300',
        },
        neutral: {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            border: 'border-gray-300',
        },
        postGradient: {
            bg: 'bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100',
            text: 'text-indigo-800',
            border: 'border-purple-300',
        },
        userGradient: {
            bg: 'bg-gradient-to-br from-cyan-100 via-blue-50 to-purple-100',
            text: 'text-blue-800',
            border: 'border-blue-300',
        },
        communityGradient: {
            bg: 'bg-gradient-to-tl from-emerald-100 via-teal-100 to-cyan-200',
            text: 'text-teal-800',
            border: 'border-teal-300',
        },
        communityDiscussionGradient: {
            bg: 'bg-gradient-to-r from-amber-50 to-orange-100',
            text: 'text-amber-800',
            border: 'border-amber-300',
        },
        communityDiscussionMessageGradient: {
            bg: 'bg-gradient-to-b from-lime-100 to-white',
            text: 'text-lime-800',
            border: 'border-lime-300',
        },
        defaultSavedItemGradient: {
            bg: 'bg-gradient-to-r from-fuchsia-100 to-rose-100',
            text: 'text-fuchsia-800',
            border: 'border-fuchsia-300',
        }
    };

    // Determine the color variant
    const variant = colorClasses[color];

    // Build the class string
    const classes = [
        baseClasses,
        sizeClasses[size],
        rounded ? 'rounded-full' : 'rounded-md',
        outlined
            ? `border ${variant.border} ${variant.text} bg-transparent`
            : `${variant.bg} ${variant.text} border border-transparent`,
        className,
    ].join(' ');

    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
}