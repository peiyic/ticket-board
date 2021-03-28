import './App.css';
import { gql, useQuery } from '@apollo/client';

const GET_BOARD = gql`
query board($organisationId: ID!, $boardId: ID!) {
  board(organisationId: $organisationId, boardId: $boardId) {
    id
    name
    
    createdAt
    updatedAt
    tickets {
      name
      description
      status
    }  
  }
}`

function App() {
  const { loading, error, data, refetch, networkStatus } = useQuery(GET_BOARD, {
    variables: {
      "organisationId": "806fb7b1-64fb-4ec1-853b-f4ac7554cc64",
      "boardId": "ac07246f-d903-408f-8506-80a3f67327d0"
    },
    notifyOnNetworkStatusChange: true
  });
  console.log("loading:" + loading);
  console.log("error:" + error);
  console.log("data:" + data);
  console.log("refresh:" + refetch);
  console.log("networkStatus:" + networkStatus)
return (<div>{data}</div>);
}

export default App;
