const builder = require('directory-obfuscator')

let dirs = [
    'img',
    'login',
    'process',
    'public'
]


builder.obfuscate('index.js', dirs);