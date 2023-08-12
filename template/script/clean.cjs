const fs = require('fs-extra');

function clean() {
    if (fs.pathExistsSync('./dist')) {
        fs.removeSync('./dist')
    }

    if (fs.pathExistsSync('./server/node_modules')) {
        fs.removeSync('./server/node_modules')
    }
}

clean();