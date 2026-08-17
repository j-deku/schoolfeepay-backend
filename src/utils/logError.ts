const logError = (err: unknown) => {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error("Unknown error:", err);
  }
};
