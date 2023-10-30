function kebabToCamel(kebabCaseString) {
  const words = kebabCaseString.split("-");
  const camelCaseWords = words.map((word, index) => {
    if (index === 0) {
      return word;
    } else {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  });
  return camelCaseWords.join("");
}

function convertToNativeType(value) {
  if (typeof value !== 'string') {
    return value; // return the value as is if it's not a string
  }

  if (value === 'true') {
    return true; // convert the string "true" to boolean true
  }

  if (value === 'false') {
    return false; // convert the string "false" to boolean false
  }

  if (!isNaN(value)) {
    return parseFloat(value); // convert numeric strings to numbers
  }

  // if none of the above conditions match, return the string itself
  return value;
}

export { kebabToCamel, convertToNativeType };
