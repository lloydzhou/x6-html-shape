export function css(e, styles) {
  for (const property in styles) {
    e.style[property] = styles[property];
  }
}

export function forwardEvent(eventType, fromElement, toElement) {
  fromElement.addEventListener(eventType, function (event) {
    toElement.dispatchEvent(new event.constructor(event.type, event));
    event.preventDefault();
    event.stopPropagation();
  });
}
