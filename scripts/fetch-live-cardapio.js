async function fetchLiveCardapio() {
  const url = 'https://integracao.cardapioweb.com/api/menu/company/categories?only_available_for=delivery&origin=catalogo';
  const res = await fetch(url, {
    headers: {
      'Company-ID': '24759',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  console.log('Status:', res.status);
  if (!res.ok) {
    console.error('Failed to fetch:', res.status, await res.text());
    return;
  }
  const data = await res.json();
  console.log('Categories count:', data.length);
  data.forEach(c => {
    console.log(`- ${c.name} (${c.items ? c.items.length : 0} items)`);
  });
  const fs = await import('fs');
  fs.writeFileSync('scripts/live-cardapioweb-menu.json', JSON.stringify(data, null, 2));
  console.log('SUCCESS: Saved to scripts/live-cardapioweb-menu.json!');
}

fetchLiveCardapio().catch(console.error);
