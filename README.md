# Simple Boilerplate for a GraphQL backend with Apollo Server, Express, and Typescript

This is a simple boilerplate with authentication using JWTs. Presently not ready for production, but if you are learning GraphQL and need to stand up and tear down a server running on localhost with authentication, this may be a good place to start.

Here are [some](https://hackernoon.com/three-ways-to-structure-your-graphql-code-with-apollo-server-4788beed89db) [hints](https://blog.apollographql.com/modularizing-your-graphql-schema-code-d7f71d5ed5f2) on organizing your code.

You can register a user:

```
mutation {
  register(
    email: "test@test.com"
    name: "Testing Testing"
    password: "asdfasdf"
  ) {
    token
    user {
      id
      name
      password
    }
  }
}

```

And as a result, you can get a JWT token and the user info returned to you:

```
{
  "data": {
    "register": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJuYW1lIjoiVGVzdGluZyBUZXN0aW5nIiwicGFzc3dvcmQiOiIiLCJpZCI6MiwiaWF0IjoxNTU3OTQwODcyLCJleHAiOjE1NTgwMjcyNzJ9.HrbfRM0ZfXwqSVXam2xUNIr9oNktTjkzIaeG1bkRFC4",
      "user": {
        "id": 2,
        "name": "Testing Testing",
        "password": "haha, no"
      }
    }
  }
}
```

Anybody can run `query { hello }` but a only a logged in user can run `query { secret }`. A user is logged in if a valid "authorization" header is passed in the HTTP headers. Use the JWT in the token field.

An invalid token (incorecty copied, made up, expired, whatever) will result in an error. It is up to the front end to retry with no auth token.

# Current todos:

add Apollo testing so less manual testing.
TODO inside resolvers re: house
Get rid of `any` by looking up how to type React Props.
