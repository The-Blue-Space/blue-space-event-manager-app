new task:
build out the finance feature
overview: the finance feature is basically where an event manager see and request all their payout.
a manager can request payment from the the revenue raise from their events

## Plan Breakdown

you will find attached an a file with a sketch on what the page should look like.

now here are additional info

--setting up --

1. I would expect you create constants and fill it out. access the types on the @types/finance.types.ts to get an understanding on all you need and would be required.
2. generate constants for these and wire them up to the services they are currently empty there is a .

-- UI --

1. metrics card: use the ui used to map cards check the events page or the home page. check the FinanceDashboard in @types/finance.types.ts
2. the bank cards should have the following options: delete, set as default. the add bank should open the drawer.
3. add bank drawer: the otp should be request and sent as payload when adding bank.
4. request payout and payout history Tabs; Payout history should be paginated with filter.
5. Payout row on the table : should have a dispute show a dispute button that would open a drawer with the dispute reason.
6. request payout: there should be tab for payouts where users can request payout. each entry should have a request button when the request is still pending else it should just show the status

come up with a plan for this ask questions where you need clarity
