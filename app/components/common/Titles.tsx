
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