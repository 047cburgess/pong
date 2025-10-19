class ApiAccessor {
  baseRoute: string;
  cache: Map<RequestInfo | URL, { expires: number, resp: Response }>;

  constructor(baseRoute: string) {
    this.baseRoute = baseRoute;
    this.cache = new Map();

    setInterval(this.cleanup.bind(this), 60000);
  }

  async fetch(
    input: RequestInfo | URL,
    force: boolean = false,
    ttl: number = 300
  ) {
    const cache = this.cache.get(input);
    if (!force && cache && Date.now() < cache.expires) {
      return cache.resp;
    }
    const resp = await fetch(this.baseRoute + input);
    this.cache.set(input, { expires: Date.now() + ttl * 1000, resp });
    return resp;
  }

  private cleanup() {
    const now = Date.now();
    for (let [key, val] of this.cache.entries()) {
      if (now > val.expires) {
        this.cache.delete(key);
      }
    };
  }
}

export const API = new ApiAccessor("/api/v1");
