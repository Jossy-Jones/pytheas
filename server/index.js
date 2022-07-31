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
const Server = {}

Server._routes = [];
Server._request = Http.IncomingMessage;
Server._response = Http.OutgoingMessage;

let createHttpServer = Http.createServer((req, res) => {
    Server._request = req;
    Server._response = res;
    RenderRoutes(Server._routes);
});


let RenderRoutes = (routes) => {
    routes = typeof (routes) === "object" && routes instanceof Array && routes.length > 0 ? routes : false;
    if (routes) {
        let _parsedUrl = Url.parse(Server._request.url, true);
        let _path = _parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
        let _method = Server._request.method.toLowerCase();
        let route = routes.find(route => ((route.path.replace(/^\/+|\/+$/g, '') === _path) && (route.method.toLowerCase() === _method)));
        if (route) {
            let { method, path, handler } = route;
            let decoder = new StringDecoder('utf-8');
            let buffer = '';
            Server._request.on("data", (chunk) => {
                buffer += decoder.write(chunk);
            })
            Server._request.on("end", () => {
                buffer += decoder.end();
                Server._response.setHeader("Context-Type", "application/json")
                let _context = {
                    request: {
                        body: buffer,
                        headers: Server._request.headers,
                        authetication: Server._request.a
                    },
                    response: {
                        status: (payload = 200) => {
                            Server._response.writeHead(payload);
                            return {
                                send,
                            }
                        },
                        send: (payload) => {
                            Server._response.end(JSON.stringify(payload));
                        },
                        setHeaders: (headers = {}) => {
                            Object.keys(headers).map((name) => {
                                Server._response.setHeader(name, headers[name]);
                            })
                        }
                    }
                };
                let next = () => { }
                handler(_context, next);
            });
        } else {
            Server._response.writeHead(404);
            Server._response.end("Not found");
        }
    } else {
        console.log(false);
        Server._response.writeHead(404);
        Server._response.end("Not found");
    }
}

Server.Router = () => {
    let setRoutes = (routes) => {
        routes = typeof (routes) === "object" && routes instanceof Array && routes.length > 0 ? [...new Set(routes)] : false;
        if (routes) {
            if (Server._routes) {
                Server._routes.push(...routes)
                console.log(Server._routes)
            } else {
                Server._routes = routes;
            }
        } else {
            throw new Error("Routes must be an instance of Array \n Routes received is not of valid type");
        }
    }
    return {
        routes: setRoutes
    }
}

Server.listen = (port, listener = () => { }) => {
    createHttpServer.listen(port, () => {
        console.log('\x1b[35m%s\x1b[0m', `The sever is listening on port ${port}`);
        listener();
    })
};

Server.init = ()=>{
    return{
        listen: Server.listen,
        Router: Server.Router,
    }
}

module.exports = Server;
