const { storeCreate } = require("./index");

const store = storeCreate();

module.exports = {
  setApplication(newApplication, applications) {
    return store.set(
      "applications",
      JSON.stringify([
        ...applications,
        {
          path: newApplication.path,
          name: newApplication.name,
        },
      ])
    );
  },

  removeApplication(applications, path) {
    return store.set(
      "applications",
      JSON.stringify(applications.filter((item) => item.path !== path))
    );
  },
};
