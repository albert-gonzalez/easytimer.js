function leftPadding (string, padLength, character) {
  let i;
  let characters = '';

  if (string.length > padLength) {
    return string;
  }

  for (i = 0; i < padLength; i = i + 1) {
    characters += String(character);
  }

  return (characters + string).slice(-characters.length);
}

export default leftPadding;
