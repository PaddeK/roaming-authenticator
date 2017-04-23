'use strict';

const
    http = require('http'),
    stringify = require('fast-safe-stringify'),
    HttpServer = http.Server,
    wayfarer = require('wayfarer'),
    methods = ['get', 'put', 'post', 'delete'];

class Server extends HttpServer
{
    /**
     * Create Server instance
     * @param {object} [opts]
     * @param {function} [listener]
     */
    constructor (opts, listener)
    {
        super(listener);

        this._opts = opts || {};
        this._opts.maxSize = this._opts.maxSize || 512 * 1024;
        this._routers = new Map();
        this._middleware = [];

        this.use((req, res, next) => {
            if (req.method === 'POST' || req.method === 'PUT') {
                if (req.headers['content-type'] !== 'application/json') {
                    return res.err(`POST requests must be application/json not ${req.headers['content-type']}`, 415);
                } else if (req.headers['content-length'] > this._opts.maxSize) {
                    return res.err(`${req.headers['content-length']} exceeds maximum size for requests`, 413);
                }
            }
            next();
        });
        this.use((req, res, next) => {
            let body = [];

            if (~~req.headers['content-length'] === 0) {
                return next();
            }

            if ((req.method === 'POST' || req.method === 'PUT') && !req.body) {
                req.on('data', chunk => {
                    if (chunk.length > this._opts.maxSize || Buffer.byteLength(body.join('')) > this._opts.maxSize) {
                        return res.err('Payload size exceeds maxmium body length', 413)
                    }
                    body.push(chunk.toString());
                });

                req.on('end', () => {
                    if (body.length) {
                        try {
                            req.body = JSON.parse(body.join(''));
                        } catch (err) {
                            return res.err('Payload is not valid JSON', 400);
                        }
                    }
                    next();
                });
                return;
            }
            next();

        });
        this.on('request', (req, res) => this._handleReq(req, this._augmentRes(res), this._middleware, this._routers));
    }

    /**
     * Use
     * @param {function|function[]} functions
     * @return {void}
     */
    use (functions)
    {
        this._middleware.push.apply(this._middleware, Array.isArray(functions) ? functions : [functions]);
    }

    /**
     * Router
     * @param {string} namespace
     * @returns {object}
     */
    router (namespace)
    {
        return methods.reduce((r, m) => Object.assign({[m]: (ma, f) => this._addRoute(m, [namespace, ma], f)}, r), {});
    }

    /**
     * Add route
     * @param {string} method
     * @param {string[]} matcher
     * @param {function|function[]} funcs
     * @private
     * @return {void}
     */
    _addRoute (method, matcher, funcs)
    {
        if (!this._routers.has(method)) {
            this._routers.set(method, wayfarer('/_'));
        }

        let route = matcher.join('/').replace(/^\//, '').replace(/\/+/g, '/');
        this._routers.get(method).on(route, (params, req, res) => this._handleReq(req, res, funcs, false, params));
    }

    /**
     * Handle requests
     * @param {object} req
     * @param {object} res
     * @param {function[]} routeList
     * @param {Map|boolean} routers
     * @param {object} [params]
     * @private
     * @return {void}
     */
    _handleReq (req, res, routeList, routers, params) {
        let len, count = 0, lcm = req.method.toLowerCase(),
            next = err => {
                if(err) {
                    return res.err(500);
                }

                if(++count < len) {
                    return setImmediate(() => routeList[count](req, res, next));
                } else if(routers) {
                    try {
                        routers.get(lcm)(req.url.split('?')[0], req, res, next);
                    } catch (err) {
                        return res.err(404);
                    }
                } else {
                    !res.finished && res.end();
                }
            };

        routeList = Array.isArray(routeList) ? routeList : [routeList];
        len = routeList.length;
        req.urlParams = params;

        setImmediate(() => routeList[count](req, res, next));
    }

    /**
     * Augment response
     * @param {object} res
     * @return {object}
     * @private
     */
    _augmentRes (res)
    {
        res.setHeader('content-type', 'application/json');
        //noinspection JSUnusedGlobalSymbols
        return Object.assign(res, {
            send: (content, code) => {
                res.statusCode = ~~code || 200;
                res.end(content ? stringify(content) : '', 'utf8');
            },
            err: (content, code) => {
                res.statusCode = ~~code || ~~content || 500;
                res.statusMessage = http.STATUS_CODES[res.statusCode];
                res.end(content && typeof content !== 'number' ? stringify(content) : '', 'utf8');
            }
        });
    }
}

module.exports = Server;