function printError(msg) {
  const p = document.createElement('p');
  p.style.color = '#f00';
  p.textContent = msg;
  document.body.append(p);
}
