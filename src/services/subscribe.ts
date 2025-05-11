import { Event, Filter, SimplePool } from "nostr-tools";
export class Subscribe {
  private pool: SimplePool;

  constructor() {
    this.pool = new SimplePool();
  }

  async query(urls: string[], filter: Filter, onevent?: (evt: Event) => void) {
    return await new Promise<Event[]>((resolve) => {
      const events: Event[] = [];
      const sub = this.pool.subscribe(urls, filter, {
        onevent(evt) {
          onevent?.(evt);
          events.push(evt);
        },
        oneose: () => {
          sub.close();
          resolve(events.sort((a, b) => b.created_at - a.created_at));
        },
        onclose: () => {
          resolve(events.sort((a, b) => b.created_at - a.created_at));
        },
      });
    });
  }

  destroy(relays: string[]) {
    this.pool.close(relays);
  }
}
