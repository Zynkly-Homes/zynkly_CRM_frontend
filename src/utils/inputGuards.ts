// BLOCK e, E, +, - keys globally for number fields
export const blockInvalidNumberKeys = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  const invalid = ["e", "E", "+", "-"];
  if (invalid.includes(e.key)) {
    e.preventDefault();
  }
};

// Allow only digits (for change event)
export const filterToNumbers = (value: string) => {
  return value.replace(/[^0-9]/g, "");
};

// Common handler for numeric inputs
export const handleNumberInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  setFieldValue: (field: string, val: any) => void,
  field: string
) => {
  let filtered = e.target.value.replace(/[^0-9]/g, "");
  setFieldValue(field, filtered === "" ? "" : Number(filtered));
};
