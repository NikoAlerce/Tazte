const SENSITIVE_KEYS = ["address", "wallet", "walletAddress", "twitter", "twitter_handle"];

function redact(value) {
  if (typeof value !== "string") {
    return value;
  }

  if (value.length <= 10) {
    return "[redacted]";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function sanitizeContext(context) {
  if (!context || typeof context !== "object") {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => {
      if (SENSITIVE_KEYS.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey.toLowerCase()))) {
        return [key, redact(String(value))];
      }
      return [key, value];
    })
  );
}

export function logInfo(message, context) {
  console.info(message, sanitizeContext(context));
}

export function logWarn(message, context) {
  console.warn(message, sanitizeContext(context));
}

export function logError(message, context) {
  console.error(message, sanitizeContext(context));
}
