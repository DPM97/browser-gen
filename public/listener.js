const Store = require('electron-store')
const $ = require('jquery')
const { ipcRenderer, app } = require('electron')

const schema = {
    tasks: {
        type: 'array',
        default: []
    },
    profiles: {
        type: 'array',
        default: []
    },
    proxies: {
        type: 'array',
        default: []
    },
    proxiesInUse: {
        type: 'array',
        default: []
    }
};

const store = new Store({
    schema
});

console.log('boof')
let tasks = store.get('tasks');
tasks.map(task => {
    task.status = 'inactive'
})

store.set('tasks', tasks);


const Send = require('./sender.js')
const Task = require('../process/task.js')

document.getElementById('settings').style.display = "none"
document.getElementById('tasks').style.display = "none"

if ($('.taskContainer > div').length == 0) {
    new Send().populateTasks();
}

if (store.get('profiles').length > 0) {
    new Send().showProfiles();
}

new Send().fillProxyBox();



document.getElementById('mainBtn').addEventListener("click", () => {
    new Send().showMain()
});

document.getElementById('settingsBtn').addEventListener("click", () => {
    new Send().showSettings()
});

document.getElementById('taskBtn').addEventListener("click", () => {
    new Send().showTask()
});

document.getElementById('createButton').addEventListener("click", () => {
    let quantity = document.getElementById('quantity').value;
    for (var i = 0; i < quantity; i++) {
        new Send().createTask()
    }
});

document.getElementById('deleteProfile').addEventListener("click", () => {
    new Send().deleteProfile()
});


document.getElementById('createProfileButton').addEventListener("click", () => {
    new Send().createProfile()
});

document.getElementById('saveProxiesButton').addEventListener("click", () => {
    new Send().populateProxies()
});

document.getElementById('close-btn').addEventListener("click", () => {
    new Send().close()
});

document.getElementById('refreshBtn').addEventListener("click", () => {
    ipcRenderer.send('refreshAll')
});

document.getElementById('linkChangeBtn').addEventListener("click", () => {
    //new Send().linkChange();
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
});

document.getElementById('closeLinkChange').addEventListener("click", () => {
    //new Send().linkChange();
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
});

document.getElementById('massLinkChange').addEventListener("click", () => {
    //new Send().linkChange();
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
    ipcRenderer.send('massLinkChange', document.getElementById('massChangeLink').value)
    new Send().massLinkChange(document.getElementById('massChangeLink').value);
});

document.getElementById('deleteAllBtn').addEventListener("click", () => {
    ipcRenderer.send('deleteAll')
});


function loadProfile() {
    new Send().loadProfile()
}

function changeLink(e) {
    console.log(e)
    let id = $(e).attr('key')
    var modal = document.getElementById("myModal1");
    modal.style.display = "block";


    $('#linkChange').on('click', () => {
        console.log(id)
        let link = document.getElementById('changeLink').value
        document.getElementById('changeLink').value = '';
        var modal = document.getElementById("myModal1");
        modal.style.display = "none";
        console.log('id', id)
        console.log('link', link)
        new Send().linkChange(link, id);
        ipcRenderer.send('linkChange', link, id)
        $('#linkChange').off();
    });

    $('#closeLinkChange1').on('click', () => {
        var modal = document.getElementById("myModal1");
        modal.style.display = "none";
        $('#closeLinkChange1').off()
    });
}

function start(e) {
    let id = $(e).attr('key')
    let tasks = store.get('tasks');
    tasks.map(task => {
        if (task.id == id) {
            console.log(task)
            if (task.status == 'inactive') {
                task.status = 'active';
                store.set('tasks', tasks);
                new Task(task).start();
            }
        }
    })
}

function deleteItem(e) {
    let id = $(e).attr('key')
    console.log(id)
    let tasks = store.get('tasks');
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id == id) {
            tasks.splice(i, 1);
            store.set('tasks', tasks)
            new Send().removeTask(id)
        }
    }
}

function reload(e) {
    let id = $(e).attr('key')
    ipcRenderer.send('refresh', id)
}



