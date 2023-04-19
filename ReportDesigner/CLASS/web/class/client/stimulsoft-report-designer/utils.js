function attachStylesheet(path) {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', path);
  document.head.append(link);
}

function getClientLang() {
  return navigator.language.includes('ru') ? 'ru' : 'en';
}

function mergeObjects(source, data) {
  if (!source || typeof source !== 'object') {
    source = {};
  }
  if (!data || typeof data !== 'object') {
    return source;
  }
  for (const key in data) {
    if (!data.hasOwnProperty(key)) {
      continue;
    }
    const value = data[key];
    if (!!value && typeof value === 'object' && !Array.isArray(value)) {
      source[key] = mergeObjects(source[key], value);
    } else {
      source[key] = value;
    }
  }
  return source;
}

function saveAsFile(content, name, type = 'text/plain') {
  const blob = new Blob([String(content)], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', name);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
  return true;
}

