async function inspectParams() {
  const res = await fetch('https://app.cardapioweb.com/assets/index-CVhO1mfm.js');
  const code = await res.text();
  const idx = code.indexOf('/api/menu/company/categories');
  console.log(code.slice(idx - 400, idx + 100));
}
inspectParams().catch(console.error);
