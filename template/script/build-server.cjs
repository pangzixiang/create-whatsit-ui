const fs = require('fs');

function build() {
    if (!fs.existsSync('./dist')) {
        fs.mkdirSync('./dist')
    }

    fs.copyFileSync('./server/server.js', './dist/server.js')
    fs.copyFileSync('./server/proxy-config.json', './dist/proxy-config.json')
    fs.copyFileSync('./server/server-options.json', './dist/server-options.json')
    fs.copyFileSync('./server/package.json', './dist/package.json')
    fs.copyFileSync('./server/package-lock.json', './dist/package-lock.json')
}

build();