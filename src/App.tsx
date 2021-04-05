import './App.css';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from "react";
import Board  from './components/board/Board';
import Data from './data.json';

const CREAT_BOARD = gql`
mutation putBoard($organisationId: ID!, $boardId: ID, $input: BoardInput!) {
  putBoard(organisationId: $organisationId, boardId: $boardId, input: $input) {
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
}`;

const QUERY_ORGANIZATION = gql`
query organisation($organisationId: ID!) {
  organisation(organisationId: $organisationId) {
    id
    name
    timezone
    createdAt
    updatedAt
    
    boards {
      id
      name
    }
    
  }
}`


function App() {
  const [createBoard] = useMutation(CREAT_BOARD, {
    update(cache, { data: { putBoard } }) {
      cache.modify({
        id: `Organisation:${Data.organizationID}`,
        fields: {
          boards(existingBoards = []) {
            const newBoardRef = cache.writeFragment({
              data: putBoard,
              fragment: gql`
                fragment NewBoard on Board {
                  id
                  name
                  tickets
                }
              `
            });
            return [...existingBoards, newBoardRef];
          }
        }
      });
    }
    });

  const {loading, error, data } = useQuery(QUERY_ORGANIZATION, {
    variables: {
      "organisationId": Data.organizationID
    }
  });
  const [newBoardName, setNewBoardName] = useState('');
  const [selectedBoardIndex, selectBoard] = useState(0);

  const handleSubmit = (event) => {
    createBoard({
      variables: {
        organisationId: Data.organizationID,
        input: {
          name: newBoardName
        }
      }
    });
    event.preventDefault();
  }

  if (loading) return (<div>loading</div>);
  if (error) return (<div>error</div>);


return (
  <div>
    <form onSubmit={handleSubmit}>
      <input type="text" name="board_name" onChange={(e) => setNewBoardName(e.target.value)} required></input>
      <input type="submit" value="Create Board"></input>
    </form>
    <select onChange={(e) => selectBoard(parseInt(e.target.value))}>{data.organisation.boards.map((board, index) => (
      <option key={board.id} value={index} selected={index === 0}>{board.name}
      </option>))}
    </select>
    <Board id={data.organisation.boards[selectedBoardIndex].id}></Board>
  </div>
);
}

export default App;
