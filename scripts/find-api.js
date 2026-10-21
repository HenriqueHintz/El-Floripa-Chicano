async function findApi() {
  const res = await fetch('https://app.cardapioweb.com/assets/index-CVhO1mfm.js');
  const code = await res.text();
  const baseUrls = code.match(/https?:\/\/[a-zA-Z0-9.-]+\/api[^\s"'\`]*/g) || [];
  console.log('API URLs:', Array.from(new Set(baseUrls)).slice(0, 10));
  
  const v1Matches = code.match(/https?:\/\/[a-zA-Z0-9.-]+[a-zA-Z0-9.\-_/]*v[12]\/[^\s"'\`]*/g) || [];
  console.log('Versioned URLs:', Array.from(new Set(v1Matches)).slice(0, 10));
  
  // Find axios or fetch base URL
  const axiosMatches = code.match(/baseURL:\s*["'`][^"'`]+["'`]/g) || [];
  console.log('Axios baseURL:', axiosMatches);

  // Search for company or menu endpoints
  const matches = code.match(/\/api\/[a-zA-Z0-9\-_\/]+/g) || [];
  console.log('Path endpoints:', Array.from(new Set(matches)).slice(0, 20));
}

findApi().catch(console.error);
