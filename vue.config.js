module.exports = {
    transpileDependencies: [
        'vuetify'
    ],
    devServer: {
        disableHostCheck: true,
        proxy: {
            '/send': {
                target: 'http://127.0.0.1:7799/',
                changeOrigin: true
            },
            '/receive': {
                target: 'http://127.0.0.1:7799/',
                changeOrigin: true
            },
            '/': {
                target: 'https://nasv4.huhaorui.com/',
                changeOrigin: true
            }
        }
    }
}
