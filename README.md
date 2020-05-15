# rental-management

## Author: Abhijit Baldawa

### Description
A backend typescript based server for payment management for contracts

### With Docker
1. git clone <project>
2. cd <project>
3. docker-compose up

Once the the docker-compose up command then all the REST API's (mentioned below) are accessible at "http://localhost:3000"


### Without docker (Prerequisites MongoDB/node.js must installed and mongodb must be up and running

### How to run:
1. git clone <project>
2. cd <project>/server
3. npm i  
4. npm run start
  
### NOTE: http server port and mongo port/host config is configurable under {project}/server/src/config/servirConfig.json.

### Below REST endpoints are exposed:
1. GET /contracts -> Get all existing contracts
2. POST /contracts/:contractId (accepts 'description', 'time', 'value', 'isImported' as body request) -> creates a new payment for contractId
3. DELETE /contracts/:contractId/payments/:paymentId -> Deletes paymentId from the database for contractId
4. PUT /contracts/:contractId/payments/:paymentId (Accepts 'description', 'value', 'time' in body) -> Updates payment information for paymentId for contractId
5. GET /contracts/:contractId/paymentList -> Returns aggregated result of all the payments for contractId. (accepts 'startDate' and/or 'endDate' as optional query param to narrow down the result)
