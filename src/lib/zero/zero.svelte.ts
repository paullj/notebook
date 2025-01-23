import { Zero as BaseZero, type ZeroOptions, type Schema } from '@rocicorp/zero';

export class Zero<T extends Schema> {
  #current: BaseZero<T> = $state(null!);
  online = $derived(this.#current.online);
  userID = $derived(this.#current.userID);
  #onConnect?: (zero: BaseZero<T>) => void;

  constructor(options: ZeroOptions<T>, onConnect?: (zero: BaseZero<T>) => void) {
    this.#onConnect = onConnect;
    this.connect(options);
  };

  public async connect(options: ZeroOptions<T> | (() => Promise<ZeroOptions<T> | false>)) {
    if (typeof options === 'function') {
      const fetchedOptions = await options();
      if (!fetchedOptions)
        return;
      options = fetchedOptions;
    }
    this.#current = new BaseZero<T>(options);
    this.#onConnect?.(this.#current);
  }

  public async disconnect() {
    await this.#current?.close();
  }

  public get query() {
    return this.#current.query;
  }

  public get mutate() {
    return this.#current.mutate;
  }

  public get mutateBatch() {
    return this.#current.mutateBatch;
  }
}
