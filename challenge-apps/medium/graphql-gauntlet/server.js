const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'CGS{test-flag}';

const schema = buildSchema(`
    type Query {
        user(id: Int!): User
    }

    type User {
        id: Int!
        name: String!
        email: String!
        secret: Secret
    }

    type Secret {
        flag: String
    }
`);

const users = [
    { id: 1, name: 'Admin', email: 'admin@ctf.local', secret: { flag: FLAG } },
    { id: 2, name: 'Alice', email: 'alice@ctf.local', secret: null },
    { id: 3, name: 'Bob', email: 'bob@ctf.local', secret: null },
];

const root = {
    user: ({ id }) => {
        const u = users.find(u => u.id === id);
        if (!u) return null;
        // Mark secret as null for non-admin users
        if (id !== 1) {
            return { ...u, secret: null };
        }
        return u;
    }
};

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true, // Introspection + GraphiQL enabled
}));

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><title>GraphQL Gauntlet</title></head>
<body>
    <h1>GraphQL Gauntlet</h1>
    <p>Access <a href="/graphql">/graphql</a> to query the API.</p>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log(`GraphQL-gauntlet running on port ${PORT}`);
});
