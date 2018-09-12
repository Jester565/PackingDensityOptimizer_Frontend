# PackingDensityOptimizer_Frontend
Try [the website](http://circweb.s3-website-us-west-2.amazonaws.com/) yourself and follow the tutorial below!

A React.js frontend for the [PackingDensityOptimizer_Backend](https://github.com/Jester565/PackingDensityOptimizer_Backend).  Allows you to start GPU-enabled VMs, run and display 2D and 3D simulations, and download and view simulation results.

## Tutorial
1. Login with guest credentials  
      Username: guest  
      Password: Guest2018!
2. Goto the VMS tab (loading VM page can take up to 10 seconds) -> instance-1 -> Start
    <br/>
    ![Step2](/rdme/circ1.png)
3. Goto the 2D SIMS tab -> Add Manual Sim
    <br/>
    ![Step3](/rdme/circ2.png)
4. Click the blue add button to add powder size and count (for fast results, keep under 500 and use default precision)
    <br/>
    ![Step4](/rdme/circ3.png)
5. Click submit to view simulation result (can take up to 30 seconds depending on input)
    <br/>
    ![Step5](/rdme/circ4.png)
6. All simulation data can be seen in the Historical Tab
7. You can try the 3D simulation by following steps 3 to 5 with the 3D SIMS tab (keep under 100)
    <br/>
    ![Step7](/rdme/three.png)

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