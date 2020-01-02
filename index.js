const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const express = require('express')
const expressApp = express();
expressApp.use('/api/discord', require('./login/discord.js'));
expressApp.listen(40123, () => {
    console.info('Running oauth server on port 40123');
});
const request = require('request')
const rq = request.defaults({
    gzip: true,
    timeout: 10000
});

if (isDev) require('electron-reload')(__dirname)

let createMainWindow = () => {
    const mainWindow = new BrowserWindow({
        resizable: false,
        width: 1100,
        height: 700,
        show: false,
        frame: false,
        chromeWebSecurity: false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    })
    mainWindow.loadFile(path.join(path.join(__dirname, "/public/main.html")))
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    mainWindow.on('closed', () => {
        setWindow(null)
    })

    ipcMain.on('refresh', (event, id) => {
        mainWindow.webContents.send('refresh', id)
    })

    ipcMain.on('refreshAll', (event) => {
        mainWindow.webContents.send('refreshAll')
    })

    ipcMain.on('deleteAll', (event) => {
        mainWindow.webContents.send('deleteAll')
    })

    ipcMain.on('massLinkChange', (event, link) => {
        console.log('link')
        mainWindow.webContents.send('massLinkChange', link)
    })

    ipcMain.on('linkChange', (event, link, id) => {
        mainWindow.webContents.send('linkChange', link, id)
    })

    if (isDev) mainWindow.webContents.openDevTools()

    return mainWindow
}

function login() {
    global.loginWindow = new BrowserWindow({
        resizable: false,
        width: 1100,
        height: 700,
        webPreferences: {
            webSecurity: false
        },
        chromeWebSecurity: false,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: false
        }
    })

    return initLogin(); //bypass

    global.loginWindow.loadURL(`http://localhost:40123/api/discord/login`, {
        userAgent: 'Chrome'
    })
    global.loginWindow.once('ready-to-show', () => {
        global.loginWindow.show()
        initLogin();
    })
    global.loginWindow.on('closed', () => {
        global.loginWindow = null;
    })
}

function initLogin() {

    global.finishedAuth = false;

    /* check for login via discord */
    var f = setInterval(() => {
        if (global.finishedAuth === true) {
            clearInterval(f)
            return checkUser();
        }
    }, 500);

    async function checkUser() {
        (async() => {
            let window = await init()
            setTimeout(() => {
                window.show();
                global.loginWindow.destroy();
            }, 4000)
        })()
        /*
        console.log('check user called')
        rq({
            method: 'POST',
            url: 'http://apbrowserapi.herokuapp.com/authorize',
            json: true,
            body: {
                'id': global.userInfo.id,
                'access_token': global.discordJSON.access_token
            }
        }, (err, res, body) => {
            if (err) {
                console.error(`Check User Error: ${err}`);
            } else {
                console.log(`Check User Response: ${JSON.stringify(body)}`);
                if (res.body.verified) {
                    (async() => {
                        let window = await init()
                        setTimeout(() => {
                            window.show();
                            global.loginWindow.destroy();
                        }, 4000)
                    })()
                } else {
                    global.loginWindow.webContents.session.clearStorageData()
                    setTimeout(() => {
                        global.loginWindow.loadURL(`http://localhost:40123/api/discord/login`, {
                            userAgent: 'Chrome'
                        })
                        return initLogin();
                    }, 4000)
                }
            }
        })
        */
    }
}

const init = () => {
    const window = createMainWindow()
    return window;
}

app.on('ready', () => {
    init(); //bypass
    login()
})



