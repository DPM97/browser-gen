const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const Send = require('../public/sender.js')
const ProxyLogic = require('./proxylogic.js')
const app = require('electron').remote.app

class Task {
    constructor(taskData) {
        this.taskData = taskData
        this.id = taskData.id;
        this.status = taskData.status;
        this.site = taskData.site;
        this.autoFill = taskData.autoFill;
        this.browser = new BrowserWindow({
            width: 1200,
            height: 800,
            allowRunningInsecureContent: true,
            webPreferences: {
                nodeIntegration: false,
                partition: this.id,
                webSecurity: false
            }
        })
        this.proxy = new ProxyLogic(this.id).fetch().split(":");
    }


    start() {
        app.commandLine.appendSwitch('disable-web-security');

        this.proxyy();
        this.stop();
        this.refresh();

        if (this.proxy != '') {
            this.browser.webContents.session.setProxy({
                pacScript: "",
                proxyRules: `http://${this.proxy[0]}:${this.proxy[1]}`
            }, () => {
                this.browser.loadURL(this.site)
            });
        } else {
            this.browser.loadURL(this.site)
        }
        console.log(this.taskData)
        //this.browser.webContents.openDevTools()
        if (this.taskData.autoFill != null) {
            this.auto()
        }
    }

    refresh() {
        ipcRenderer.on('refresh', (event, id) => {
            if (id == this.id) {
                this.browser.reload()
            }
        });

        ipcRenderer.on('refreshAll', (event) => {
            this.browser.reload()
        });

        ipcRenderer.on('deleteAll', (event) => {
            this.browser.close()
        });

        ipcRenderer.on('massLinkChange', (event, link) => {
            console.log(this.browser)
            this.browser.loadURL(link)
        })

        ipcRenderer.on('linkChange', (event, link, id) => {
            if (id == this.id) {
                this.browser.loadURL(link)
            }
        })
    }

    proxyy() {
        let that = this;
        console.log('called')
        app.on('login', function (event, webContents, request, authInfo, callback) {
            console.log('in login stage')
            if (authInfo.isProxy) {
                console.log(authInfo)
                let proxy = `${authInfo.host}:${authInfo.port}`
                if (proxy == `${that.proxy[0]}:${that.proxy[1]}`) {
                    console.log(`${that.proxy[2]}, ${that.proxy[3]}`)
                    callback(`${that.proxy[2]}`, `${that.proxy[3]}`)
                }

            }
        })
    }

    auto() {
        this.browser.webContents.on('did-finish-load', () => {
            console.log('new page?')
            console.log(this.browser.getURL())
            if (this.browser.getURL().includes('/checkouts/') && !this.browser.getURL().includes('previous_step=shipping_method&step=payment_method')) {
                console.log('checkout page')
                this.fillShip();
            } else if (this.browser.getURL().includes('previous_step=shipping_method&step=payment_method')) {
                this.fillPay();
            }
        });
    }

    fillShip() {
        setTimeout(() => {
            this.browser.webContents.executeJavaScript(`document.getElementById("checkout_email").value = '${this.autoFill.email}'`)
            this.browser.webContents.executeJavaScript(`document.getElementById("checkout_shipping_address_first_name").value = '${this.autoFill.name.split(' ')[0]}'`)
            this.browser.webContents.executeJavaScript(`document.getElementById("checkout_shipping_address_last_name").value = '${this.autoFill.name.split(' ')[1]}'`)
            this.browser.webContents.executeJavaScript(`document.getElementById("checkout_shipping_address_address1").value = '${this.autoFill.address}'`)
            this.browser.webContents.executeJavaScript(`document.getElementById("checkout_shipping_address_city").value = '${this.autoFill.city}'`)
            this.browser.webContents.executeJavaScript(`document.getElementById("checkout_shipping_address_country").value = 'United States'`)
            this.browser.webContents.executeJavaScript(`document.getElementById("checkout_shipping_address_province").value = '${this.autoFill.state}'`)
            this.browser.webContents.executeJavaScript(`document.getElementById("checkout_shipping_address_zip").value = '${this.autoFill.zip}'`)
            this.browser.webContents.executeJavaScript(`document.getElementById("checkout_shipping_address_phone").value = '${this.autoFill.phone}'`)
        }, 4000)
    }

    fillPay() {
        setTimeout(() => {
            console.log('fasasd')
            this.browser.webContents.executeJavaScript('document.getElementByClassName("document.getElementsByClassName("card-fields-iframe")[0];')
            this.browser.webContents.executeJavaScript(`document.getElementById("name").value = '${this.autoFill.name}'`)
            //this.browser.webContents.executeJavaScript(`document.getElementById("name").value = '${this.autoFill.name}'`)
            //this.browser.webContents.executeJavaScript(`document.getElementById("expiry").value = '${this.autoFill.exp}'`)
            //this.browser.webContents.executeJavaScript(`document.getElementById("verification_value").value = '${this.autoFill.cvv}'`)
        }, 10000)
    }

    stop() {
        this.browser.on('closed', () => {
            ipcRenderer.removeAllListeners();
            new Send().stopTask(this.id)
            console.log(`${this.id} closed`)
            return new ProxyLogic().stopped(this.proxy);
        });
    }
}

module.exports = Task;