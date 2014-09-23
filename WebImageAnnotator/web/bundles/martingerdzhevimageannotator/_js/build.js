({
    mainConfigFile: 'config.js',
    baseUrl: 'app',
    optimize: "uglify",
    //optimize: "none",
    insertRequire: ['main'],
    name: 'main',
    out: 'terptube.js'
})
