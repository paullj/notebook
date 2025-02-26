import { createSubscriber } from 'svelte/reactivity';
import type {
  Query as QueryDef,
  QueryType,
  ReadonlyJSONValue,
  Smash,
  TableSchema,
  TypedView
} from '@rocicorp/zero';
// import { deepClone } from './utils/deepClone';
import { cloneDeep } from 'es-toolkit';
import type { Immutable } from './utils/immutable';
import type { AdvancedQuery } from '@rocicorp/zero/advanced';
import { zero } from '.';

export type QueryStatus = 'unknown' | 'complete';
export type QueryResult<R extends QueryType> = [Smash<R>, QueryStatus];

const defaultSnapshots = {
  singular: [undefined, 'unknown'] as const,
  plural: [[], 'unknown'] as const
};

function getDefaultSnapshot<R extends QueryType>(singular: boolean): QueryResult<R> {
  return (singular ? defaultSnapshots.singular : defaultSnapshots.plural) as QueryResult<R>;
}

class ViewWrapper<T extends TableSchema, R extends QueryType> {
  #view: TypedView<Smash<R>> | undefined;
  #snapshot: QueryResult<R>;
  #subscribe: () => void;

  constructor(
    private query: AdvancedQuery<T, R>,
    private onMaterialized: (view: ViewWrapper<T, R>) => void,
    private onDematerialized: () => void
  ) {
    this.#snapshot = getDefaultSnapshot(query.format.singular);
    // Create a subscriber that manages view lifecycle
    this.#subscribe = createSubscriber((update) => {
      this.#materializeIfNeeded();
      if (this.#view) {
        // Pass the update function to onData so it can notify Svelte of changes
        this.#view.addListener((snap, resultType) => this.#onData(snap, resultType, update));
      }

      // Return cleanup function that will only be called
      // when all effects are destroyed
      return () => {
        this.#view?.destroy();
        this.#view = undefined;
        this.onDematerialized();
      };
    });
  }

  #onData = (snap: Immutable<Smash<R>>, status: QueryStatus, update: () => void) => {

    const data = snap === undefined ? snap : (cloneDeep(snap as ReadonlyJSONValue) as Smash<R>);
    // const data = snap === undefined ? snap : (deepClone(snap as ReadonlyJSONValue) as Smash<R>);
    this.#snapshot = [data, status] as QueryResult<R>;
    // Notify Svelte that the data has changed
    update();
  };

  #materializeIfNeeded() {
    if (!this.#view) {
      this.#view = this.query.materialize();
      this.onMaterialized(this);
    }
  }

  // Used in Svelte components
  get current(): QueryResult<R> {
    // This triggers the subscription tracking
    this.#subscribe();
    return this.#snapshot;
  }
}

class ViewStore {
  #views = new Map<string, ViewWrapper<never, never>>();

  getView<T extends TableSchema, R extends QueryType>(query: AdvancedQuery<T, R>, enabled: boolean = true): ViewWrapper<T, R> {
    if (!enabled) {
      return new ViewWrapper(query, () => { }, () => { });
    }
    const hash = query.hash() + zero.userID;
    let existing = this.#views.get(hash);

    if (!existing) {
      const onMaterialized = (view: ViewWrapper<T, R>) => {
        const lastView = this.#views.get(hash);
        if (lastView && lastView !== view) {
          throw new Error('View already exists');
        }
        this.#views.set(hash, view);
      };
      const onDematerialized = () => {
        this.#views.delete(hash);
      }
      existing = new ViewWrapper(query, onMaterialized, onDematerialized);

      this.#views.set(hash, existing);
    }
    return existing;
  }
}

export const viewStore = new ViewStore();

export class Query<T extends TableSchema, R extends QueryType> {
  data = $state<Smash<R>>(null!);
  status = $state<QueryStatus>(null!);
  #query_impl: AdvancedQuery<T, R>;

  constructor(query: QueryDef<T, R>, enabled: boolean = true) {
    this.#query_impl = query as unknown as AdvancedQuery<T, R>;
    const default_snapshot = getDefaultSnapshot(this.#query_impl.format.singular);
    this.data = default_snapshot[0] as Smash<R>;
    this.status = default_snapshot[1];
    const view = viewStore.getView(this.#query_impl, enabled);

    this.data = view.current[0];
    this.status = view.current[1];

    $effect(() => {
      this.data = view.current[0];
      this.status = view.current[1];
    });
  }
}
