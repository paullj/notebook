// Based on ranking system in JIRA. Adapated from https://github.com/acadea/lexorank
const MIN_CHAR = '0' as const;
const MAX_CHAR = 'z' as const;

const MIN_INDEX = index(MIN_CHAR);
const MAX_INDEX = index(MAX_CHAR);

function index(char: string): number {
  return char.charCodeAt(0);
}

function char(index: number): string {
  return String.fromCharCode(index);
}

function getChar(str: string, i: number, defaultChar: number): number {
  if (i >= str.length) {
    return defaultChar;
  }
  return index(str.charAt(i));
}

function mid(prev: number, next: number): number {
  return Math.floor((prev + next) / 2);
}

function insert(prev: string | null, next: string | null): [string, boolean] {
  if (prev === '' || !prev) {
    prev = char(MIN_INDEX);
  }
  if (next === '' || !next) {
    next = char(MAX_INDEX);
  }

  let rank = '';
  let i = 0;

  while (true) {
    const prevChar = getChar(prev, i, MIN_INDEX);
    const nextChar = getChar(next, i, MAX_INDEX);

    if (prevChar === nextChar) {
      rank += char(prevChar);
      i++;
      continue;
    }

    const midChar = mid(prevChar, nextChar);
    if (midChar === prevChar || midChar === nextChar) {
      rank += char(prevChar);
      i++;
      continue;
    }

    rank += char(midChar);
    return [rank, true];
  }
};

export { insert };
