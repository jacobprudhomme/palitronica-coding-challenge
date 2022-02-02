# Palitronica Coding Challenge

First, you must fill in the `.env` file in the root with the values of your choice:
- You will not need to touch `COMPOSE_PROJECT_NAME`, nor `DB_USER`&mdash;the name of the PostgreSQL user to be created&mdash;and `WEB_PORT`&mdash;the port on which the frontend interface will be exposed&mdash;as these have defaults set. Though, you can change these last two if you want.
- You will need to decide on a password for the PostgreSQL user that will be created, as well as a name for the database the project will use.
- You will need to acquire an API key for TaxJar and set it here.

To get everything up and running, run `docker-compose up --build`. On subsequent runs, `docker-compose up` suffices. The API is exposed on port 3000 (though you will not be able to access it directly due to CORS security settings being on), and the frontend uses port 80 by default.

If you see something about port 80 being taken when trying to start the containers at the above step, choose another value for `WEB_PORT`. Ports in the ~`5000` and ~`8000` range are usually free.

Visit `http://localhost:<WEB_PORT>` in your browser to visit the app.
