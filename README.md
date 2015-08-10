# HackerNewsProject
Three implementations of the Hacker News landing page

Each folder contains a separate project. Please clone the entire repo, change to the appropriate directory, and
follow the instructions below:

**d3 and jQuery**

First `npm install` and `gulp build`. Then run `npm start` and move to `localhost:8000`.

Both of these projects use Angular to help organize the two states: topNews and Newest. The actual implementations of d3 and jQuery logic is located in `client/topNews/topNews.controller.js` or `client/newest/newest.controller.js`. Additionally, `client/service/hackernewsFactory.js` contains the call to the Hacker News Firebase API.

**React**

First `npm install``. Then run `npm start` and move to `localhost:8000`.

This was my first project with React. `public/js/main.js` contains the entire implementation.


**Notes and Potential Improvements**
