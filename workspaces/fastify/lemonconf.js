module.exports = () => {
  return {
    resolveInjectionTokenPath: (path) => {
      return path.replace("/src/", "/dist/");
    },
  };
};
