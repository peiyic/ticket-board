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
var base64 = require('base-64');

// Create an http link:
const httpLink = new HttpLink({
  uri: 'https://w6tcrg3sb4.execute-api.us-east-1.amazonaws.com/example-example-graphql-api',
  headers: {
    'Authorization': base64.encode('123')
  }
});

// Create a WebSocket link:
const wsLink = new WebSocketLink(new SubscriptionClient(`wss://o8jmtfhs88.execute-api.ap-southeast-2.amazonaws.com/peiyi`, {
  reconnect: true,
  connectionParams: async () => {
    return {
      Authorization: base64.encode('123')
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
