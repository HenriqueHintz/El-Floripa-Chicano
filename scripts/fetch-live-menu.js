async function test() {
  const urls = [
    'https://app.cardapioweb.com/api/menu/company/categories?company_id=24759',
    'https://app.cardapioweb.com/api/menu/company/categories?company_slug=elchicano_pocketfloripa',
    'https://app.cardapioweb.com/api/menu/company/categories',
  ];
  for (const url of urls) {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Company-Id': '24759',
        'X-Company-Slug': 'elchicano_pocketfloripa',
        'X-Company-Uuid': '35090edb-2f75-4e98-bf03-74c215bddc2d',
        'Referer': 'https://app.cardapioweb.com/elchicano_pocketfloripa',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log(res.status, url);
    const contentType = res.headers.get('content-type');
    console.log('Content-Type:', contentType);
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data) {
        console.log('SUCCESS! Categories found:', Array.isArray(data) ? data.length : Object.keys(data));
        const fs = await import('fs');
        fs.writeFileSync('scripts/live-cardapioweb-menu.json', JSON.stringify(data, null, 2));
        return;
      }
    }
  }
}

test().catch(console.error);
