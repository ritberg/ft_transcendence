export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomNumber(numberList) {
  const listLength = numberList.length;
  const randomIndex = Math.random();
  const randomIntegerIndex = Math.floor(randomIndex * listLength);
  return numberList[randomIntegerIndex];
}
