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
curl -v -X GET "http://localhost:4000/collections/0"
curl -v -X GET "http://localhost:4000/collections/1"
curl -v -X GET "http://localhost:4000/collections/2"
curl -v -X GET "http://localhost:4000/collections/3"
curl -v -X GET "http://localhost:4000/collections/4"
curl -v -X GET "http://localhost:4000/collections/5"
```

### create a user

```bash
curl -X POST "https://hapi-meal-api.herokuapp.com/sign_up" -H "Content-Type: application/json" -d '{"email": "AAAAAA1", "password": "aaaaaaaaaa"}'

curl -X POST "http://localhost:4000/sign_up" -H "Content-Type: application/json" -d '{"email": "AAAAAA", "password": "aaaaaaaaaa"}'
```

### sign in the user

```bash
curl -X POST "https://hapi-meal-api.herokuapp.com/sign_in" -H "Content-Type: application/json" -d '{"email": "a1a@gmail.com", "password": "efoeoe9E"}'

curl -X POST "http://localhost:4000/sign_in" -H "Content-Type: application/json" -d '{"email": "AAA@gmail.com", "password": "efoeoe9E"}'
```

### claim an item from the collection

```bash
curl -X POST "https://hapi-meal-api.herokuapp.com/collections/1" -v -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1MCwiYWRkcmVzcyI6IjB4RmYwYTBDRTA1ZDlEMDE4N0EyZTIwN0VGNTE5Njc5Q2IzRjFFMTRCQiIsImlhdCI6MTY2NzExMzU1OSwiZXhwIjoxNjY3MTE3MTU5fQ.xnE8iYjYQonJqVAHXPKc6rXz_5zezSPVYqyOdK2T8j8"
curl -X POST "http://localhost:4000/collections/1" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:4000/collections/2" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:4000/collections/3" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:4000/collections/4" -v -H "Content-Type: application/json" -H "Authorization: Bearer <jwt>"
curl -X POST "http://localhost:4000/collections/5" -v -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxOSwiaWF0IjoxNjY3MTE4NTg4LCJleHAiOjE2NjcxMjIxODh9.0zHoWniBhdmuVzRaiGB9UtYpD90F406HYoZpdAEw-eQ"
```

### list the collectibles of a user

```bash
curl -v -X GET -H "Authorization: Bearer <jwt>" "http://localhost:4000/collectibles"
```

### transfer to another user

```bash
curl -X PUT "https://hapi-meal-api.herokuapp.com/collectibles/7/send/email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNywiaWF0IjoxNjY3MTEwOTU0LCJleHAiOjE2NjcxMTQ1NTR9.7bdRIYeaKq0QrzuVfaRru0G-cLDzOQmKFBTvikoJM2o" \
  -d '{"toEmail": "1@gmail.com"}'
```

### export assets

```bash
curl -X POST "https://hapi-meal-api.herokuapp.com/export" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxOSwiaWF0IjoxNjY3MTA2NzYxLCJleHAiOjE2NjcxMTAzNjF9.wI29A92kewrgjE_fVVOXNomzNVUdDnwDF9DHkRyJ_H0" \
  -d '{"toAddress": "0xfBFC13C645BF221601f1cFb546e88432a2679631"}'

curl -X POST "http://localhost:4000/export" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxOSwiaWF0IjoxNjY3MTEyMjkzLCJleHAiOjE2NjcxMTU4OTN9.0R0UJqJTOPmGdqwtwqmipso5ynO4kEve5SRvkvbt4fQ" \
  -d '{"toAddress": "0xfBFC13C645BF221601f1cFb546e88432a2679631"}'
```
