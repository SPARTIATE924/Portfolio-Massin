addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})

const RAW_RSS = 'https://raw.githubusercontent.com/Massin-Aliouche/Portfolio-Massin/main/assets/data/rss.json'

async function handle(request) {
  const url = new URL(request.url)
  if (url.pathname === '/rss' || url.pathname === '/rss.json') {
    try {
      const res = await fetch(RAW_RSS, { cf: { cacheTtl: 300 } })
      const body = await res.text()
      return new Response(body, {
        status: res.status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        }
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: 'fetch_failed' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }
  }

  // default: small health response
  return new Response(JSON.stringify({ ok: true, routes: ['/rss'] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}