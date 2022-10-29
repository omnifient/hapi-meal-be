# HAPI MEAL - BACKEND

## How to run

Install dependencies:

```bash
npm install
```

Run the nodemon server:

```bash
npm run server
```

Create tables if needed:
```bash
npm run initDB
```

## cURL Examples

### check the collection
curl -v -X GET "http://localhost:3000/collections/0"
curl -v -X GET "http://localhost:3000/collections/1"
curl -v -X GET "http://localhost:3000/collections/2"
curl -v -X GET "http://localhost:3000/collections/3"
curl -v -X GET "http://localhost:3000/collections/4"
curl -v -X GET "http://localhost:3000/collections/5"

### create a user
curl -X POST "http://localhost:3000/sign_up" -H "Content-Type: application/json" -d '{"email": "aaaa@bbb.ccc", "password": "aaaaaaaaaa"}'

### sign in the user
curl -X POST "http://localhost:3000/sign_in" -H "Content-Type: application/json" -d '{"email": "aaaa@bbb.ccc", "password": "aaaaaaaaaa"}'

### claim an item from the collection
curl -X POST "http://localhost:3000/collections/0" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:3000/collections/1" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:3000/collections/2" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:3000/collections/3" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:3000/collections/4" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:3000/collections/5" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"

### list the collectibles of a user
curl -v -X GET -H "Authorization: Bearer <jwt>" "http://localhost:3000/collectibles"
