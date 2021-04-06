import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloProvider, 
         ApolloClient, 
         InMemoryCache, 
         HttpLink, 
         split } from '@apollo/client';
import { WebSocketLink } from "@apollo/client/link/ws";
import Data from './data.json';

// Create an http link:
const httpLink = new HttpLink({
  uri: 'https://w6tcrg3sb4.execute-api.us-east-1.amazonaws.com/example-example-graphql-api',
  headers: {
    'Authorization': Data.userID
  }
});

// Create a WebSocket link:
const wsLink = new WebSocketLink(new SubscriptionClient('wss://156hxo0ega.execute-api.us-east-1.amazonaws.com/example', {
  reconnect: true,
  connectionParams: async () => {
    return {
      Authorization: Data.userID
    }
  }
}, undefined, []));

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const gqlClient = new ApolloClient(
  {
      link: link,
      cache: new InMemoryCache()
  }
);


ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={gqlClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
