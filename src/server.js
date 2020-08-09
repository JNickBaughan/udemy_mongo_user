const mongoose = require("mongoose");
const User = require("./mongoSchema/user.ts");
const express = require("express");
const bodyParser = require("body-parser");
const { ApolloServer, gql } = require("apollo-server-express");
const PORT = 3000;
const server = express();
const middlewares = [
  express.static("dist"),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
];

mongoose.connect("mongodb://localhost/users_test");
mongoose.connection
  .once("open", () => console.log("good to go"))
  .on("error", (error) => console.warn("Error", error));

server.use(...middlewares);

const typeDefs = gql`
  type User {
    firstName: String
    lastName: String
    email: String
    pw: String
  }
  input UserInput {
    firstName: String
    lastName: String
    email: String
    pw: String
  }
  type Mutation {
    addUser(user: UserInput): User
  }
  type Query {
    getUser(email: String): User
  }
`;

const resolvers = {
  Query: {
    getUser: async (_, args, { User }) => {
      const existingUser = await User.findOne({ email: args.email });
      if (!existingUser) {
        throw new Error(
          `sorry doesn't look like we have a user with that email`
        );
      }
      return existingUser._doc;
    },
  },
  Mutation: {
    addUser: async (
      _,
      { user: { firstName, lastName, email, pw } },
      { User }
    ) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error(`look like that email is already being used`);
      }
      const newUser = new User({ firstName, lastName, email, pw });
      const savedUser = await newUser.save();
      return savedUser._doc;
    },
  },
};

const graphQLServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return {
      User,
    };
  },
});

graphQLServer.applyMiddleware({ app: server });

server.get("/", (req, res) =>
  res.send(`<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <div id="root">test!</div>
    <script src="bundle.js"></script>
  </body>
</html>
`)
);

server.listen(PORT, function () {
  console.log("server listening on port: " + PORT);
});
