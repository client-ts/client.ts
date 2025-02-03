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
const { result: posts } = await client.posts.get();
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
const { result: resources } = await client.resource.get();
const { result: firstResource } = await client.resource.getFirst();
const { result: resourceOne } = await client.resource.getById(1);
```

---

### Middlewares and Afterwares

You can add **middlewares** and **afterwares** to perform actions before and after a request. Middlewares allow you to modify the request (e.g., adding headers), while afterwares can log or process the response.

These can be applied globally or at the resource level:

```ts
const client = createClient("baseUrl", {
    resource: {
        prefix: "/resource", // Optional
        routes: {
            get: createRoute<Resource[]>().static("GET /"),
            getFirst: createStaticResourceRoute.static("GET /first"),
            getById: createDynamicResourceRoute.dynamic((id: number) => `GET /${id}`)
        },
        middlewares: [], // Resource-specific middlewares
        afterwares: [] // Resource-specific afterwares
    }
}, {
    middlewares: [
        (request) => {
            return {
                ...request,
                path: "/5" // Modify the request path
            };
        }
    ],
    afterwares: [
        (request) => {
            console.info(request); // Log the request
            return request;
        }
    ]
});
```

---

### Example Middleware: Adding Authorization

Here’s an example of a middleware that adds an authorization header to the request:

```ts
// src/middlewares/withAuthorization.ts
const withAuthorization = (token: string) => (request: Request) => {
    return {
        ...request,
        headers: {
            ...request.headers,
            'Authorization': `Bearer ${token}`
        }
    };
};
```

---

## Key Features

- **TypeScript Support**: Built with TypeScript for type-safe HTTP requests.
- **Customizable**: Use `fetch` or replace it with libraries like Axios.
- **Middleware Support**: Modify requests or responses globally or per-resource.
- **Resource-Based Structure**: Organize routes under resources for better maintainability.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
