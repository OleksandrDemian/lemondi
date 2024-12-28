type TListener = {
  events: string[];
  fn: (event: string) => void;
};
export const listeners: TListener[] = [];

export const addAppListener = (l: TListener) => {
  listeners.push(l);

  return () => {
    const index = listeners.findIndex((listener) => listener === l);
    listeners.splice(index, 1);
  }
};

export const triggerAppEvent = (event: string) => {
  for (const listener of listeners) {
    if (listener.events.includes(event)) {
      listener.fn(event);
    }
  }
};
