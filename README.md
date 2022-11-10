# Jantar Lights
I created this project as motivation and an opportunity to learn React, Redux, redux-observable, and Firebase.

See this project in action at https://jantar-lights.vercel.app/. Feel free to create an account, and then click "Configure Lights" to see it in action.

## Motivation
The housing block I live in has an art installation on the wall - a circular grid of LED lights, which can be set to any color.

I hope that in the future, inhabitants of my housing block can submit their own designs to be displayed on the side of our home using this app.

## Notable features
- Fully typed in TypeScript
- [Auth](src/atoms/auth.ts) using Firebase
- [Persistence](src/atoms/firestore.ts) using Firestore
- [Drag to select](src/atoms/Drag) implemented on both desktop and mobile.
- [Global state](src/atoms/store.ts) powered by redux.
- Redux-observable used to power complex reactive behavior like
    - trigerring data [fetch](src/atoms/colorConfig.ts#L121) and [push](src/atoms/colorConfig.ts#L154)
    - emitting [success and error toasts](src/atoms/notificationsList.ts#L51)

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
