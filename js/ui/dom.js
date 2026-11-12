/**
 * Kleine DOM-Helfer. Inhalte werden immer als Text gesetzt (kein innerHTML),
 * damit Daten aus der API nie als HTML ausgeführt werden können.
 */

/**
 * Erstellt ein Element.
 * @example el('button', { class: 'btn', onClick: save }, 'Speichern')
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, value);
  });

  append(node, children);
  return node;
}

function append(node, children) {
  children.flat(Infinity).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
}

/** Ersetzt den gesamten Inhalt eines Elements */
export function render(container, ...children) {
  container.replaceChildren();
  append(container, children);
}
