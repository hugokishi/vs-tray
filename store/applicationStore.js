const { storeCreate } = require("./index");
const fs = require("fs");
const path = require("path");
const os = require("os");

const store = storeCreate();

module.exports = {
  loadInitialApps() {
    const initialLoadDone = store.get("initialLoadDone");
    if (initialLoadDone) return;

    const elvenPath = path.join(os.homedir(), "Documentos", "Elven");

    if (fs.existsSync(elvenPath)) {
      const files = fs.readdirSync(elvenPath, { withFileTypes: true });
      const apps = files
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => ({
          name: dirent.name,
          path: path.join(elvenPath, dirent.name),
        }));

      if (apps.length > 0) {
        store.set("applications", JSON.stringify(apps));
      }
    }

    store.set("initialLoadDone", true);
  },
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
