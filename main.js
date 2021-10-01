const { resolve, basename } = require('path');
const {
  app, Menu, Tray, dialog,
} = require('electron');
const { spawn } = require('child_process');
const fixPath = require('fix-path');
const { storeCreate } = require('./store');

fixPath();
const store = storeCreate();
let mainTray = {};

if (app.dock) {
  app.dock.hide();
}


function render(tray = mainTray) {
  const allApplications = store.get('applications');
  const applications = allApplications ? JSON.parse(allApplications) : [];

  const items = applications.map(({ name, path }) => ({
    label: name,
    submenu: [
      {
        label: 'Open Application',
        click: () => {
          spawn('code', [path], { shell: true });
        },
      },
      {
        label: 'Remove Application',
        click: () => {
          store.set('applications', JSON.stringify(applications.filter(item => item.path !== path)));
          render();
        },
      },
    ],
  }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Add New Application',
      click: () => {
        const result = dialog.showOpenDialog({ properties: ['openDirectory'] });

        if (!result) return;

        const [path] = result;
        const name = basename(path);

        store.set(
          'applications',
          JSON.stringify([
            ...applications,
            {
              path,
              name,
            },
          ]),
        );

        render();
      },
    },
    {
      type: 'separator',
    },
    ...items,
    {
      type: 'separator',
    },
    {
      type: 'normal',
      label: 'Close Tray',
      role: 'quit',
      enabled: true,
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', tray.popUpContextMenu);
}

app.on('ready', () => {
  mainTray = new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'));

  render(mainTray);
});
