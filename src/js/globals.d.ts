export {}; // Ensure it's treated as a module if it has imports/exports

declare global {
  var OAX6: any;
  interface Window {
    OAX6: any;
  }
}
