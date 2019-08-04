const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    useContentSize: true,
    icon: './lov.ico',
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
}

app.on('ready', createWindow);