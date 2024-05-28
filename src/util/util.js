import axios from "axios";

const baseUrl = '//monitor.huhaorui.com'

export function getUrl(url, hostname = location.hostname) {
    if (hostname.indexOf('monitor') !== -1) {
        return `${baseUrl}${url}`
    } else {
        return url;
    }
}

export async function postWithJwt(url, data) {
    if (!url.startsWith("/")) {
        url = `/${url}`
    }
    let jwt = localStorage.getItem("jwt")
    const config = {headers: {"Authorization": jwt}}
    return await axios.post(getUrl(url), data, config)
}



