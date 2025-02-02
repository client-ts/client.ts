# Client.ts

*Redux Toolkit-inspired HTTP Client*

`client.ts` is a lightweight HTTP client designed with a similar principle of Redux, in which, it is a single source of 
truth for all your HTTP request methods. It's heavily designed to work with Typescript, and uses `fetch` internally, 
but can be customized to use another library, like Axios.

```ts
import {createClient} from "./builder/createClient";
import {createRoute} from "./builder/route";
const client = createClient("https://jsonplaceholder.typicode.com", {
    posts: {
        prefix: "/posts",
        routes: {
            get: createRoute<Post[]>().static("GET /"),
            getById: createRoute<Post>().dynamic((id: string) => `GET /${id}`),
            create: createRoute<Post>().dynamic((name: string) => ({
                route: "POST /",
                body: { name },
                headers: {
                    'X-Authorization': "Hello"
                },
                // Default, but still shown just for example of how you can 
                // change the decoder and encoder.
                encoder: JSON.stringify,
                decoder: JSON.parse,
            }))
        }
    }
})
```
```ts
const {result: posts} = await client.posts.get()
```

## Get Started

To get started, simply add this as a dependency to your project:
```bash
npm i @client.ts/core
```

You can then use the `createClient` function to create a client instance. It requires you to have a `baseUrl` which 
will be prefixed to all routes. We use a `Resource -> Route` structure to define the routes, which means, that you 
should follow the following structure:
```ts
createClient("baseUrl", {
    resource: {
        prefix: "/resource", // Optional,
        routes: {
        }
    }
})
```

To create a route, there are two approaches to this, a static route, and a dynamic route. A static route is a route 
that simply is just a string with `METHOD /path` which `client.ts` will use to make the request. A dynamic route is 
a route that requires a parameter to be passed to it, which is a function that returns a string. 

Defining a route is simple, you can use the `createRoute` function to create a route, and then use the `static` or 
`dynamic` function to define the route.
```ts
createClient("baseUrl", {
    resource: {
        prefix: "/resource", // Optional,
        routes: {
            get: createRoute<Resource[]>().static("GET /"),
            getById: createRoute<Resource>().dynamic((id: number) => `GET /${id}`)
        }
    }
})
```

You can also reuse the `createRoute` for each resource by storing it as another variable:

```ts
import {createRoute} from "./route";

const {static: createStaticResourceRoute, dynamic: createDynamicResourceRoute} = createRoute<Resource>()
const client = createClient("baseUrl", {
    resource: {
        prefix: "/resource", // Optional,
        routes: {
            // We can't use `createStaticResourceRoute` here, as this demands a different type.
            get: createRoute<Resource[]>().static("GET /"),
            getFirst: createStaticResourceRoute("GET /first"),
            getById: createDynamicResourceRoute((id: number) => `GET /${id}`)
        }
    }
})
```

You can then access them using the `client` object, such as:
```ts
const {result: resources} = await client.resource.get()
const {result: firstResource} = await client.resource.getFirst()
const {result: resourceOne} = await client.resource.getById(1)
```


In addition, you can add `middlewares` and `afterwares` which will allow you to perform actions before, and after the 
request. In the case of `middlewares`, you can modify the request before it is sent, adding headers, and whatever is 
needed for the request.

These are available as both global and resource wide.

```ts
const client = createClient("baseUrl", {
    resource: {
        prefix: "/resource", // Optional,
        routes: {
            // We can't use `createStaticResourceRoute` here, as this demands a different type.
            get: createRoute<Resource[]>().static("GET /"),
            getFirst: createStaticResourceRoute("GET /first"),
            getById: createDynamicResourceRoute((id: number) => `GET /${id}`)
        },
        middlewares: [],
        afterwares: []
    }
}, {
    middlewares: [
        (request) => {
            return {
                ...request,
                path: "/5"
            }
        }
    ],
    // It is important to note that while afterwares may be at the end of the request, it is still before 
    // the promise resolves, so that means it will still block the call.
    afterwares: [
        (request) => {
            console.info(request)
            return request
        }
    ]
})
```

An example of a middleware that adds a header to the request is [`withAuthorization.ts`](src/middlewares/withAuthorization.ts).
