/*
 * -----Pytheas-----
 * Copyright(c) 2022 Jossy Jones
 * MIT License
*/

"use strict";

// Dependecies
const Http = require("http");
const Url = require("url");
const StringDecoder = require('string_decoder').StringDecoder;

// Module
const Server = {
    routes: [],
    request: Http.IncomingMessage,
    response: Http.OutgoingMessage,

    createHttpServer: Http.createServer((req, res) => {
        Server.request = req;
        Server.response = res;
        Server.RenderRoutes(Server.routes);
    }),

    handleHandlers: (handler=[])=>{
        let _parsedUrl = Server.request.url && Url.parse(Server.request.url, true);
        if(_parsedUrl){
            let _path = _parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
            let queryStrings = _parsedUrl.query;
            let decoder = new StringDecoder('utf-8');
            let buffer = '';
            Server.request.on("data", (chunk) => {
                buffer += decoder.write(chunk);
            })
            Server.request.on("end", () => {
                buffer += decoder.end();
                Server.response.setHeader("Context-Type", "application/json")
                let [_request, _response] = [{
                    body: JSON.parse(buffer),
                    headers: Server.request.headers,
                    params: queryStrings
                }, {
                    status: (payload = 200) => {
                        Server.response.writeHead(payload);
                        return {
                            send,
                        }
                    },
                    send: (payload) => {
                        Server.response.end(JSON.stringify(payload));
                    },
                    setHeaders: (headers = {}) => {
                        Object.keys(headers).map((name) => {
                            Server.response.setHeader(name, headers[name]);
                        })
                    }
                }
                ];
                let next = () => { };
                [...handler].map(_handler => {
                    _handler(_request, _response, next)
                })
            });
        }
    },

    RenderRoutes: (routes) => {
        routes = typeof (routes) === "object" && routes instanceof Array && routes.length > 0 ? routes : false;
        if (routes) {
            let _parsedUrl = Url.parse(Server.request.url, true);
            let _path = _parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
            let _method = Server.request.method.toLowerCase();
            let route = routes.find(route => ((route.path.replace(/^\/+|\/+$/g, '') === _path) && (route.method.toLowerCase() === _method)));
            if (route) {
                let { handler } = route;
                Server.handleHandlers(handler);
            } else {
                Server.response.writeHead(404);
                Server.response.end("Not found");
            }
        } else {
            Server.response.writeHead(404);
            Server.response.end("Not found");
        }
    },

    Router: () => {
        let setRoutes = (routes) => {
            routes = typeof (routes) === "object" && routes instanceof Array && routes.length > 0 ? [...new Set(routes)] : false;
            if (routes) {
                if (Server.routes) {
                    Server.routes.push(...routes);
                } else {
                    Server.routes = routes;
                }
            } else {
                throw new Error("Routes must be an instance of Array \n Routes received is not of valid type");
            }
        }
        return {
            routes: setRoutes
        }
    },

    listen: (port, listener = () => { }) => {
        Server.createHttpServer.listen(port, () => {
            console.log('\x1b[35m%s\x1b[0m', `The sever is listening on port ${port}`);
            listener();
        })
    },

    use: (handler, any = []) => {
        let _path = typeof handler === "string" ? handler : undefined;
        let _callback = typeof handler === "function" ? handler : typeof any === "function" ? any : false;
        if(_callback){
            Server.handleHandlers(_callback)
        }
        // Server.RenderRoutes(Server.routes)
    },

    init: () => {
        return {
            listen: Server.listen,
            use: Server.use,
            Router: Server.Router,
        }
    },
}

module.exports = Server.init;
