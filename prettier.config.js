module.exports = {
  importOrder: ["^~/(.*)$", "^[./]"],
  plugins: [require("@trivago/prettier-plugin-sort-imports")],
};
