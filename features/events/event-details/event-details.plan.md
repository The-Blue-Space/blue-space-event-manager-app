new task:
build out the event details page
overview: the event details page entails the details and break down for a particular event. 

## Plan Breakdown

you will find attached an a file with a sketch on what the page should look like.

please note: go through all the features and components used in this app and work with that. get your inspiration from there. so all the app has unified design and style. kindly pay attention to the colors, fonts, typography and other design elements. for this feature take pay good attention to the design and style used in the event folder that should give you a good idea on what it should look like. still go external to other feature to get ideas and inspiration. you can come up with your own design and style but it should be consistent with the app.

now here are additional info

sections: 
- metrics : this is where the metrics card would be participants, ticket sales, and, refunds upload counts.
there is an endpoint to get this metrics @ get-event-metrics

- event details tab: this is where the details of the event should be. this would be carry the core details and settings of the event

- tickets/request : handle only tickets for now. the idea is that if the access type for the event is ticket-based then you show the tickets if it is individual then show invite request  from attendees. for ticket  it should be the use the userTicket types  if there is no service to get user tickets for an event then create one using the pattern established. the ticket list should be tabular. and the details should be a side drawer. is should look like the recent order details drawer on the home page. look for it and break it down like that. same would be applicable for request but that would be on hold for now. 
the table item for ticket should have a view and revoke ticket as the dropdown options. when they double click on an entry it should open the details drawer. the revoke should have the show a confirmation dialog before you proceed to revoke. look at how i dialogs is been used in this app and work with that. once a ticket is revoked not going back that should be part of the confirmation  dialog. 
- event activities. this should show the activities that an event is having, it should basically look like the activity tab on active event component check event-activity.tsx
- manage album button: this should open a bottom drawer that would allow you to manage the album for the event, this drawer should persist on the page with the query params tab=album. the manager should be able to select multiple medias to either set as highlight, hide, or delete. each card should have these options as well.  managers should ba able to upload media as well. when manage clicks on a media it should show it on a bigger view with the option to set as highlight, hide, or delete. they should also be able to navigate to the next and previous media.

let me know if you need any clarification or have any questions.