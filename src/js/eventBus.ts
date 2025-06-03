import { reactive } from "vue";

type EventCallback = (payload?: unknown) => void;
interface EventMap {
  [event: string]: EventCallback[];
}

export const EventBus = reactive({
  events: {} as EventMap,

  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },

  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  },

  emit(event: string, payload?: unknown): void {
    console.log("eventBus emit", event, payload);
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(payload));
  },
});
