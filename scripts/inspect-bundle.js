async function inspect() {
  const res = await fetch('https://app.cardapioweb.com/assets/index-CVhO1mfm.js');
  const code = await res.text();
  const idx = code.indexOf('xe.defaults.baseURL');
  if (idx !== -1) {
    console.log(code.slice(idx, idx + 400));
  }
}
inspect().catch(console.error);
