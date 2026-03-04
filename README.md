# Budgeteer
This is a responsive, full-stack personal expense tracker for managing day-to-day spending, reviewing trends, and visualising insights.






# Live Demo
Live application: [http://18.135.98.106/](http://18.135.98.106/)
# App in action

## Features
- Sign in/Sign up to the app
- Password reset in the case of a forgotten password, a token is sent to email
- CRUD functionality - create an expense, read/filter expenses, update expenses and delete expenses
- Option to delete the account
- Simple expense analytics via charts
- JWT-based authentication
- App dockerised and deployed via AWS EC2


## Tech Stack

### Frontend

- React and Typescript
- Bootstrap CSS

### Backend

- Java (Springboot)
- PostgreSQL

### Deployment

- Docker
- AWS EC2 


## How to run it locally 

### 1) Prerequisites

- Install Docker

### 2) 

```bash
docker compose up --build
```
`http://localhost:5173`

### 3) Access services

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5001/api/health`
- PostgreSQL: `localhost:5433`


# Author 
Victor Adams