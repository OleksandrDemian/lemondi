module.exports = () => {
  return {
    overridePath: ({ path }) => {
      // convert imports to build folder
      return path.replace("src/", "dist/");
    },
  };
};
