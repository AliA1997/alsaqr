import { FieldHookConfig, useField } from 'formik';
import React from 'react';

type RadioCardProps = {
  label: string;
  description?: string;
  value: string;
  icon?: React.ReactNode;
} & FieldHookConfig<string>;

export const RadioCard = ({
  label,
  description,
  value,
  icon,
  ...props
}: RadioCardProps) => {
  const [field, meta] = useField<string>(props.name);

  return (
    <label
      className={`relative flex cursor-pointer rounded-xl border p-2 shadow-sm focus:outline-none ${
        field.value === value
          ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
      }`}
    >
      <input
        type="radio"
        {...field}
        value={value}
        checked={field.value === value}
        className="sr-only" // Hide the default radio button
        aria-labelledby={`${props.name}-${value}-label`}
      />
      
      <div className="flex flex-1">
        {icon && <div className="mr-3 flex-shrink-0">{icon}</div>}
        
        <div className="flex flex-col">
          <span
            id={`${props.name}-${value}-label`}
            className={`block text-sm font-medium ${
              field.value === value
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {label}
          </span>
          
          {description && (
            <span
              className={`mt-1 flex items-center text-sm ${
                field.value === value
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {description}
            </span>
          )}
        </div>
      </div>
      
      {/* Custom radio indicator */}
      <div
        className={`absolute -top-2 -right-2 h-5 w-5 rounded-full border flex items-center justify-center ${
          field.value === value
            ? 'border-blue-500 bg-blue-500'
            : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'
        }`}
        aria-hidden="true"
      >
        {field.value === value && (
          <div className="h-2 w-2 rounded-full bg-white"></div>
        )}
      </div>
    </label>
  );
};