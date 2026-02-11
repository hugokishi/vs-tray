const Store = require("electron-store");

module.exports = {
  storeCreate() {
    const schema = {
      applications: {
        type: "string",
      },
      initialLoadDone: {
        type: "boolean",
        default: false,
      },
    };

    const store = new Store({ schema });

    return store;
  },
};
