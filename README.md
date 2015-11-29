# orb-api
A RESTful express.js API for Orb

## Installation

Requires node.js and npm.

1. Install packages ```npm install```
2. Run Nodemon development server ```npm start```
3. Go to localhost:8080/

## API Endpoints

All authorized endpoints require an authorization token (JWT) for access. 
The token can be claimed from <code>/auth</code> endpoint by logging in.

Send the acquired token as a <code>Authorzation: Bearer &lt;token&gt;</code> HTTP Header for
the following endpoints.

<hr />
### /
###### GET (public)
**returns** a html help page

<hr />
### /auth
###### POST (public)
Works as an endpont for user authorization.

**parameters** *username*, *password* as x-www-form-urlencoded or json parameters are required.

**returns** an authorizaton token (JWT) in response.

<hr />
### /api/users
###### GET (authorization required)
**returns** all the users on the database.

###### POST (public)
Works as an endpoint for user creation.

The following parameters are available:

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| name | String | **yes** | User nickname |
| password | String | **yes** | A secure password |
| age | Number | **yes** | User age in years |
| gender | String: male/female | **yes** | User's gender |
| note | String | no | A note that is shown to other users |
| latitude | Number | no | User's current positional coordinates, lat |
| longitude | Number | no | User's current positional coordinates, lon |
| following | List [] | no | A list of user id's the User is following |

<hr />
### /api/users/[id]
###### GET (authorization required)
**returns** a single user by <id>

###### PUT (authorization required)
Updates user's data. See POST /api/users for available parameters.
These fields can be updated individually (or all together).

###### DELETE (authorization required)
Deletes a single user from the database.
