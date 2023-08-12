const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware')
const Connector = require("vertx-http-gateway-js-connector")
const PROXY_CONFIG_JSON = require("./proxy-config.json")
const SERVER_OPTIONS = require("./server-options.json")

const serviceName = SERVER_OPTIONS.serviceName;

const app = express();

app.use(`/${serviceName}`, express.static('static'));

const proxyConfig = PROXY_CONFIG_JSON;

for (const key in proxyConfig) {
    app.use(key, createProxyMiddleware(proxyConfig[key]));
}

const server = app.listen(SERVER_OPTIONS.servicePort, () => {
    console.log(`Service ${serviceName} started at http://localhost:${server.address().port}/${serviceName}`)
    const connector = new Connector({
        listenerHost : SERVER_OPTIONS.gatewayListenerHost,
        listenerPort : SERVER_OPTIONS.gatewayListenerPort,
        listenerSsl : SERVER_OPTIONS.gatewayListenerSsl,
        serviceName : serviceName,
        servicePort : server.address().port,
        serviceHost : SERVER_OPTIONS.serviceHost,
        serviceSsl : SERVER_OPTIONS.serviceSsl,
        instanceNum : SERVER_OPTIONS.gatewayConnectorInstanceNum
    })
    connector.connect();
});