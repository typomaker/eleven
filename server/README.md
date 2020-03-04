## API

### POST /token
Creating session token with creating account in case it not exists

#### request:
`facebook Oauth`.
```json
{
  type: "facebook",
  token: "..." // access token received from a facebok server
}
```
`login/password`
```json
{
  type: "password", 
  email: "email@email.email", // valid email address
  password: "..." // minimum 1 character 
}
```
#### response
`200 Ok`
```json
{
  "id": "e7642ef6-7af2-4340-83cd-77209590cda1",
  "created": "2019-11-27T20:28:36.996Z",
  "account": "1cb0c0ba-62f8-47aa-bb95-7f4f92207472"
}
```

### DELETE /token/:id
#### request
`:id` (UUID) Token identifier
#### response
```json
{
  "id": "e7642ef6-7af2-4340-83cd-77209590cda1",
  "created": "2019-11-27T20:28:36.996Z",
  "account": "1cb0c0ba-62f8-47aa-bb95-7f4f92207472"
}
```