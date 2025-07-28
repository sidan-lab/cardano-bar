export const capitalizedFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const snakeToCamelCase = (snake: string): string => {
  return snake
    .split("_") // Split the string by underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(""); // Join the words back together
};
