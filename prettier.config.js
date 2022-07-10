module.exports = {
  importOrder: ["^~/(.*)$", "^[./]"],
  importOrderSeparation: true,
  plugins: [require("@trivago/prettier-plugin-sort-imports")],
};
