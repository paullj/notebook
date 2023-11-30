import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from 'y-indexeddb';
import { User } from "./user.svelte";

const YJS_PREFIX = "yjs-notebook-" as const;

class Room {
  private _roomID = "";
  private _document: Y.Doc = $state(new Y.Doc());
  private _provider: WebrtcProvider | null = $state(null);
  private _persistance: IndexeddbPersistence | null = $state(null);
  private _users: Record<string, User> = $state({});

  isConnected = $derived(this._provider?.connected ?? false)
  clientID = $derived(this._document?.clientID.toString() ?? null)

  get awareness() { return this._provider?.awareness; }
  get document() { return this._document; }
  get users() { return this._users; }

  public connect(roomID: string) {
    this._roomID = YJS_PREFIX + roomID;

    this._provider = new WebrtcProvider(this._roomID, this._document);
    // this._persistance = new IndexeddbPersistence(this._roomID, this._document);
    // this._persistance.whenSynced.then(() => {
    //   console.log("IndexedDB synced");
    // });
    this._provider.awareness.on("change", () => this.handleAwarenessChange());
    this._provider?.connect();
  }

  public disconnect() {
    this._provider?.disconnect();
  }

  public setLocalAwareness(user: User) {
    this._provider?.awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color,
      colorLight: user.color
    });
  }

  private handleAwarenessChange() {
    if (this._provider === null) return;
    const newUsers = [...this._provider.awareness.getStates()].reduce(
      (acc, [clientID, { user }]) => {
        acc[clientID.toString()] = new User(user.name, user.color);
        return acc;
      },
      {} as Record<string, User>
    );

    if (newUsers === this._users) return;
    this._users = newUsers;
  };
}

const room = new Room();

export { room };