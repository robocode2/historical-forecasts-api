# Your Project Name

## Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Comment out the property `userCredentials: UserCredentials` in `node_modules/@loopback/authentication-jwt/dist/models/user.model.d.ts`.

4. Create two local postgreSQL databases "libraryapp_dev" and "libraryapp_test". 

5. Add your DB_USER and DB_PASSWORD to the .env.example file provided. 

6. Use `.env.example` file in the root directory of your project as your .env file. 


## Database Setup

1. You're set up now. You can always run the following command to reset the development database (ensure you have PostgreSQL installed):

    ```bash
    npm run db:reset
    ```

2. Change `NODE_ENV` in the `.env` file to "test".

3. Run the following command again to reset the test database:

    ```bash


## Tests 

Tests can be run with 

 ```bash
    npm run build && npm run test
    ```
