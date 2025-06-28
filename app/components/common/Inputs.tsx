import { useField, FieldHookConfig, FieldHelperProps, FormikHelpers } from 'formik';

type MyInputProps = {
    label?: string;
    placeholder?: string;
    className?: string;
} & FieldHookConfig<string>;

export function MyInput({ label, ...props }: MyInputProps) {
    const [field, meta] = useField(props.name);

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={props.id || props.name} className="block mb-2 text-sm font-medium">
                    {label}
                </label>
            )}
            <input
                {...field}
                type={props.type || 'text'}
                placeholder={props.placeholder}
                className={`h-12 w-full text-lg outline-none placeholder:text-xl dark:bg-[#000000] ${meta.touched && meta.error ? 'border-red-500 border' : ''
                    } ${props.className || ''}`}
            />
            {meta.touched && meta.error ? (
                <div className="text-red-500 text-sm mt-1">{meta.error}</div>
            ) : null}
        </div>
    );
}

// className="h-24 w-full text-xl outline-none placeholder:text-xl dark:bg-[#000000]"

type FileUploadInputProps = {
    label?: string;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>, helpers: FieldHelperProps<any>) => void;
} & FieldHookConfig<File | null>;

export function FileUploadInput({ label, ...props }: FileUploadInputProps) {
    const [field, meta, helpers] = useField(props);

    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <input
                type="file"
                onChange={e => props.handleFileChange(e, helpers)}
                onBlur={field.onBlur}
                className={`block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          dark:file:bg-blue-900 dark:file:text-blue-100
          dark:hover:file:bg-blue-800
          ${meta.touched && meta.error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {meta.touched && meta.error ? (
                <div className="text-red-500 text-xs mt-1">{meta.error}</div>
            ) : null}
        </div>
    );
}