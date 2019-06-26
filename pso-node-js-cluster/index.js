const pso = require("./particle-swarm-optimization");
const fs = require('fs');


// create the optimizer

console.log("HELLO")

const config = 	{
    inertiaWeight: 0.4,
    social: 0.8,
    personal: 0.4,
    pressure: 0.5
}

const optimizer = new pso.Optimizer();
optimizer.setOptions(config)

optimizer.setObjectiveFunction(function (x, done) {
    setTimeout(function () {
        // done(Math.pow(x[0],2) + Math.pow(x[1],2));
        // done(  -(Math.pow(x[0],2) + Math.pow(x[1],2) ));

        done(
            -(Math.pow(1-x[0],2) + 100*Math.pow(x[1]-x[0]*x[0],2))
        );

        // done(
        //     -Math.pow(x[0] + x[1], 2)
        // );
        
    }, // Math.random() * 800 + 20
    0);
}, {
    async: true
});

const initialPopulationSize = 70;
// const domain = [new pso.Interval(-1000, 1000)];
const domain = [new pso.Interval(-10, 10), new pso.Interval(-10, 10)];

optimizer.init(initialPopulationSize, domain);

let iterations = 0;
const maxIterations = 10000;
let lastBestResult = null;

function saveResult(){

}

function loop() {

    
    if(lastBestResult && (Math.abs(0 - optimizer.getBestFitness()) < 1e-5 )){
    // if(lastBestResult && (Math.abs(0 - optimizer.getBestFitness()) < 10 )){
        
        console.log(`======== iteration ${iterations}`)
        console.log(`lastBestResult => ${lastBestResult}`)
        console.log(`optimizer.getBestFitness() => ${optimizer.getBestFitness()}`)
        console.log(`${Math.abs(lastBestResult - optimizer.getBestFitness())}`)
        
        fs.writeFile("./test", `>> iteration ${iterations}`, (err) => {
            if(err) {
                return console.log(err);
            }
        }); 

        console.log('Best solution found', optimizer.getBestFitness());
        console.log(`${iterations}/${maxIterations}`);
    } else if (iterations >= maxIterations) {
        console.log('Best solution found', optimizer.getBestFitness());
        console.log('at', optimizer.getBestPosition());
    } else {
        iterations++;
        lastBestResult = optimizer.getBestFitness();
        optimizer.step(loop);
    }
}

loop();

