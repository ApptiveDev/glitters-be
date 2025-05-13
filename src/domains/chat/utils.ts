export function createAuthorNickname(): string {
  return `반짝이 관측자 ${generateRandomDigits(4)}`;
}

export function createRequesterNickname(): string {
  return `반짝이 ${generateRandomDigits(4)}`;
}

function generateRandomDigits(length: number): string {
  return Math.floor(Math.random() * Math.pow(10, length))
  .toString()
  .padStart(length, '0');
}
