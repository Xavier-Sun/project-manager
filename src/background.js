"use strict"

import { app, protocol, BrowserWindow, Menu, shell, ipcMain, dialog } from "electron"
import { createProtocol } from "vue-cli-plugin-electron-builder/lib"
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer"
import Store from "electron-store"
import path from "path"
import fs from "fs"

const installVueDevtoolsOnReady = false
const isDevelopment = process.env.NODE_ENV !== "production"

let mainWindow = null

Store.initRenderer()

Menu.setApplicationMenu(Menu.buildFromTemplate([
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "Documentation",
        click: async () => {
          await shell.openExternal("https://electronjs.org")
        },
      },
      { type: "separator" },
      {
        label: "Show config.json in folder", click() {
          shell.showItemInFolder(path.join(app.getPath("userData"), "config.json"))
        }
      },
    ],
  },
]))

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Project Manager",
    icon: path.join(__static, "favicon.ico"),
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  mainWindow = win

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol("app")
    // Load the index.html when not in development
    win.loadURL("app://./index.html")
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On macOS it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (installVueDevtoolsOnReady && isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit()
      }
    })
  } else {
    process.on("SIGTERM", () => {
      app.quit()
    })
  }
}

ipcMain.on("select-directory", (event, message) => {
  dialog.showOpenDialog(mainWindow, {
    title: "Select a directory...",
    properties: ["openDirectory", "showHiddenFiles"]
  }).then((result) => {
    event.returnValue = result.canceled ? null : result.filePaths[0]
  })
})

function iterateFiles(directory, callback) {
  fs.readdirSync(directory).forEach(name => {
    let targetPath = path.join(directory, name);
    let stat = fs.statSync(targetPath);
    if (stat.isFile()) {
      callback(targetPath);
    } else if (stat.isDirectory()) {
      iterateFiles(targetPath, callback);
    }
  });
}

const LANGUAGES = {
  "Assembly": [,],
  "C": [".c",],
  "C++": [".cc", ".cpp",],
  "C#": [".cs",],
  "CG": [".cginc",],
  "CSS": [".css",],
  "GLSL": [".vert", ".frag",],
  "Go": [".go",],
  "HLSL": [".hlsl",],
  "HTML": [".html",],
  "Ini": [".ini",],
  "JSON": [".json",],
  "Java": [".java",],
  "JavaScript": [".js",],
  "Lua": [".lua",],
  "MATLAB": [".m",],
  "Makefile": [,],
  "Markdown": [".md",],
  "MaxScript": [".maxscript",],
  "Objective-C": [".mm",],
  "Perl": [".pl",],
  "PHP": [".php",],
  "Python": [".py",],
  "R": [".r",],
  "Ruby": [".rb",],
  "Rust": [".rs",],
  "Shaderlab": [".shader",],
  "Shell": [".bat",],
  "SQL": [".sql",],
  "Swift": [".swift",],
  "TypeScript": [".ts",],
  "XML": [".xml",],
};

function getLanguage(targetPath) {
  let extname = path.extname(targetPath);
  for (let language in LANGUAGES) {
    let names = LANGUAGES[language];
    for (let i = 0; i < names.length; ++i) {
      if (extname.toLowerCase() === names[i]) {
        return language;
      }
    }
  }
  return null;
}

ipcMain.on("get-project-languages", (event, message) => {
  let directory = message;
  let languages = [];
  iterateFiles(directory, targetPath => {
    let language = getLanguage(targetPath);
    if (language && languages.indexOf(language) === -1) {
      languages.push(language);
    }
  });
  event.returnValue = languages;
})
