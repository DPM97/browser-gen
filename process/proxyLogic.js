
class ProxyLogic {

    constructor(id) {
        this.id = id;
    }

    fetch() {
        let used = store.get('proxiesInUse');
        let proxies = store.get('proxies');
        console.log(`unused`, proxies)

        console.log(`used`, used)

        for (var i = 0; i < proxies.length; i++) {
            console.log(proxies[i].address)
            if (used.includes(proxies[i]) === false) {
                console.log(proxies[i])
                used.push(proxies[i]);
                store.set('proxiesInUse', used);
                console.log(store.get('proxiesInUse'))
                return proxies[i];
            }
        }
        return '';
    }

    stopped(input) {
        let used = store.get('proxiesInUse');
        let proxies = store.get('proxies');

        let proxy = input.join(':');

        console.log(proxy)
        let index = used.indexOf(proxy)


        if (used.includes(proxy)) {
            used.splice(index, 1)
            store.set('proxiesInUse', used)
            console.log(store.get('proxiesInUse'))
        }
    }

}

module.exports = ProxyLogic;