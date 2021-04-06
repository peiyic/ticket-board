import Ticket from '../ticket/Ticket';

// TicketContainer contains the tickets that fall into the same status
function TicketContainer({status, tickets, boardID}) {
    return (
        <div>
            <label>{status}</label>
            {tickets.filter(ticket => ticket.status === status)
                    .map(ticket => {
                        return (<Ticket key={ticket.id} item={ticket} boardID={boardID}></Ticket>);
                    })}
        </div>
    )
}

export default TicketContainer;