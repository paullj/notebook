// Based on ranking system in JIRA. Adapated from https://github.com/acadea/lexorank
export class Rank {
  #MIN_CHAR: number;
  #MAX_CHAR: number;

  constructor(min: string = '0', max: string = 'z  ') {
    this.#MIN_CHAR = this.#index(min);
    this.#MAX_CHAR = this.#index(max);
  }

  insert(prev: string | null, next: string | null): [string, boolean] {
    if (prev === '' || !prev) {
      prev = this.#char(this.#MIN_CHAR);
    }
    if (next === '' || !next) {
      next = this.#char(this.#MAX_CHAR);
    }

    let rank = '';
    let i = 0;

    while (true) {
      const prevChar = this.#getChar(prev, i, this.#MIN_CHAR);
      const nextChar = this.#getChar(next, i, this.#MAX_CHAR);

      if (prevChar === nextChar) {
        rank += this.#char(prevChar);
        i++;
        continue;
      }

      const midChar = this.#mid(prevChar, nextChar);
      if (midChar === prevChar || midChar === nextChar) {
        rank += this.#char(prevChar);
        i++;
        continue;
      }

      rank += this.#char(midChar);
      break;
    }

    if (rank >= next) {
      return [prev, false];
    }
    return [rank, true];
  }

  #mid(prev: number, next: number) {
    return Math.floor((prev + next) / 2);
  }

  #getChar(str: string, i: number, defaultChar: number) {
    if (i >= str.length) {
      return defaultChar;
    }
    return this.#index(str.charAt(i));
  }

  #index(char: string) {
    return char.charCodeAt(0);
  }

  #char(byte: number) {
    return String.fromCharCode(byte);
  }

}
