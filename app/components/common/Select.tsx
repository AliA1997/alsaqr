import { FieldHookConfig, useField } from "formik";

type Option = {
  value: string;
  label: string;
};

type SelectProps = FieldHookConfig<string> & {
  label?: string;
  placeholder?: string;
  options: Option[];
};

export function Select({ label, placeholder, options, ...props }: SelectProps) {
  const [field, meta] = useField<string>(props);

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label htmlFor={props.name} className="block mb-2 text-sm font-medium">
          {label}
        </label>
      )}

      <select
        {...field}
        className={`h-12 w-full text-lg outline-none placeholder:text-xl dark:bg-[#000000] border rounded-md px-3 ${
          meta.touched && meta.error ? 'border-red-500' : 'dark:border-gray-700'
        }`}
      >
        {placeholder && (
          <option value="" disabled selected>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </div>
  );
}