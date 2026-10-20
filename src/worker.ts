interface Env {
  ASSETS: {
    fetch: typeof fetch;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // Handling forms subdomain: forms.buildwithrex.me
    if (host.startsWith('forms.')) {
      if (url.pathname === '/' || url.pathname === '') {
        url.pathname = '/f/flk2026/';
      } else if (
        !url.pathname.startsWith('/_next') &&
        !url.pathname.startsWith('/f/') &&
        !url.pathname.includes('.')
      ) {
        // e.g. /flk2026 -> /f/flk2026/
        const slug = url.pathname.replace(/^\/+|\/+$/g, '');
        url.pathname = `/f/${slug}/`;
      }
    }

    return env.ASSETS.fetch(new Request(url.toString(), request));
  },
};
