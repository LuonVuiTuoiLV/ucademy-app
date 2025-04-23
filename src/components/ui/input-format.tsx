import {
  InputAttributes,
  NumericFormat,
  NumericFormatProps,
} from 'react-number-format';

const InputFormatCurrency = (props: NumericFormatProps<InputAttributes>) => {
  return (
    <NumericFormat
      className="flex outline-none h-12 rounded-md px-3 w-full text-sm border border-gray-200 focus:!border-primary transition-all dark:border-opacity-10 bg-white dark:bg-grayDarker font-medium focus-primary"
      thousandSeparator
      placeholder="Nhập giá trị: 50%"
      {...props}
    />
  );
};

export default InputFormatCurrency;
