################
  Tutorial
################

To use the web application visit ..
Here you will be greeted with an welcome screen that should be similar with

Getting Started
====================================================

To get started choose the model of your liking.
1. Simple
2. Network
3. Stochastic

Choose the model you want to start with.
Data between models may not be shared, and needs to be manually transferred.
Please be carefull when choosing your model !

What it can do
====================================================
This web application can do :

* Market clearing
* Optimal network dispatching
The difference between the two models is explained here :


Simple
**********************
The elemnetaqry model can calculated :

* Nominal power
* Minimum power
* Naximum power

Network
**********************
The network constrained model can calculate :

* Nominal power
* Minimum power
* Maximum power
* Ramp up/ ramp down limits
* Min/max up / down time
* Initial capital cost optimization
* Start up / Start down cost optimization
* Load flow calculations (reactive power)
* Capital cost optimization
* Maximum voltage angle
* Minimum voltage angle

Using the web application
====================================================
After you have chosen the model you want to use, you are greeted by a screen similar to this

INSERT IMAGE

You can save data to the server by clicking the option and the save button
To retrieve the stored data click the option and the get button

Once you have drawn your desired layout, and made sure that all desired inputs are given.
Click on the run button to send the frontend data to the  backend for the optimization.
Depending on the amount of generators, loads and busses it may take some time 0- 10/20 s to calculate the optimum.
If the desired network is not possible you will be presented by an error screen, if this is not the case you will recieve the output.
