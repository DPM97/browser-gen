const _ = require('underscore')
const app = require('electron').remote.app

class Sender {
    constructor() {

    }

    showMain() {
        if (document.getElementById('main').style.display == "none") {
            document.getElementById('settings').style.display = "none"
            document.getElementById('tasks').style.display = "none"
            document.getElementById('main').style.display = ""
        }
    }

    populateTasks() {
        console.log('called')
        let tasks = store.get('tasks');
        console.log(tasks)
        tasks.map(task => {
            let element = document.getElementById('taskContainer').innerHTML;
            let length = $('.taskContainer > div').length
            console.log(length)
            this.addTask(task, length, element)
        });
    }

    showSettings() {
        if (document.getElementById('settings').style.display == "none") {
            document.getElementById('main').style.display = "none"
            document.getElementById('tasks').style.display = "none"
            document.getElementById('settings').style.display = ""
        }
    }

    showTask() {
        if (document.getElementById('tasks').style.display == "none") {
            document.getElementById('main').style.display = "none"
            document.getElementById('settings').style.display = "none"
            document.getElementById('tasks').style.display = ""
        }
    }

    createTask() {

        //get information from page
        let autoFillData;

        if (document.getElementById("selectProfile").value != 'None') {
            let profiles = store.get('profiles');
            profiles.map(profile => {
                if (profile.profileName == document.getElementById("selectProfile").value) {
                    autoFillData = profile;
                }
            })
        } else {
            autoFillData = null;
        }



        let site = document.getElementById('Site').value

        if (site == '') {
            site = 'http://google.com'
        }

        let length = $('.taskContainer > div').length
        let taskData = {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            status: 'inactive',
            site: site,
            autoFill: autoFillData
        }

        console.log(taskData)

        let element = document.getElementById('taskContainer').innerHTML;
        let tasks = store.get('tasks')
        tasks.push(taskData)
        store.set('tasks', tasks)
        this.addTask(taskData, length, element)
    }

    createProfile() {

        let autoFillData = {
            profileName: '',
            email: '',
            name: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            phone: '',
            card: '',
            exp: '',
            cvv: ''
        }

        autoFillData.profileName = document.getElementById('ProfileName').value
        autoFillData.email = document.getElementById('Email').value
        autoFillData.name = document.getElementById('FullName').value
        autoFillData.address = document.getElementById('Address').value
        autoFillData.city = document.getElementById('City').value
        autoFillData.state = document.getElementById('State').value
        autoFillData.zip = document.getElementById('Zip').value
        autoFillData.phone = document.getElementById('Phone').value
        autoFillData.card = document.getElementById('Card').value
        autoFillData.exp = document.getElementById('Exp').value
        autoFillData.cvv = document.getElementById('CVV').value

        let current = store.get('profiles');

        for (var i = 0; i < current.length; i++) {
            if (autoFillData.profileName == current[i].profileName) {return this.replaceProfile(i, autoFillData)}
        }

        current.push(autoFillData);

        store.set('profiles', current);

        this.populateProfiles(autoFillData.profileName)
    }

    replaceProfile(i, autoFillData) {
        let current = store.get('profiles');

        current[i] = autoFillData;

        store.set('profiles', current)
    }

    showProfiles() {
        let profiles = store.get('profiles');
        profiles.map(profile => {
            this.populateProfiles(profile.profileName)
        })
    }

    deleteProfile() {
        let profiles = store.get('profiles');
        var select = document.getElementById("selectProfile");
        var select1 = document.getElementById("selectFill");
        if (select1.value == 'Profile (new)') {
            return;
        }
        for (var i = 0; i < profiles.length; i++) {
            if (profiles[i].profileName == select1.value) {
                profiles.splice(i, 1);
                store.set('profiles', profiles)
                break;
            }
        }
        select.remove(select.selectedIndex);
        select1.remove(select1.selectedIndex);
    }

    populateProfiles(name) {
        let select = document.getElementById("selectProfile");
        let select1 = document.getElementById("selectFill");
        let option = document.createElement("option");
        let option1 = document.createElement("option");
        option.text = `${name}`;
        option1.text = `${name}`;
        select.add(option);
        select1.add(option1);
    }

    loadProfile() {
        let profiles = store.get('profiles');
        let currentValue = document.getElementById('selectFill').value

        if (currentValue == 'Profile (new)') { return this.fillBlank() }

        profiles.map(profile => {
            if (profile.profileName == currentValue) {
                return this.fillProfile(profile);
            }
        })


    }

    fillProfile(profile) {
        document.getElementById('ProfileName').value = profile.profileName
        document.getElementById('Email').value = profile.email
        document.getElementById('FullName').value = profile.name
        document.getElementById('Address').value = profile.address
        document.getElementById('City').value = profile.city
        document.getElementById('State').value = profile.state
        document.getElementById('Zip').value = profile.zip
        document.getElementById('Phone').value = profile.phone
        document.getElementById('Card').value = profile.card
        document.getElementById('Exp').value = profile.exp
        document.getElementById('CVV').value = profile.cvv
    }

    fillBlank() {
        document.getElementById('ProfileName').value = ''
        document.getElementById('Email').value = ''
        document.getElementById('FullName').value = ''
        document.getElementById('Address').value = ''
        document.getElementById('City').value = ''
        document.getElementById('State').value = ''
        document.getElementById('Zip').value = ''
        document.getElementById('Phone').value = ''
        document.getElementById('Card').value = ''
        document.getElementById('Exp').value = ''
        document.getElementById('CVV').value = ''
    }

    addTask(taskData, length, element) {

        let profileName;

        if (taskData.autoFill != null) {
            profileName = taskData.autoFill.profileName
        } else {
            profileName = 'None'
        }

        let site = taskData.site;

        if (taskData.site.length >= 35) {
            site = site.slice(0, 35)
        }

        document.getElementById('taskContainer').innerHTML = element.concat(`<div class="task" key="${taskData.id}">
        <div style="margin-top: 10px;">

            <div style="width:130px; float:left;">
                <label style="padding-left: 15px; color:white;">${length}</label>
            </div>

            <div style="display:inline-block; width: 440px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color:white;">
                <label>${site}</label>
            </div>
            
            <div style="display:inline-block; width: 224px;">
                <label style="color:white; position: relative; top: -15px;">${profileName}</label>
            </div>

            <div style="display:inline-block; width: 126px; position: relative; top: -17px;">
                <img class="open" id="open" key="${taskData.id}" onClick="start(this)" src="../img/open.png" />
                <img class="reload" id="reload" key="${taskData.id}" onClick="reload(this)" src="../img/reload.png" />
                <img class="link" id="link" key="${taskData.id}" onClick="changeLink(this)" src="../img/link.png" />
                <img class="delete" id="delete" key="${taskData.id}" onClick="deleteItem(this)" src="../img/delete.png" />
            <div>
        </div>
    </div>`)

    }

    stopTask(id) {
        let tasks = store.get('tasks')
        tasks.map(task => {
            if (task.id == id) {
                task.status = 'inactive'
                store.set('tasks', tasks)
            }
        })
    }

    removeTask(id) {
        let container = document.getElementById('taskContainer').innerHTML;
        let taskHTML = document.getElementsByClassName('task');
        for (var i = 0; i < taskHTML.length; i++) {
            if (taskHTML[i].innerHTML.includes(`key="${id}"`)) {
                let element = taskHTML[i].outerHTML;
                container = container.replace(element, '')
                document.getElementById('taskContainer').innerHTML = '';
                this.populateTasks()
            }
        }
    }

    massLinkChange(link) {
        document.getElementById('massChangeLink').value = '';
        let tasks = store.get('tasks')
        tasks.map(task => {
            task.site = link
        })
        store.set('tasks', tasks)
        document.getElementById('taskContainer').innerHTML = ''
        this.populateTasks()
    }

    linkChange(link, id) {
        let tasks = store.get('tasks')
        tasks.map(task => {
            if (task.id == id) {
                task.site = link
                store.set('tasks', tasks)
                document.getElementById('taskContainer').innerHTML = ''
                this.populateTasks()
            }
        })
    }   

    populateProxies() {
        let proxies = document.getElementById("proxy").value.split('\n');;
        console.log(proxies)
        store.set('proxies', proxies)
    }

    fillProxyBox() {
        if (document.getElementById("proxy").value == '' && store.get('proxies') != []) {
            let string = store.get('proxies').join('\n')
            document.getElementById("proxy").value = string;
        }
    }

    close() {
        console.log('closing app')
        app.quit()
    }
}

module.exports = Sender;