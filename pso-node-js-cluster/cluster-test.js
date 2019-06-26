    
// #!/usr/bin/node
/**
 * This example shows that many PSO instances can be run in parallel.
 * https://github.com/nl253/PSO-JS/blob/master/examples/parallel.js
 */


const cluster = require('cluster');
const fs = require('fs');
const crypto = require("crypto");
// const numCPUs = require('os').cpus().length;
const numCPUs = 1;

let sessionID = crypto.randomBytes(10).toString('hex');
const functionType = "Rosenbrock"
const PSO_PARTICLES_NUM = 100;

// main thread dispatches
if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
        console.log(`worker #${i} started`);
        let worker = cluster.fork();
        worker.send({sessionID:sessionID, cpuID: i});
  }
  //process.exit(0);
} 

// ==============================
// CLUSTER CODE
// ==============================

if(cluster.isWorker){


    // CSV row object: sessionID,iterations,time,cpu,cpuID,value,point,findType,functionType
    const msgObj = {
        sessionID: 'NA',
        iterations: 'NA',
        time: 'NA',
        cpu: numCPUs,
        cpuID: 'NA',
        value: 'NA',
        point: 'NA',
        findType: 'NA',
        functionType: functionType,
        particleNum: PSO_PARTICLES_NUM
    }

    // Receive messages from the master process.
    process.on('message', function(msg) {
        msgObj.sessionID = msg.sessionID;
        msgObj.cpuID = msg.cpuID;
        console.log(msg)
    });

    const pso = require("./particle-swarm-optimization");
    const config = 	{
        inertiaWeight: 0.4,
        social: 0.8,
        personal: 0.2,
        pressure: 0.5
    }
    
    const optimizer = new pso.Optimizer();
    optimizer.setOptions(config)
    
    optimizer.setObjectiveFunction(function (x, done) {
        setTimeout(function () {
        // done(Math.pow(x[0],2) + Math.pow(x[1],2));        
        done(-(Math.pow(1-x[0],2) + 100*Math.pow(x[1]-x[0]*x[0],2)));                
            },  0);
        }, { async: true }
    );
            
            

    let t0 = Date.now();
    const initialPopulationSize = PSO_PARTICLES_NUM;
    const domain = [new pso.Interval(-100, 100), new pso.Interval(-100, 100)];
    optimizer.init(initialPopulationSize, domain);
    let iterations = 0;
    const maxIterations = 10000;
    let lastBestResult = null;
    
    function saveResult(msg){
        let msgRow = `\n${msg.sessionID},${msg.iterations},${msg.time},${msg.cpu},${msg.cpuID},${msg.value},"(${msg.point.toString()})",${msg.findType},${msg.functionType},${msg.particleNum}`;
        fs.appendFile("./result.csv", msgRow, (err) => {
            if(err) {
                return console.log(err);
            } else {
                console.log(msgRow);
                process.exit(0);
            }
        }); 
    }
    
    function loop() {
        if(lastBestResult && (Math.abs(0 - optimizer.getBestFitness()) < 1e-4 )){
            msgObj.iterations = iterations;
            msgObj.time =  Date.now() - t0;
            msgObj.value = optimizer.getBestFitness();
            msgObj.point = `${optimizer.getBestPosition()}`;
            msgObj.findType = "FIND_OPTIMUM";
            saveResult(msgObj);            
        } else if (iterations >= maxIterations) {
            msgObj.iterations = iterations;
            msgObj.time =  Date.now() - t0;
            msgObj.value = optimizer.getBestFitness();
            msgObj.point = `${optimizer.getBestPosition()}`;
            msgObj.findType = "ITERATION_LIMIT";
            saveResult(msgObj);
        } else {
            iterations++;
            lastBestResult = optimizer.getBestFitness();
            optimizer.step(loop);
        }
    }
    
    loop();
}