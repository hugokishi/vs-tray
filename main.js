const { join, resolve, basename } = require("path");
const { app, Menu, Tray, dialog } = require("electron");
const Separator = require("./layouts/separator");
const { Docker } = require("node-docker-api");

const Close = require("./layouts/close");
const { spawn } = require("child_process");
const fixPath = require("fix-path");
const {
  removeApplication,
  setApplication,
} = require("./store/applicationStore");

const { storeCreate } = require("./store");
const path = require("path");

fixPath();
const store = storeCreate();
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

let mainTray = {};

const assetsDirectory = join(__dirname, "assets");

if (app.dock) {
  app.dock.hide();
}

async function render(tray = mainTray) {
  const allApplications = store.get("applications");
  const applications = allApplications ? JSON.parse(allApplications) : [];
  const containers = await docker.container.list({ all: true });

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

  const dockerItems = containers.map((container, index) => ({
    type: "normal",
    label: `${container.data.Image}`,
    icon: join(
      assetsDirectory,
      `${container.data.State === "running" ? "online" : "offline"}.png`
    ),
    click: async () => {
      const containerIsRunning = container.data.State === "running";

      containerIsRunning ? await container.stop() : await container.start();

      render();
    },
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
    {
      label: "Docker Containers",
      submenu: [
        {
          label: "Refresh Container Status",
          click: () => {
            render();
          },
        },
        Separator,
        ...dockerItems,
      ],
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
