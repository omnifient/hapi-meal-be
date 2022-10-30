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

```bash
curl -v -X GET "http://localhost:3000/collections/0"
curl -v -X GET "http://localhost:3000/collections/1"
curl -v -X GET "http://localhost:3000/collections/2"
curl -v -X GET "http://localhost:3000/collections/3"
curl -v -X GET "http://localhost:3000/collections/4"
curl -v -X GET "http://localhost:3000/collections/5"
```

### create a user

```bash
curl -X POST "https://hapi-meal-api.herokuapp.com/sign_up" -H "Content-Type: application/json" -d '{"email": "AAAAAA", "password": "aaaaaaaaaa"}'
```

### sign in the user

```bash
curl -X POST "https://hapi-meal-api.herokuapp.com/sign_in" -H "Content-Type: application/json" -d '{"email": "AAAAAA", "password": "aaaaaaaaaa"}'
```

### claim an item from the collection

```bash
curl -X POST "https://hapi-meal-api.herokuapp.com/collections/0" -v -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxOSwiaWF0IjoxNjY3MTA0OTUzLCJleHAiOjE2NjcxMDg1NTN9.oR5hXML2wzImWRLqC7lPNE8tbY_IxgciexvTvGi1ycs"
curl -X POST "http://localhost:3000/collections/1" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:3000/collections/2" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:3000/collections/3" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:3000/collections/4" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:3000/collections/5" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
```

### list the collectibles of a user

```bash
curl -v -X GET -H "Authorization: Bearer <jwt>" "http://localhost:3000/collectibles"
```

### transfer to another user

```bash
curl -X PUT "https://hapi-meal-api.herokuapp.com/collectibles/1/send/email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNywiaWF0IjoxNjY3MTA0NzU4LCJleHAiOjE2NjcxMDgzNTh9.UM7qQSPEG7uJFau1_R6reso0TudhXXctatD6kIMV7Lg" \
  -d '{"toEmail": "AAAAAA"}'
```

### export assets

```bash
curl -X POST "https://hapi-meal-api.herokuapp.com/export" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxOSwiaWF0IjoxNjY3MTA2NzYxLCJleHAiOjE2NjcxMTAzNjF9.wI29A92kewrgjE_fVVOXNomzNVUdDnwDF9DHkRyJ_H0" \
  -d '{"toAddress": "0xfBFC13C645BF221601f1cFb546e88432a2679631"}'
```
