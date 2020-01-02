const express = require('express');
const { ipcRenderer } = require('electron')

const router = express.Router();

const CLIENT_ID = '611038092773818369';
const CLIENT_SECRET = 'nI1Ra7RJUQeM6PIl8Zi-pWcBgcGLlYYB';
const redirect = encodeURIComponent('http://localhost:40123/api/discord/callback');
const utils = require('./utils.js');
const fetch = require('node-fetch');
const btoa = require('btoa');
const path = require('path')

router.get('/login', (req, res) => {
    console.log(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`)
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
});


router.get('/callback', utils.catchAsyncErrors(async (req, res) => {
    global.loginWindow.loadURL('file://' + path.join(__dirname, '/animation.html'))
    if (!req.query.code) {
        global.loginWindow.webContents.session.clearStorageData()
        global.loginWindow.loadURL(`http://localhost:40123/api/discord/login`)
    } 
    const code = req.query.code;
    console.log(code)
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Basic ${creds}`,
            },
        });
    const json = await response.json();
    console.log(json);
    global.discordJSON = json;
    res.redirect(`/?token=${json.access_token}`);
    const response2 = await fetch('http://discordapp.com/api/users/@me', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${json.access_token}`
        }
    })
    const userJson = await response2.json();
    global.userInfo = userJson;
    console.log(userJson)
    global.finishedAuth = true;
}));

module.exports = router;