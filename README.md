# Client.ts

**Redux Toolkit-inspired HTTP Client**

`client.ts` is a lightweight HTTP client designed with a similar principle to Redux: it serves as a single source of truth for all your HTTP request methods. Built with TypeScript in mind, it uses `fetch` internally but can be customized to work with other libraries like Axios.

```ts
import { createClient, createRoute } from "@client.ts/core";

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
                // Default encoder and decoder shown for example purposes
                encoder: JSON.stringify,
                decoder: JSON.parse,
            }))
        }
    }
});
```

```ts
const { data: posts } = await client.posts.get();
```

---

## Getting Started

To get started, install the package as a dependency in your project:

```bash
npm install @client.ts/core
```

### Creating a Client

Use the `createClient` function to create a client instance. It requires a `baseUrl`, which will be prefixed to all routes. The client follows a `Resource -> Route` structure for defining routes:

```ts
createClient("baseUrl", {
    resource: {
        prefix: "/resource", // Optional
        routes: {
            // Define routes here
        }
    }
});
```

---

### Defining Routes

Routes can be defined as either **static** or **dynamic**:

- **Static Routes**: A simple string in the format `METHOD /path`.
- **Dynamic Routes**: A function that takes parameters and returns a string or an object with request details.

Use the `createRoute` function to define routes:

```ts
createClient("baseUrl", {
    resource: {
        prefix: "/resource", // Optional
        routes: {
            get: createRoute<Resource[]>().static("GET /"),
            getById: createRoute<Resource>().dynamic((id: number) => `GET /${id}`)
        }
    }
});
```

---

### Reusing Route Creators

You can reuse `createRoute` for multiple resources by storing it in a variable:

```ts
import { createClient, createRoute } from "@client.ts/core";

const { static: createStaticResourceRoute, dynamic: createDynamicResourceRoute } = createRoute<Resource>();

const client = createClient("baseUrl", {
    resource: {
        prefix: "/resource", // Optional
        routes: {
            get: createRoute<Resource[]>().static("GET /"),
            getFirst: createStaticResourceRoute.static("GET /first"),
            getById: createDynamicResourceRoute.dynamic((id: number) => `GET /${id}`)
        }
    }
});
```

Access the routes using the `client` object:

```ts
const { data: resources } = await client.resource.get();
const { data: firstResource } = await client.resource.getFirst();
const { data: resourceOne } = await client.resource.getById(1);
```

---

### Hooks

You can add **hooks** to perform actions before and after a request. 
`beforeRequest` in a hook allow you to modify the request (e.g., adding headers), 
while `afterRequest` can log or process the response.

These can be applied globally, at a resource level, at a route level, or even during request (through another hook):

```ts
import {createHook} from "@client.ts/core";

const client = createClient("baseUrl", {
    resource: {
        prefix: "/resource", // Optional
        routes: {
            get: createRoute<Resource[]>().static("GET /"),
            getFirst: createStaticResourceRoute.static("GET /first"),
            getById: createDynamicResourceRoute.dynamic((id: number) => `GET /${id}`)
        },
        hooks: [] // Hooks for the resource
    }
}, {
    hooks: [
        createHook({
            beforeRequest: (request) => {
                return request.merge({
                    headers: {
                        "Authorization": "Hey @ client.ts"
                    }
                })
            },
            afterRequest: (request, result) => {
                return result.merge({
                    // Example: Some APIs have a `data` key which contains the actual data.
                    data: result.data.data
                })
            }
        })
    ]
});
```

---

### Example Hook: Adding Authorization

Here’s an example of a middleware that adds an authorization header to the request:

```ts
// src/middlewares/useAuthorization.ts
const withAuthorization = (token: string) => (request: Request) => {
    return request.merge({
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};
```

It is important to note that `merge` will replace existing properties with provided, except for array properties, such as 
`headers`, which will be merged together with the newer headers taking priority over the older ones, so that, for example,
you have a header `Authorization: Hi` in the request, and the hook adds `Authorization: Hello`, the hook will have the 
higher priority and the request will be sent with `Authorization: Hello`.

---

## Key Features

- **TypeScript Support**: Built with TypeScript for type-safe HTTP requests.
- **Customizable**: Use `fetch` or replace it with libraries like Axios.
- **Middleware Support**: Modify requests or responses globally or per-resource.
- **Resource-Based Structure**: Organize routes under resources for better maintainability.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
