import {
  InputAttributes,
  NumericFormat,
  NumericFormatProps,
} from 'react-number-format';

export const InputFormatCurrency = (
  props: NumericFormatProps<InputAttributes>,
) => {
  return (
    <NumericFormat
      thousandSeparator
      className="focus-primary flex h-12 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-medium outline-none transition-all focus:!border-primary disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-opacity-10 dark:bg-grayDarker dark:disabled:bg-grayDarkest"
      {...props}
    />
  );
};
