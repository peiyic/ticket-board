import './App.css';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from "react";
import Board  from './components/board/Board';
import Data from './data.json';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';

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
  const [newBoardName, setNewBoardName] = useState('');
  const [selectedBoardIndex, selectBoard] = useState(0); // select the first board by default
  const [open, setOpen] = useState(false);

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

  const handleSubmit = (event) => {
    event.preventDefault();
    createBoard({
      variables: {
        organisationId: Data.organizationID,
        input: {
          name: newBoardName
        }
      }
    });
    setOpen(false);
    setNewBoardName('');
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
      setOpen(false);
  };

  if (loading) return (<div>loading</div>);
  if (error) return (<div>error</div>);


return (
  <div>
    <button onClick={handleOpen}>Creat Board</button>
    <select onChange={(e) => selectBoard(parseInt(e.target.value))}>{data.organisation.boards.map((board, index) => (
      <option key={board.id} value={index} selected={index === 0}>{board.name}
      </option>))}
    </select>
    {data.organisation.boards.length>0 && <Board id={data.organisation.boards[selectedBoardIndex].id}></Board>}
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <DialogContent>
            <Grid container direction="column">
                <Grid item>
                    <label>Name:</label>
                    <input type="text" value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} required></input>
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <button onClick={handleClose} color="primary">
                Cancel
            </button>
            <button type="submit" color="primary">
                Create
            </button>
        </DialogActions>
        </form>
    </Dialog>
  </div>
);
}

export default App;
