import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import { useState } from "react";
import Grid from '@material-ui/core/Grid';
import { gql, useMutation } from '@apollo/client';
import Data from '../../../data.json';

const UPDATE_TICKET = gql`
mutation putTicket($organisationId: ID!, $boardId: ID!, $ticketId: ID $input: TicketInput!) {
    putTicket(organisationId: $organisationId, boardId: $boardId, ticketId: $ticketId, input: $input) {
      id
      name
      description
      status
      visible
    }
  }`;

const DELETE_TICKET = gql`
mutation deleteTicket($organisationId: ID!, $ticketId: ID!) {
  deleteTicket(organisationId: $organisationId, ticketId: $ticketId) {
    id
    name
    description
    status
    visible
  }
}`;

function Ticket({item, boardID}) {
    const [open, setOpen] = useState(false);
    const [ticketName, setTicketName] = useState(item.name);
    const [ticketDescription, setTicketDescription] = useState(item.description);
    const [ticketStatus, setTicketStatus] = useState(item.status);
    const [ticketID, _] = useState(item.id);

    const [updateTicket, updatedTicketData] = useMutation(UPDATE_TICKET);
    const [deleteTicket] = useMutation(DELETE_TICKET, {
        update(cache, { data: { deleteTicket } }) {
            cache.modify({
              id: `Board:${boardID}`,
              fields: {
                tickets(existingTickets, {readField}) {
                    existingTickets.filter(
                        commentRef => deleteTicket.id !== readField('id', commentRef)
                    )
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
        console.log(`handleClose ${open}`)
    };

    const handleUpdate =(event) => {
        event.preventDefault();
        updateTicket({
            variables: {
                "organisationId": Data.organizationID,
                "boardId": boardID,
                "ticketId": ticketID,
                "input": {
                    "name": ticketName,
                    "description": ticketDescription,
                    "status": ticketStatus,
                    "visible": true
                }
            }
        });
        setOpen(false);
    };

    const handleDelete = (event) => {
        event.preventDefault();
        deleteTicket({
            variables: {
                "organisationId": Data.organizationID,
                "ticketId": ticketID
            }
        });
        setOpen(false);
    }

    return (
        <div>
            <div onClick={handleOpen}>
                <Card>
                    <CardContent>
                        {item.name}
                    </CardContent>
                </Card>
            </div>
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
                        <Grid item>
                            <label>Status:</label>
                            <select onChange={(e) => setTicketStatus(e.target.value)}>
                                {Data.ticketStatus.map(status => (
                                    <option key={status} value={status} selected={ticketStatus === status}>{status}</option>
                                ))}
                            </select>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} color="primary">
                        Update
                    </Button>
                    <Button onClick={handleDelete} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>)
}

export default Ticket;