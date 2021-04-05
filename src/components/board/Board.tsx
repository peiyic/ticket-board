import { gql, useMutation, useQuery } from '@apollo/client';
import TicketContainer from './ticketContainer/TicketContainer';
import Grid from '@material-ui/core/Grid';
import { useState } from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import UpdateTicketAlert from './subscription/updateTicketAlert';
import Data from '../../data.json';

const QUERY_BOARD = gql`
query board($organisationId: ID!, $boardId: ID!) {
    board(organisationId: $organisationId, boardId: $boardId) {
      id
      name
      
      createdAt
      updatedAt
      tickets {
        id
        name
        description
        status
      }  
    }
  }`

const CREATE_TICKET = gql`
mutation putTicket($organisationId: ID!, $boardId: ID!, $ticketId: ID $input: TicketInput!) {
    putTicket(organisationId: $organisationId, boardId: $boardId, ticketId: $ticketId, input: $input) {
      id
      name
      description
      status
      visible
    }
  }`

function Board({id}) {
    const [open, setOpen] = useState(false);
    const [ticketName, setTicketName] = useState('');
    const [ticketDescription, setTicketDescription] = useState('');

    const {loading, error, data } = useQuery(QUERY_BOARD, {
        variables: {
          "organisationId": Data.organizationID,
          "boardId": id
        }
      });
    const [createTicket] = useMutation(CREATE_TICKET, {
        update(cache, { data: { putTicket } }) {
            cache.modify({
              id: `Board:${data.board.id}`,
              fields: {
                tickets(existingTickets = []) {
                  const newTicketRef = cache.writeFragment({
                    data: putTicket,
                    fragment: gql`
                      fragment NewTicket on Ticket {
                        id
                        name
                        description
                        status
                        visible
                      }
                    `
                  });
                  return [...existingTickets, newTicketRef];
                }
              }
            });
          }
    });
    
    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = (event) => {
        createTicket({
            variables: {
                "organisationId": Data.organizationID,
                "boardId": id,
                "input": {
                    "name": ticketName,
                    "description": ticketDescription,
                    "status": "TODO",
                    "visible": true
                }
            }
        });
        setOpen(false);
        // event.preventDefault();
    }

      if (loading) return (<div>loading</div>);
      if (error) return (<div>error</div>);

    return(
        <div>
            <Grid container direction="row" justify="center" spacing={2}>
                {Data.ticketStatus.map((value) => (
                    <Grid item key={value}>
                        <TicketContainer boardID={id} status={value} tickets={data.board.tickets}/>
                    </Grid>
                ))}
            </Grid>
            <button onClick={handleOpen}>Creat Ticket</button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <DialogContent>
                    <Grid container direction="column">
                        <Grid item>
                            <label>Name:</label>
                            <input type="text" value={ticketName} onChange={(e) => setTicketName(e.target.value)} required></input>
                        </Grid>
                        <Grid item>
                            <label>Description:</label>
                            <textarea value={ticketDescription} onChange={(e) => setTicketDescription(e.target.value)}></textarea>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
            <UpdateTicketAlert></UpdateTicketAlert>
        </div>
    );
}

export default Board;