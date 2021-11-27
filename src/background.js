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
  if (message) {
    console.log("No parameters required.");
  }
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

const LANGUAGES = [
  {
    name: "Assembly",
    extensions: [],
  },
  {
    name: "C",
    extensions: [
      ".c",
      ".i",
    ],
  },
  {
    name: "C++",
    extensions: [
      ".cc",
      ".cpp",
      ".cxx",
      ".c++",
      ".hpp",
      ".hh",
      ".hxx",
      ".h++",
      ".h",
      ".ii",
    ],
  },
  {
    name: "C#",
    extensions: [
      ".cs",
      ".csx",
      ".cake",
    ],
  },
  {
    name: "CG",
    extensions: [
      ".cg",
    ],
  },
  {
    name: "CSS",
    extensions: [
      ".css",
    ],
  },
  {
    name: "GLSL",
    extensions: [
      ".vs",
      ".fs",
      ".gs",
      ".comp",
      ".vert",
      ".tesc",
      ".tese",
      ".frag",
      ".geom",
      ".glsl",
    ],
  },
  {
    name: "Go",
    extensions: [
      ".go",
    ],
  },
  {
    name: "HLSL",
    extensions: [
      ".hlsl",
      ".hlsli",
      ".fx",
      ".fxh",
      ".vsh",
      ".psh",
      ".cginc",
      ".compute",
      ".sf",
    ],
  },
  {
    name: "HTML",
    extensions: [
      ".html",
      ".htm",
      ".shtml",
      ".xhtml",
      ".xht",
      ".mdoc",
      ".jsp",
      ".asp",
      ".aspx",
      ".jshtm",
    ],
  },
  {
    name: "Ini",
    extensions: [
      ".ini",
    ],
  },
  {
    name: "JSON",
    extensions: [
      ".json",
      ".bowerrc",
      ".jscsrc",
      ".webmanifest",
      ".js.map",
      ".css.map",
      ".ts.map",
      ".har",
      ".jslintrc",
      ".jsonld",
      ".geojson",
    ],
  },
  {
    name: "Java",
    extensions: [
      ".java",
      ".jav",
    ],
  },
  {
    name: "JavaScript",
    extensions: [
      ".js",
      ".es6",
      ".mjs",
      ".cjs",
      ".pac",
    ],
  },
  {
    name: "Lua",
    extensions: [
      ".lua",
    ],
  },
  {
    name: "MATLAB",
    extensions: [
      ".m",
    ],
  },
  {
    name: "Makefile",
    extensions: [
      ".mak",
      ".mk",
    ],
  },
  {
    name: "Markdown",
    extensions: [
      ".md",
    ],
  },
  {
    name: "MaxScript",
    extensions: [
      ".ms",
      ".mcr",
    ],
  },
  {
    name: "Objective-C",
    extensions: [
      ".m",
      ".mm",
    ],
  },
  {
    name: "Perl",
    extensions: [
      ".pl",
      ".pm",
      ".pod",
      ".t",
      ".PL",
      ".psgi",
    ],
  },
  {
    name: "PHP",
    extensions: [
      ".php",
      ".php4",
      ".php5",
      ".phtml",
      ".ctp",
    ],
  },
  {
    name: "Python",
    extensions: [
      ".py",
      ".rpy",
      ".pyw",
      ".cpy",
      ".gyp",
      ".gypi",
      ".pyi",
      ".ipy",
    ],
  },
  {
    name: "R",
    extensions: [
      ".r",
      ".rhistory",
      ".rprofile",
      ".rt",
    ],
  },
  {
    name: "Ruby",
    extensions: [
      ".rb",
      ".rbx",
      ".rjs",
      ".gemspec",
      ".rake",
      ".ru",
      ".erb",
      ".podspec",
      ".rbi",
    ],
  },
  {
    name: "Rust",
    extensions: [
      ".rs",
    ],
  },
  {
    name: "Shaderlab",
    extensions: [
      ".shader",
    ],
  },
  {
    name: "Shell",
    extensions: [
      ".sh",
      ".bash",
      ".bashrc",
      ".bash_aliases",
      ".bash_profile",
      ".bash_login",
      ".ebuild",
      ".profile",
      ".bash_logout",
      ".xprofile",
      ".xsession",
      ".xsessionrc",
      ".Xsession",
      ".zsh",
      ".zshrc",
      ".zprofile",
      ".zlogin",
      ".zlogout",
      ".zshenv",
      ".zsh-theme",
      ".ksh",
      ".csh",
      ".cshrc",
      ".tcshrc",
      ".yashrc",
      ".yash_profile",
    ],
  },
  {
    name: "SQL",
    extensions: [
      ".sql",
      ".dsql",
    ],
  },
  {
    name: "Swift",
    extensions: [
      ".swift",
    ],
  },
  {
    name: "TypeScript",
    extensions: [
      ".ts",
    ],
  },
  {
    name: "XML",
    extensions: [
      ".xml",
      ".xsd",
      ".ascx",
      ".atom",
      ".axml",
      ".axaml",
      ".bpmn",
      ".cpt",
      ".csl",
      ".csproj",
      ".csproj.user",
      ".dita",
      ".ditamap",
      ".dtd",
      ".ent",
      ".mod",
      ".dtml",
      ".fsproj",
      ".fxml",
      ".iml",
      ".isml",
      ".jmx",
      ".launch",
      ".menu",
      ".mxml",
      ".nuspec",
      ".opml",
      ".owl",
      ".proj",
      ".props",
      ".pt",
      ".publishsettings",
      ".pubxml",
      ".pubxml.user",
      ".rbxlx",
      ".rbxmx",
      ".rdf",
      ".rng",
      ".rss",
      ".shproj",
      ".storyboard",
      ".svg",
      ".targets",
      ".tld",
      ".tmx",
      ".vbproj",
      ".vbproj.user",
      ".vcxproj",
      ".vcxproj.filters",
      ".wsdl",
      ".wxi",
      ".wxl",
      ".wxs",
      ".xaml",
      ".xbl",
      ".xib",
      ".xlf",
      ".xliff",
      ".xpdl",
      ".xul",
      ".xoml",
    ],
  },
]

function getLanguage(targetPath) {
  let extname = path.extname(targetPath);
  for (let i = 0; i < LANGUAGES.length; ++i) {
    let language = LANGUAGES[i];
    for (let j = 0; j < language.extensions.length; ++j) {
      if (extname.toLowerCase() === language.extensions[j]) {
        return language.name;
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
