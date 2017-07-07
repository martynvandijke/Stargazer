
<p align="center">
<img src="/images/power.png" width="200">
</p>

<p align="center">
<img src="/images/name.png" width="600">
</p>

This repository contains all the work done for the Bachelor End Project (BEP) assignment: A Web Application For The Simulation Of Day-Ahead Energy Markets.  
This project is made as an Bachelor Final End project assignment for the Electrical Energy Systems (EES) group of the departement of Electrical Engineering on the TU/e.  
The project provides an web application where users may preform an simulation of the day ahead energy market , using an optimization model to dispatch the electricity in the most optimal way.  
Users may choose multiple models for the optimization explained in [models](#optimization-model)  
The main goal of this project is to provide an easy to use (and modify) web application where users may play with market clearing problems where the overall cost of generators and load are minimized


## Table of contents

* [Demo](#demo)
* [Front-end vs back-end](#front-end-vs-back-end)
* [Name origin](#name-origin)
* [Documentation](#documentation)
* [Optimization model](#optimization-model)
   * [Basic economic dispatch model](#basic-economic-dispatch-model)
   * [Network constrained unit commitment model](#network-constrained-unit-commitment-model)
   * [Stochastic](#stochastic)
* [Getting started](#getting-started)
   * [Getting Python](#getting-python)
   * [Getting a MILP solver for the optimization](#getting-a-milp-solver-for-the-optimization)
   * [Installing the backend of Stargazer](#installing-the-backend-of-stargazer)
   * [Installing the front-end of Stargazer](#installing-the-front-end-of-stargazer)
   * [Running Stargazer](#running-stargazer)
* [To-do](#to-do)
* [Changelog](#changelog)



## Demo

Below is an gif which serves as an demonstration of how Stargazer works  

<p align="center">
<img src="/images/demo.gif" width="600">
</p>

## Front-end vs back-end

Stargazer consists of two main parts namely the front-end written in *React* and the back-end is written in *Python3* using *Pyomo* & *[PyPSA](https://github.com/FRESNA/PyPSA)*  
*NodeJs* is further used to compile the *React* files to browser render-able Javascript files  
In short the global overview of the application may be given by the figures below

<p align="center">
<img src="/images/call.png" width="600">
</p>



## Name origin

This project is named after a venomous fish called [Stargazer](https://en.wikipedia.org/wiki/Stargazer_(fish))  
The fish has electricity conducting organs and is able to send an electric shock to its surroundings  
This electric *link* is the reason the project is named after the Stargazer




## Documentation

Documentation may be found in multiple forms
code documentation can be found by going to [docs](https://marynvandijke.github.io/Stargazer) an pdf and epub version of the code documentation may be found in the
[docs](/docs/build) folder  
A [paper](/docs/paper/backend-paper.pdf) regarding the also be found in the *docs* folder and is written in the *IEEE* paper style  


## Optimization model

The web application is currently capable of optimizing using

* Basic economic dispatch model
* Network constrained unit commitment model

A third model, the _stochastic programming joint market clearing model_ is proposed to be added to Stargazer.  
For more in depth information about the inner workings of the model please read the [paper](/docs/paper/backend-paper.pdf)

### Basic economic dispatch model

The basic economic dispatch model preforms an optimization with an reduced set of constrains  
The goal of the optimization proces is to minimize the overall cost of the powerplant, given the constrained parameters


$$
 \text{minimize} } \quad &  \sum_{t}  \sum_{i} c_i \cdot p_{i,t}
$$
$$
\text{subject to}\quad & \sum_{i}  p_{i,t}  = \sum_j l_{t,t} \hspace{.5cm} \forall\, t
$$
$$
p_{i}^{min} \leq p_{i,t} \leq p_{i}^{max} \hspace{.5cm} \forall\,i,t
$$

### Network constrained unit commitment model

The network constrained model , models a more real world generator with limitations on the generating output regarding time i.e. ramp up, ramp down, minimum up time, minimum down time   
The network model has been larlgey made around the [PyPSA](https://github.com/FRESNA/PyPSA) framework, and can be modeled using the following equations

$$
\text{minimize} }\quad &
      \sum_{t} \sum_i\sum_n  c_{i}  \cdot {p}_{i,t,n }   + \sum_{t}  \left(c_{i,t,n}^{sd} + c_{i,t,n}^{su} \right)
$$
$$
\text{subject to}\quad & \sum_l K_{nl} f_{l,t} =    \sum_i {p}_{i,t,n}  - \sum_j {l}_{j,t,n}
$$
$$
f_{l,t} = \left|  \frac{\theta_{n,t} - \theta_{m,t} }{x_l} \right|
$$
$$
  f_{l,t} \leq F_l
$$  
$$
  u_{i,t,n} \cdot p_{i,n}^{min} \leq p_{i,t,n} \leq   u_{i,t,n} \cdot p_{i,n}^{max} \hspace{.5cm} \forall\, i,t,n
$$
$$
  \sum_{t'=t}^{t+t^{mu}} u_{i,t',n}\geq t^{mu} (u_{i,t,n} - u_{i,t-1,n})   \hspace{.5cm} \forall\, i,t,n
$$
$$
  \sum_{t'=t}^{t+t^{md}} (1-u_{i,t',n})\geq t^{md} (u_{i,t-1,n} - u_{i,t,n})   \hspace{.5cm} \forall\, i,t,n
$$
$$
-rd_{i,n}  \leq (p_{i,t,n} - p_{i,t-1,n}) \leq ru_{i,n} \hspace{.5cm}  \forall\, i,n
$$
$$
c_{i,t,n}^{sd} \geq c_{i,n}^{sd} (u_{i,t-1,n} - u_{i,t,n})   \hspace{.5cm} \forall\, i,t,n
$$
$$
c_{i,t,n}^{su} \geq c_{i,n}^{su} (u_{i,t,n} - u_{i,t-1,n})   \hspace{.5cm} \forall\, i,t,n
$$

### Stochastic

The stochastic model is at this stage an proposed model and although it has been researched, it is not yet implemented.  
And preforms an two-stage joint reserve and renewable energy optimization model  
Where the uncertainty of renewable energy is optimized by clearing (in advanced) reserves for the renewable energy source  
The model can be desrcibed by the following equations


$$
\underset{c}{\text{minimize} }\quad &
SIC + \sum_w \pi_w \cdot SDC_w + \epsilon
$$
$$
  SIC = \sum_t  \sum_i \Big(   c_{i} \cdot p_{i,t}  +  c_i^{ru} \cdot r_{i,t}^{u}  + c_i^{rd} \cdot r_{i,t}^d \Big) + \sum_t \sum_i \left(c_{i,t}^{sd} + c_{i,t}^{su} \right)
$$
$$
SDC_w = \sum_t \Big(  \sum_i  c_{i} \cdot \left( r_{i,t,w}^u + r_{i,t,w}^d \right) + \sum_j v_j^{lol} \cdot l_{j,t}^{s}  + \sum_w v_w^{ws}  \cdot s_{w,t,s} \Big)
$$
$$
\text{subject to}\quad & 0 \leq r_{i,t}^{u} \leq ru_{i} \cdot u_{i,t} \hspace{.5cm} \forall \, i,t
$$
$$
0 \leq r_{i,t}^{d} \leq rd_{i} \cdot u_{i,t} \hspace{.5cm} \forall \, i,t
$$
$$
0 \leq r_{i,t}^{u} \leq r_{i,t}^{u,max}  \label{eq:schedu} \hspace{.5cm} \forall \, i ,t
$$
$$
0 \leq r_{i,t}^{d} \leq r_{i,t}^{d,max}  \label{eq:schedd}\hspace{.5cm}
$$
$$
0 \leq l_{j,t}^{s} \leq l_{j,t} \label{eq:lvol} \hspace{.5cm} \forall \, j,t,w
$$
$$
0 \leq s_{i,t,w} \leq p_{i,t,w}^{ \varphi} \label{eq:wind} \hspace{.5cm}
\forall \, i,t,s
$$
$$
  0 \leq p_{w,t}^{wp} \leq + \infty \label{eq:pw} \hspace{.5cm} \forall \, w,t
$$
$$
\sum_i p_{i,t} + \sum_w \left( p_{i,t,w}^{ \varphi} - s_{i,t,w} \right) = \sum_j \left( l_{j,t} - l_{j,t}^{s} \right) \label{eq:balance}
$$



## Getting started



### Getting Python


This web application uses python 3
To install python on a debian based machines simply run

    sudo apt-get install  python3

It's always helpful to use a
[virtual environment](https://pypi.python.org/pypi/virtualenv)
for your python installation.



### Getting a MILP solver for the optimization

The web application is known to work with the free MILP solver GLPK and the Cbc solver.  
The backend paper investigated the performance of these solvers.  
For Debian-based systems you can get the Cbc solver with

    sudo apt-get install coinor-cbc

There are similar packages for other GNU/Linux distributions.
For Windows there is [WinGLPK](http://winglpk.sourceforge.net/) and [Cbc](https://www.coin-or.org/download/binary/CoinAll/)



### Installing the backend of Stargazer

If you have the Python package installer installed ( ``pip3``)  just run

    sudo pip3 install -r requirements.txt

Please make sure to install the dependencies for Python 3, since the web application is only compatible with Python 3  
If for some reason you want to manually install the packages that also possible just install :

* pypsa
* numpy
* scipy
* pandas
* networkx
* pyomo
* moreitertools
* Django
* django-webpack-loader


### Installing the front-end of Stargazer

NodeJs can be installed by going to [NodeJs](https://nodejs.org/en/download/)  
To install NodeJs on debian based systems run

    sudo apt-get install node

Make sure to install node version 4.x   
Also webpack is needed wich may be installed using npm

    npm install --save-dev webpack


After installing Node.Js and webpack run

    npm install

Inside the asset (stargazer/assets) folder to compile the React to Javascript  
After the dependencies have been installed make sure to run run

    webpack --config webpack.config.js --watch

In side the asset folder

### Running Stargazer

After you have installed the back-end and the front-end run

    python3 manage.py runserver --nothreading --noreload

To run the web application after this just open [localhost](http://localhost:8000/) *localhost* on port *8000*

## To-do

- [ ] Integrate the stochastic model
- [ ] Rewrite export options

## Changelog

- version 1.0 : first public release
