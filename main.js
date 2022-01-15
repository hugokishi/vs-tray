const { resolve, basename } = require("path");
const { app, Menu, Tray, dialog } = require("electron");
const Separator = require("./layouts/separator");
const Close = require("./layouts/close");
const { spawn } = require("child_process");
const fixPath = require("fix-path");
const {
  removeApplication,
  setApplication,
} = require("./store/applicationStore");
const { storeCreate } = require("./store");

fixPath();
const store = storeCreate();
let mainTray = {};

if (app.dock) {
  app.dock.hide();
}

function render(tray = mainTray) {
  const allApplications = store.get("applications");
  const applications = allApplications ? JSON.parse(allApplications) : [];

  const items = applications.map(({ name, path }) => ({
    label: name,
    submenu: [
      {
        label: "Open Application",
        click: () => {
          spawn("code", [path], { shell: true });
        },
      },
      {
        label: "Remove Application",
        click: () => {
          removeApplication(applications, path);
          render();
        },
      },
    ],
  }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Add New Application",
      click: () => {
        const result = dialog.showOpenDialog({ properties: ["openDirectory"] });

        if (!result) return;

        const [path] = result;
        const name = basename(path);

        setApplication({ name, path }, applications);

        render();
      },
    },
    Separator,
    {
      label: "Applications",
      submenu: [...items],
      enabled: applications.length > 0 ? true : false,
    },
    Separator,
    Close,
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("click", tray.popUpContextMenu);
}

app.on("ready", () => {
  mainTray = new Tray(resolve(__dirname, "assets", "iconTemplate.png"));

  render(mainTray);
});
