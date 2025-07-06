import { FieldHookConfig, useField } from 'formik';
import React, { useMemo } from 'react';

type CheckboxCardProps = {
  label: string;
  description?: string;
  icon?: React.ReactNode;
} & FieldHookConfig<string>;

const CheckboxCard = ({
  label,
  description,
  icon,
  ...props
}: CheckboxCardProps) => {
  const [field, meta] = useField<boolean>(props.name);
  
  return (
    <label
      className={`relative flex cursor-pointer rounded-xl border p-2 shadow-sm focus:outline-none ${
        field.value
          ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
      }`}
    >
      <input
        type="checkbox"
        {...field}
        value={field.value.toString()}
        checked={field.value}
        className="sr-only cursor-pointer" // Hide the default checkbox
        aria-labelledby={`${props.name}--label`}
      />
      
      <div className="flex flex-1">
        {icon && <div className="mr-3 flex-shrink-0">{icon}</div>}
        
        <div className="flex flex-col">
          <span
            id={`${props.name}-${field.value}-label`}
            className={`block text-sm font-medium ${
              field.value
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {label}
          </span>
          
          {description && (
            <span
              className={`mt-1 flex items-center text-sm ${
                field.value
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {description}
            </span>
          )}
        </div>
      </div>
      
      {/* Custom checkbox indicator */}
      <div
        className={`absolute -top-2 cursor-pointer -right-2 h-5 w-5 rounded-md border flex items-center justify-center ${
          field.value
            ? 'border-blue-500 bg-blue-500'
            : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'
        }`}
        aria-hidden="true"
      >
        {field.value && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </label>
  );
};

export default CheckboxCard;