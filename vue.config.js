module.exports = {
    transpileDependencies: [
        'vuetify'
    ],
    devServer: {
        disableHostCheck: true,
        proxy: {
            '/api/webrtc': {
                target: 'http://localhost:3000',
                changeOrigin: true
            },
            '/': {
                target: 'https://nasv4.huhaorui.com/',
                changeOrigin: true
            },
            '/socket.io': {
                target: 'ws://localhost:3000',
                ws: true,
                changeOrigin: true
            },
        }
    }
}
