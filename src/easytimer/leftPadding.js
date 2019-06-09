function leftPadding (string, padLength, character) {
  let i;
  let characters = '';

  string = typeof string === 'number' ? String(string) : string;

  if (string.length > padLength) {
    return string;
  }

  for (i = 0; i < padLength; i = i + 1) {
    characters += String(character);
  }

  return (characters + string).slice(-characters.length);
}

export default leftPadding;
