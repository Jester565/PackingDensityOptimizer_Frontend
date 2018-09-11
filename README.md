# PackingDensityOptimizer_Frontend
A React.js frontend for the [PackingDensityOptimizer_Backend](https://github.com/Jester565/PackingDensityOptimizer_Backend).  Allows you to start GPU-enabled VMs, run and display 2D and 3D simulations, and download and view simulation results.

## Cloud Configuration
If you want to use your own AWS account you have to do a couple things
<br/>
You must edit [AuthManager](https://github.com/Jester565/PackingDensityOptimizer_Frontend/blob/02df2478d6405918d59fc298267a5ac5ee29a93b/src/AuthManager.js) to point to your Cognito user pool.
<br/>
You must edit [Simulation](https://github.com/Jester565/PackingDensityOptimizer_Frontend/blob/02df2478d6405918d59fc298267a5ac5ee29a93b/src/Simulation.js#L42) to point to your SQS queue.
<br/>
## Running
```
npm install
npm run
```

## Deploying
```
npm build
```
