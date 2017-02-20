"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const PARAMS_PREFIX = 'params_';
const ROUTE_PREFIX = 'route_';
const ACTION_TYPES = {
    HEAD: 'head',
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    OPTIONS: 'options',
    ALL: 'all'
};
function Controller(path, ...middlewares) {
    return function (target) {
        const proto = target.prototype;
        const protos = Object.getOwnPropertyNames(proto);
        target.$path = path;
        proto.$routes = [];
        for (const prop of protos) {
            if (prop.indexOf(ROUTE_PREFIX) === 0) {
                const route = proto[prop];
                proto.$routes.push({
                    method: route.method,
                    url: path + route.path,
                    middleware: middlewares.concat(route.middleware),
                    fnName: prop.substring(ROUTE_PREFIX.length)
                });
            }
        }
        proto.$params = {};
        for (const prop of protos) {
            if (prop.indexOf(PARAMS_PREFIX) === 0) {
                const { index, name, fn } = proto[prop];
                if (!proto.$params[name])
                    proto.$params[name] = [];
                proto.$params[name][index] = fn;
            }
        }
    };
}
exports.Controller = Controller;
;
function Route(method, path, ...middleware) {
    return (target, propertyKey, descriptor) => {
        target[`${ROUTE_PREFIX}${propertyKey}`] = { method, path: path || '', middleware };
    };
}
exports.Route = Route;
;
function Get(path, ...middlewares) {
    return Route(ACTION_TYPES.GET, path, ...middlewares);
}
exports.Get = Get;
;
function Post(path, ...middlewares) {
    return Route(ACTION_TYPES.POST, path, ...middlewares);
}
exports.Post = Post;
;
function Put(path, ...middlewares) {
    return Route(ACTION_TYPES.PUT, path, ...middlewares);
}
exports.Put = Put;
;
function Delete(path, ...middlewares) {
    return Route(ACTION_TYPES.DELETE, path, ...middlewares);
}
exports.Delete = Delete;
;
function Body() {
    return function (target, propertyKey, index) {
        target[`${PARAMS_PREFIX}${propertyKey}`] = {
            index,
            name: propertyKey,
            fn: (ctx) => {
                return ctx.request.fields;
            }
        };
    };
}
exports.Body = Body;
function Inject(fn) {
    return function (target, propertyKey, index) {
        target[`${PARAMS_PREFIX}${index}_${propertyKey}`] = {
            index,
            name: propertyKey,
            fn
        };
    };
}
exports.Inject = Inject;
function Ctx() {
    return Inject((ctx) => ctx);
}
exports.Ctx = Ctx;
function Req() {
    return Inject((ctx) => ctx.req);
}
exports.Req = Req;
function File() {
    return Inject((ctx) => {
        if (ctx.request.files.length)
            return ctx.request.files[0];
        return ctx.request.files;
    });
}
exports.File = File;
function Files() {
    return Inject((ctx) => ctx.request.files);
}
exports.Files = Files;
function Param(prop) {
    return Inject((ctx) => {
        if (!prop)
            return ctx.params;
        return ctx.params[prop];
    });
}
exports.Param = Param;
function Params() {
    return Param();
}
exports.Params = Params;
function getArguments(ctrl, fnName, ctx, next) {
    let args = [ctx, next];
    const params = ctrl.prototype.$params[fnName];
    if (params) {
        args = [];
        for (const fn of params) {
            let result;
            if (fn !== undefined)
                result = fn(ctx);
            args.push(result);
        }
    }
    return args;
}
function bindRoutes(routerRoutes, controllers) {
    for (const ctrl of controllers) {
        const routes = ctrl.prototype.$routes;
        for (const { method, url, middleware, fnName } of routes) {
            routerRoutes[method](url, ...middleware, function (ctx, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    const inst = new ctrl();
                    const args = getArguments(ctrl, fnName, ctx, next);
                    const result = inst[fnName](...args);
                    if (result)
                        ctx.body = yield result;
                    return result;
                });
            });
        }
    }
    return routerRoutes;
}
exports.bindRoutes = bindRoutes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxNQUFNLGFBQWEsR0FBVyxTQUFTLENBQUM7QUFDeEMsTUFBTSxZQUFZLEdBQVcsUUFBUSxDQUFDO0FBQ3RDLE1BQU0sWUFBWSxHQUFHO0lBQ25CLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLEtBQUs7SUFDVixJQUFJLEVBQUUsTUFBTTtJQUNaLEdBQUcsRUFBRSxLQUFLO0lBQ1YsTUFBTSxFQUFFLFFBQVE7SUFDaEIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsR0FBRyxFQUFFLEtBQUs7Q0FDWCxDQUFDO0FBRUYsb0JBQTJCLElBQWEsRUFBRSxHQUFHLFdBQXVCO0lBQ2xFLE1BQU0sQ0FBQyxVQUFTLE1BQU07UUFDcEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUMvQixNQUFNLE1BQU0sR0FBSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEQsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFcEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsR0FBRyxDQUFBLENBQUMsTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6QixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ2pCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtvQkFDcEIsR0FBRyxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSTtvQkFDdEIsVUFBVSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxD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TUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBQ3JDLEVBQUUsQ0FBQSxDQUFDLE1BQU0sQ0FBQzt3QkFBQyxHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDO29CQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNoQixDQUFDO2FBQUEsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3RCLENBQUM7QUFkRCxnQ0FjQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBBUkFNU19QUkVGSVg6IHN0cmluZyA9ICdwYXJhbXNfJztcbmNvbnN0IFJPVVRFX1BSRUZJWDogc3RyaW5nID0gJ3JvdXRlXyc7XG5jb25zdCBBQ1RJT05fVFlQRVMgPSB7XG4gIEhFQUQ6ICdoZWFkJyxcbiAgR0VUOiAnZ2V0JyxcbiAgUE9TVDogJ3Bvc3QnLFxuICBQVVQ6ICdwdXQnLFxuICBERUxFVEU6ICdkZWxldGUnLFxuICBPUFRJT05TOiAnb3B0aW9ucycsXG4gIEFMTDogJ2FsbCdcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBDb250cm9sbGVyKHBhdGg/OiBzdHJpbmcsIC4uLm1pZGRsZXdhcmVzOiBGdW5jdGlvbltdKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBjb25zdCBwcm90byA9IHRhcmdldC5wcm90b3R5cGU7XG4gICAgY29uc3QgcHJvdG9zID0gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKTtcbiAgICB0YXJnZXQuJHBhdGggPSBwYXRoO1xuXG4gICAgcHJvdG8uJHJvdXRlcyA9IFtdO1xuICAgIGZvcihjb25zdCBwcm9wIG9mIHByb3Rvcykge1xuICAgICAgaWYocHJvcC5pbmRleE9mKFJPVVRFX1BSRUZJWCkgPT09IDApIHtcbiAgICAgICAgY29uc3Qgcm91dGUgPSBwcm90b1twcm9wXTtcbiAgICAgICAgcHJvdG8uJHJvdXRlcy5wdXNoKHsgXG4gICAgICAgICAgbWV0aG9kOiByb3V0ZS5tZXRob2QsIFxuICAgICAgICAgIHVybDogcGF0aCArIHJvdXRlLnBhdGgsIFxuICAgICAgICAgIG1pZGRsZXdhcmU6IG1pZGRsZXdhcmVzLmNvbmNhdChyb3V0ZS5taWRkbGV3YXJlKSxcbiAgICAgICAgICBmbk5hbWU6IHByb3Auc3Vic3RyaW5nKFJPVVRFX1BSRUZJWC5sZW5ndGgpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHByb3RvLiRwYXJhbXMgPSB7fTtcbiAgICBmb3IoY29uc3QgcHJvcCBvZiBwcm90b3MpIHtcbiAgICAgIGlmKHByb3AuaW5kZXhPZihQQVJBTVNfUFJFRklYKSA9PT0gMCkge1xuICAgICAgICBjb25zdCB7IGluZGV4LCBuYW1lLCBmbiB9ID0gcHJvdG9bcHJvcF07XG4gICAgICAgIGlmKCFwcm90by4kcGFyYW1zW25hbWVdKSBwcm90by4kcGFyYW1zW25hbWVdID0gW107XG4gICAgICAgIHByb3RvLiRwYXJhbXNbbmFtZV1baW5kZXhdID0gZm47XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFJvdXRlKG1ldGhvZDogc3RyaW5nLCBwYXRoPzogc3RyaW5nLCAuLi5taWRkbGV3YXJlOiBGdW5jdGlvbltdKSB7XG4gIHJldHVybiAodGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pID0+IHtcbiAgICB0YXJnZXRbYCR7Uk9VVEVfUFJFRklYfSR7cHJvcGVydHlLZXl9YF0gPSB7bWV0aG9kLCBwYXRoOiBwYXRoIHx8ICcnLCBtaWRkbGV3YXJlfTtcbiAgfTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBHZXQocGF0aD86IHN0cmluZywgLi4ubWlkZGxld2FyZXM6IEZ1bmN0aW9uW10pIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5HRVQsIHBhdGgsIC4uLm1pZGRsZXdhcmVzKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBQb3N0KHBhdGg/OiBzdHJpbmcsIC4uLm1pZGRsZXdhcmVzOiBGdW5jdGlvbltdKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuUE9TVCwgcGF0aCwgLi4ubWlkZGxld2FyZXMpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFB1dChwYXRoPzogc3RyaW5nLCAuLi5taWRkbGV3YXJlczogRnVuY3Rpb25bXSkge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLlBVVCwgcGF0aCwgLi4ubWlkZGxld2FyZXMpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZShwYXRoPzogc3RyaW5nLCAuLi5taWRkbGV3YXJlczogRnVuY3Rpb25bXSkge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLkRFTEVURSwgcGF0aCwgLi4ubWlkZGxld2FyZXMpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEJvZHkoKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZywgaW5kZXg6IG51bWJlcikge1xuICAgIHRhcmdldFtgJHtQQVJBTVNfUFJFRklYfSR7cHJvcGVydHlLZXl9YF0gPSB7XG4gICAgICBpbmRleCxcbiAgICAgIG5hbWU6IHByb3BlcnR5S2V5LFxuICAgICAgZm46IChjdHgpID0+IHtcbiAgICAgICAgcmV0dXJuIGN0eC5yZXF1ZXN0LmZpZWxkcztcbiAgICAgIH1cbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSW5qZWN0KGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZywgaW5kZXg6IG51bWJlcikge1xuICAgIHRhcmdldFtgJHtQQVJBTVNfUFJFRklYfSR7aW5kZXh9XyR7cHJvcGVydHlLZXl9YF0gPSB7XG4gICAgICBpbmRleCxcbiAgICAgIG5hbWU6IHByb3BlcnR5S2V5LFxuICAgICAgZm5cbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ3R4KCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXEoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGaWxlKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IHtcbiAgICBpZihjdHgucmVxdWVzdC5maWxlcy5sZW5ndGgpIHJldHVybiBjdHgucmVxdWVzdC5maWxlc1swXTtcbiAgICByZXR1cm4gY3R4LnJlcXVlc3QuZmlsZXM7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRmlsZXMoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcXVlc3QuZmlsZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUGFyYW0ocHJvcD8pIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiB7XG4gICAgaWYoIXByb3ApIHJldHVybiBjdHgucGFyYW1zO1xuICAgIHJldHVybiBjdHgucGFyYW1zW3Byb3BdO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFBhcmFtcygpIHtcbiAgcmV0dXJuIFBhcmFtKCk7XG59XG5cbmZ1bmN0aW9uIGdldEFyZ3VtZW50cyhjdHJsLCBmbk5hbWUsIGN0eCwgbmV4dCkge1xuICBsZXQgYXJncyA9IFtjdHgsIG5leHRdO1xuICBjb25zdCBwYXJhbXMgPSBjdHJsLnByb3RvdHlwZS4kcGFyYW1zW2ZuTmFtZV07XG5cbiAgaWYocGFyYW1zKSB7XG4gICAgYXJncyA9IFtdO1xuICAgIGZvcihjb25zdCBmbiBvZiBwYXJhbXMpIHtcbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICBpZihmbiAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSBmbihjdHgpO1xuICAgICAgYXJncy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFyZ3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUm91dGVzKHJvdXRlclJvdXRlcywgY29udHJvbGxlcnMpIHtcbiAgZm9yKGNvbnN0IGN0cmwgb2YgY29udHJvbGxlcnMpIHtcbiAgICBjb25zdCByb3V0ZXMgPSBjdHJsLnByb3RvdHlwZS4kcm91dGVzO1xuICAgIGZvcihjb25zdCB7IG1ldGhvZCwgdXJsLCBtaWRkbGV3YXJlLCBmbk5hbWUgfSBvZiByb3V0ZXMpIHtcbiAgICAgIHJvdXRlclJvdXRlc1ttZXRob2RdKHVybCwgLi4ubWlkZGxld2FyZSwgYXN5bmMgZnVuY3Rpb24oY3R4LCBuZXh0KSB7XG4gICAgICAgIGNvbnN0IGluc3QgPSBuZXcgY3RybCgpO1xuICAgICAgICBjb25zdCBhcmdzID0gZ2V0QXJndW1lbnRzKGN0cmwsIGZuTmFtZSwgY3R4LCBuZXh0KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gaW5zdFtmbk5hbWVdKC4uLmFyZ3MpO1xuICAgICAgICBpZihyZXN1bHQpIGN0eC5ib2R5ID0gYXdhaXQgcmVzdWx0O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByb3V0ZXJSb3V0ZXM7XG59XG4iXX0=