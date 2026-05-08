// Simple component registry for development
// This would typically register components for dynamic loading

const componentRegistry = new Map<string, any>();

export function registerComponent(name: string, component: any): void {
  componentRegistry.set(name, component);
}

export function getComponent(name: string): any {
  return componentRegistry.get(name);
}

export function hasComponent(name: string): boolean {
  return componentRegistry.has(name);
}

// Initialize any default components here
// This is a placeholder for the bones registry system
