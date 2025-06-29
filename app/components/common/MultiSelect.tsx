import { FieldHookConfig, useField } from "formik";
import { useState } from "react";

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = FieldHookConfig<string[]> & {
  label?: string;
  placeholder?: string;
  options: Option[];
};

export function MultiSelect({ label, placeholder, options, ...props }: MultiSelectProps) {
  const [field, meta, helpers] = useField<string[]>(props.name);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newOption = { value: inputValue, label: inputValue };
      if (!field.value.some(opt => opt === newOption.value)) {
        helpers.setValue([...field.value, newOption.value]);
      }
      setInputValue('');
    }

    if (e.key === 'Backspace' && !inputValue && field.value.length > 0) {
      helpers.setValue(field.value.slice(0, -1));
    }
  };

  const removeOption = (optionToRemove: string) => {
    helpers.setValue(field.value.filter(option => option !== optionToRemove));
  };

  const filteredOptions = options.filter(
    option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !field.value.includes(option.value)
  );

  return (
    <div className="space-y-2 relative">
      {label && (
        <label htmlFor={props.name} className="block text-md font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-2 p-2 min-h-8 w-full border rounded-md dark:bg-[#000000] dark:border-gray-700">
        {/* Selected options */}
        {field.value.map(selectedValue => {
          const selectedOption = options.find(opt => opt.value === selectedValue) || {
            value: selectedValue,
            label: selectedValue,
          };
          return (
            <div
              key={selectedValue}
              className="flex items-center px-2 bg-blue-100 dark:bg-blue-900 rounded-full text-md"
            >
              {selectedOption.label}
              <button
                type="button"
                onClick={() => removeOption(selectedValue)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
              >
                ×
              </button>
            </div>
          );
        })}

        {/* Input for new options */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type and press enter..."}
          className="flex-1 min-w-[100px] text-xl outline-none placeholder:text-xl dark:bg-[#000000]"
        />
      </div>

      {/* Dropdown with suggestions */}
      {inputValue && filteredOptions.length > 0 && (
        <div className="absolute left-0 bottom-0 mt-1 w-full z-[9999] border bg-[#FFFFFF] rounded-md shadow-lg dark:bg-[#000000] dark:border-gray-700">
          {filteredOptions.slice(0, 6).map(option => (
            <div
              key={option.value}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => {
                if (!field.value.includes(option.value)) {
                  helpers.setValue([...field.value, option.value]);
                }
                setInputValue('');
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm">{meta.error}</div>
      )}
    </div>
  );
}