import Snackbar from '@material-ui/core/Snackbar';
import { useState } from "react";
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { gql, useSubscription } from '@apollo/client';
import Data from '../../../data.json';

const UPDATE_TICKET_SUBSCRPTION = gql`
subscription ticketUpdates($organisationId: ID!) {
    ticketUpdates(organisationId: $organisationId) {
      name
      id
    }
  }`

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

function UpdateTicketAlert () {
    const [open, setOpen] = useState(true);
    const { data, loading, error } = useSubscription(UPDATE_TICKET_SUBSCRPTION, { 
        variables: { 
          organisationId: Data.organizationID 
        }
      });
    

    const handleClose = () => {
        setOpen(false);
    };

    if (error) {return (<p>{error}</p>)};
    if (loading) {return (<p>{loading}</p>)};
    
    return ( loading ? null :
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success">
            Ticket {data.ticketUpdates.name} just got updated!
          </Alert>
        </Snackbar>
    )
}

export default UpdateTicketAlert;