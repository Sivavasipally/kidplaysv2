export function runtimeLine(message: string): string {
  return `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} - ${message}`;
}
