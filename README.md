# HackerNewsProject
Three implementations of the Hacker News landing page

Each folder contains a separate project. Please clone the entire repo, change to the appropriate directory, and
follow the instructions below:

**d3 and jQuery**

First `npm install` and `gulp build`. Then run `npm start` and move to `localhost:8000`.

Both of these projects use Angular to help organize the two states: topNews and Newest (which correspond to the landing page and new page respectively). The implementations of d3 and jQuery logic are located in `client/topNews/topNews.controller.js` or `client/newest/newest.controller.js`. Additionally, `client/service/hackernewsFactory.js` contains the call to the Hacker News Firebase API.

**React**

First `npm install`. Then run `npm start` and move to `localhost:8000`.

This was my first project with React. `public/js/main.js` contains the entire implementation.


**Notes and Potential Improvements**

For the d3 and jQuery projects, Angular was used for convenience and modularity. There are several improvements that can be made:
  - The helper functions should be moved into a factory.
  - The adding of HTML elements as strings could be condensed and moved into a function.
  - The first HackerNews API call can possibly be moved into a state resolve.
  - There are potential issues with not removing the Firebase listeners when moving to a new state.

For React:
  - The file structure needs to be expanded and made more modular.
  - The HackerNews API call should probably be moved to a service.
