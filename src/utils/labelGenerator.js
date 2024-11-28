// src/utils/labelGenerator.js
export const generateLabels = () => {
  const labels = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < letters.length; i++) {
    labels.push(letters[i]);
  }

  for (let i = 0; i < letters.length; i++) {
    for (let j = 0; j < letters.length; j++) {
      labels.push(letters[i] + letters[j]);
    }
  }

  return labels;
};