# Client.ts

**The Redux Toolkit-Inspired HTTP Client for TypeScript Applications**

[![npm version](https://img.shields.io/npm/v/@client.ts/core?color=blue&label=Latest%20Version)](https://www.npmjs.com/package/@client.ts/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?logo=typescript&logoColor=white)

Simplify API interactions with a **type-safe**, **structured**, and **hackable** HTTP client designed for modern TypeScript applications. Built with ❤️ for developers who crave Redux-like organization in their API layer.

```ts
// See your API client come alive in 3 steps ⏱️
import { createClient, createSingleAndArrayedRoute } from "@client.ts/core";

// 1. Define your route creators (this is the recommended way for resources with arrayed and non-arrayed type).
const { single: postRoute, arrayed: postsRoute } = createSingleAndArrayedRoute<BlogPost>();

// 2. Create your API client
const blogClient = createClient("https://api.myblog.com", {
  posts: {
    prefix: "/posts",
    routes: {
      list: postsRoute.static("GET /"), // Get all posts
      get: postRoute.dynamic((id: string) => `GET /${id}`), // Get single post
      create: postRoute.dynamic((post: DraftPost) => ({
        route: "POST /",
        body: post,
        headers: { 'X-Editor-Key': "SECRET_123" },
        encoder: JSON.stringify,
        decoder: JSON.parse
      }))
    }
  }
});

// 3. Use anywhere with full TypeScript support ✨
const { data: latestPost } = await blogClient.posts.get("42");
```

## Why Client.ts?

| Feature                | client.ts 🦸♂️          | Axios/Fetch 🧑💻         |
|------------------------|-------------------------|-------------------------|
| **Type Safety**        | First-class citizen     | Manual typings          |
| **API Structure**      | Resource-centric design | Scattered endpoints     |
| **Customization**      | Swap HTTP engines       | Library-locked          |
| **Hooks**              | Hooks at every level    | Global interceptors     |
| **Code Maintenance**   | Built for scale         | Gets messy at scale     |

## Key Features & Benefits

* **TypeScript First:** Enjoy full type safety and autocompletion for a more robust and maintainable codebase. Say goodbye to runtime errors and hello to developer productivity.
* **Redux-Inspired Structure:**  Organize your API interactions with a clear, resource-based structure, making your code easier to understand, maintain, and scale.
* **Flexible and Customizable:**  Use the built-in `fetch` API or easily integrate with other HTTP libraries like Axios. Tailor Client.ts to your specific needs.
* **Powerful Hooks System:**  Intercept and modify requests and responses globally, per resource, or even per route. Implement custom logic like authentication, logging, or data transformation with ease.
* **Leveled Headers:** Define headers at the client, resource, route, or hook level for granular control and reduced boilerplate.
* **Simplified Route Definitions:** Define static routes with simple strings or dynamic routes with functions, providing flexibility for complex API interactions.
* **Lightweight and Performant:**  Client.ts is designed to be efficient and minimize its impact on your application's performance.
* **Timeouts:** Client.ts supports setting timeouts on a global, per-resource, and per-route level.

## Get Started in 4 steps!

1. **Install** (it's tiny!):
   ```bash
   npm install @client.ts/core
   ```

2. **Define Your First Resource** (`src/api/users.ts`):
   ```ts
   import { createRoute } from "@client.ts/core";

   // This is the recommended way for non-arrayed types
   export const { static: createStaticUserRoute, dynamic: createDynamicUserRoute } = 
     createRoute<User>();
   
   export const UsersResource = {
     prefix: "/users",
     routes: {
       getAdmin: createStaticUserRoute("GET /admin"),
       getById: createDynamicUserRoute(id => `GET /${id}`),
       create: createDynamicUserRoute(payload => ({
         route: "POST /",
         body: payload
       }))
     }
   };
   ```

3. **Assemble Your Client** (`src/api/client.ts`):
   ```ts
   import { createClient } from "@client.ts/core";
   import { UsersResource } from "./users";
   
   export const client = createClient("https://api.yourservice.com", {
     users: UsersResource
   });
   ```

4. **Use Like a Pro**:
   ```ts
   // Get typescript support for your requests easily!
   const { data: user } = await client.users.getAdmin();
   
   // Create user with type-checked payload
   await client.users.create({ name: "Alice", role: "admin" });
   ```

## Key Knowledge

### Declarative Route Definitions

Define routes as either static or dynamic:
- **Static Routes**: Use a simple string (e.g., `GET /`) to define a route.
- **Dynamic Routes**: Use functions to generate routes based on parameters, or even return an object with advanced request details.

Example:
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

### Reusable Route Creators
Keep your code DRY by reusing route creators across multiple resources:
```ts
import { createClient, createRoute, createSingleAndArrayedRoute } from "@client.ts/core";

// Convenience methods for handling single or arrayed resources
const { single: resourceRoute, arrayed: resourcesRoute } = createSingleAndArrayedRoute<Resource>();

// Simplified route creation for non-array resources
const { dynamic: createDynamicRoute, static: createStaticRoute } = createRoute<AnotherResource>();

const client = createClient("baseUrl", {
    resource: {
        prefix: "/resource",
        routes: {
            get: resourcesRoute.static("GET /"),
            getFirst: resourceRoute.static("GET /first"),
            getById: resourceRoute.dynamic((id: number) => `GET /${id}`)
        }
    },
    anotherResource: {
        prefix: "/another-resource",
        routes: {
            get: createStaticRoute("GET /"),
            getById: createDynamicRoute((id: number) => `GET /${id}`)
        }
    }
});
```

### Encoder and Decoder
Client.ts, by default, uses `JSON.stringify` as the encoder and `JSON.parse` as the decoder, as most of the web standards uses JSON. Although, there are special cases in 
encoding where we ignore the `encoder`, these cases are when the type of the body is supported by native fetch, which are:
* **ReadableStream**
* **FormData**
* **ArrayBuffer**
* **URLSearchParams**

If you want to handle those body beforehand, use **Hooks** to transform the request body to your liking before it gets passed to the connector. You can also specify 
a different encoder at a global, per-resource and per-route level by specifying the `encoder` and `decoder` properties.

## 🔌 Hooks: Supercharge Your Workflows

Add hooks magic at any level:

```ts
// Authorization hook factory.  Adds a Bearer token to the request headers.
const withAuth = (token: string) => createHook({
  beforeRequest: (req) =>
    req.merge({
      headers: { Authorization: `Bearer ${token}` },
    }),
});

// Logging hook. You can use hooks to even transform responses into another liking.
const logRequests = createHook({
  afterRequest: (req, res) => {
     console.info(`Rececived status ${res.statusCode} for request.`, request);
     return res;
  }
})

// Remember to reuse your route creators since it's cleaner this way.
const { static: createStaticSecretDataRoute, dynamic: createDynamicSecretDataRoute } = createRoute<SecretData>();

// Create an API client with authorization hooks applied at different levels.
const client = createClient(BASE_URL, {
  posts: {
    // Resource-level authorization: Applies to all routes within 'posts'.
    hooks: [withAuth("Resource level")],
    routes: {
      get: createDynamicSecretDataRoute(() => {
        return {
          route: "GET /secret",
          // Route-level authorization: Overrides/adds to resource-level auth.
          hooks: [withAuth("Route level")],
        };
      }),
    },
  },
}, {
  // Log all requests received.
  hooks: [logRequests],
});
```

**Hook Superpowers:**
- 🛡️ Add auth headers
- 📊 Logging/monitoring
- ⏱️ Request timing
- 📦 Response normalization

## 🏗️ Project Structure Blueprint

We **strongly recommend** this scalable structure:

```
src/
├─ api/
│  ├─ client.ts          # Main client instance
│  ├─ hooks/             # Reusable middleware
│  │  └─ auth.ts
│  └─ resources/         # API resource definitions
│     ├─ posts.ts
│     ├─ users.ts
│     └─ products.ts
```

**Example Resource File** (`resources/posts.ts`):
```ts
import { createSingleAndArrayedRoute } from "@client.ts/core";

const { single: postRoute, arrayed: postsRoute } = createSingleAndArrayedRoute<BlogPost>();
const Posts = {
  prefix: "/posts",
  routes: {
    trending: postsRoute.static("GET /trending"),
    draft: postRoute.dynamic((id: string) => ({
      route: `GET /drafts/${id}`,
      headers: { 'X-Draft-Access': 'true' }
    }))
  }
};

export default Posts;
```

## 🤝 Help us improve client.ts

**We need you!** Client.ts is built by developers, for developers. Here's how you can help:

- ⭐ **Star the repo** - Show your love!
- 🐞 **Report bugs** - Help us squash them
- 💡 **Suggest features** - What's missing?
- 📖 **Improve docs** - Make it clearer for everyone

```bash
# Clone and contribute
git clone https://github.com/client-ts/client.ts.git
```

## License

Client.TS is licensed under MIT License. You are free to use this however you want, whether commerically, personal use, or even creating a better 
fork under another name, we are open to anything that can help build a better development environment for others!
