const cache = new Map();

export function fetchWithSuspense(key, fetcher) {
  if (!cache.has(key)) {
    let status = 'pending';
    let result;
    const promise = fetcher().then(
      (res) => {
        status = 'success';
        result = res;
      },
      (err) => {
        status = 'error';
        result = err;
      }
    );
    cache.set(key, { status, result, promise });
    throw promise;
  }

  const record = cache.get(key);
  if (record.status === 'pending') {
    throw record.promise;
  }
  if (record.status === 'error') {
    throw record.result;
  }
  return record.result;
}
