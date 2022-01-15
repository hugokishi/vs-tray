const Store = require("electron-store");

module.exports = {
  storeCreate() {
    const schema = {
      applications: {
        type: "string",
      },
    };

    const store = new Store({ schema });

    return store;
  },
};
