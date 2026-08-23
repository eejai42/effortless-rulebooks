let _setter = null;

export function registerToast(setter) { _setter = setter; }

export function toast(message, kind = "ok") {
  _setter?.({ message, kind, ts: Date.now() });
  setTimeout(() => _setter?.(null), 4000);
}
