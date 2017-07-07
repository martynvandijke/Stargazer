
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
code documentation can be found by going to [docs](https://martynvandijke.github.io/Stargazer/) an pdf and epub version of the code documentation may be found in the
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


<p align="center"><img alt="$$&#10; \text{minimize} } \quad &amp;  \sum_{t}  \sum_{i} c_i \cdot p_{i,t}&#10;$$" src="svgs/a2bd3256fc1d16ec7b67ba8bd719f262.png?invert_in_darkmode" align=middle width="183.11205pt" height="36.649305pt"/></p>
<p align="center"><img alt="$$&#10;\text{subject to}\quad &amp; \sum_{i}  p_{i,t}  = \sum_j l_{t,t} \hspace{.5cm} \forall\, t&#10;$$" src="svgs/cdb8f1617615e3d93b8f8f8b5051ef74.png?invert_in_darkmode" align=middle width="249.0609pt" height="38.878455pt"/></p>
<p align="center"><img alt="$$&#10;p_{i}^{min} \leq p_{i,t} \leq p_{i}^{max} \hspace{.5cm} \forall\,i,t&#10;$$" src="svgs/f343ad30e4f7688bea4bc8236f6dd60f.png?invert_in_darkmode" align=middle width="189.2055pt" height="19.06773pt"/></p>

### Network constrained unit commitment model

The network constrained model , models a more real world generator with limitations on the generating output regarding time i.e. ramp up, ramp down, minimum up time, minimum down time   
The network model has been larlgey made around the [PyPSA](https://github.com/FRESNA/PyPSA) framework, and can be modeled using the following equations

<p align="center"><img alt="$$&#10;\text{minimize} }\quad &amp;&#10;      \sum_{t} \sum_i\sum_n  c_{i}  \cdot {p}_{i,t,n }   + \sum_{t}  \left(c_{i,t,n}^{sd} + c_{i,t,n}^{su} \right)&#10;$$" src="svgs/d6046117ea6252b71f8c67699d2314f0.png?invert_in_darkmode" align=middle width="371.0289pt" height="36.649305pt"/></p>
<p align="center"><img alt="$$&#10;\text{subject to}\quad &amp; \sum_l K_{nl} f_{l,t} =    \sum_i {p}_{i,t,n}  - \sum_j {l}_{j,t,n}&#10;$$" src="svgs/b3c4610bc7f38a3bac93cffce8e11496.png?invert_in_darkmode" align=middle width="327.0366pt" height="38.878455pt"/></p>
<p align="center"><img alt="$$&#10;f_{l,t} = \left|  \frac{\theta_{n,t} - \theta_{m,t} }{x_l} \right|&#10;$$" src="svgs/c9937e090953c11027c3497a47a1ce19.png?invert_in_darkmode" align=middle width="133.38633pt" height="39.41553pt"/></p>
<p align="center"><img alt="$$&#10;  f_{l,t} \leq F_l&#10;$$" src="svgs/f62ea95d1bf5520bb6c517ebb80d1c18.png?invert_in_darkmode" align=middle width="58.54266pt" height="16.0677pt"/></p>  
<p align="center"><img alt="$$&#10;  u_{i,t,n} \cdot p_{i,n}^{min} \leq p_{i,t,n} \leq   u_{i,t,n} \cdot p_{i,n}^{max} \hspace{.5cm} \forall\, i,t,n&#10;$$" src="svgs/ead5b49d1a8253d9a3c424f64c65b5d0.png?invert_in_darkmode" align=middle width="313.5594pt" height="20.66592pt"/></p>
<p align="center"><img alt="$$&#10;  \sum_{t'=t}^{t+t^{mu}} u_{i,t',n}\geq t^{mu} (u_{i,t,n} - u_{i,t-1,n})   \hspace{.5cm} \forall\, i,t,n&#10;$$" src="svgs/0ceed9d785668b39dac7fe9b9321ede8.png?invert_in_darkmode" align=middle width="321.1593pt" height="48.66906pt"/></p>
<p align="center"><img alt="$$&#10;  \sum_{t'=t}^{t+t^{md}} (1-u_{i,t',n})\geq t^{md} (u_{i,t-1,n} - u_{i,t,n})   \hspace{.5cm} \forall\, i,t,n&#10;$$" src="svgs/91a96adac52d6ca947f140756bdcdee0.png?invert_in_darkmode" align=middle width="357.58635pt" height="50.830065pt"/></p>
<p align="center"><img alt="$$&#10;-rd_{i,n}  \leq (p_{i,t,n} - p_{i,t-1,n}) \leq ru_{i,n} \hspace{.5cm}  \forall\, i,n&#10;$$" src="svgs/2f87a23d2a91878de5d1775bbfa9e4d6.png?invert_in_darkmode" align=middle width="301.8906pt" height="16.97751pt"/></p>
<p align="center"><img alt="$$&#10;c_{i,t,n}^{sd} \geq c_{i,n}^{sd} (u_{i,t-1,n} - u_{i,t,n})   \hspace{.5cm} \forall\, i,t,n&#10;$$" src="svgs/a3ee8a929e5a37a476712cd7315bd9c2.png?invert_in_darkmode" align=middle width="272.2104pt" height="21.04113pt"/></p>
<p align="center"><img alt="$$&#10;c_{i,t,n}^{su} \geq c_{i,n}^{su} (u_{i,t,n} - u_{i,t-1,n})   \hspace{.5cm} \forall\, i,t,n&#10;$$" src="svgs/1dfed33f35276956505cc017b7d35dc3.png?invert_in_darkmode" align=middle width="272.2104pt" height="18.5757pt"/></p>

### Stochastic

The stochastic model is at this stage an proposed model and although it has been researched, it is not yet implemented.  
And preforms an two-stage joint reserve and renewable energy optimization model  
Where the uncertainty of renewable energy is optimized by clearing (in advanced) reserves for the renewable energy source  
The model can be desrcibed by the following equations


<p align="center"><img alt="$$&#10;\underset{c}{\text{minimize} }\quad &amp;&#10;SIC + \sum_w \pi_w \cdot SDC_w + \epsilon&#10;$$" src="svgs/f36027a8c821b8b8053cc9d790550fd0.png?invert_in_darkmode" align=middle width="266.0394pt" height="36.15843pt"/></p>
<p align="center"><img alt="$$&#10;  SIC = \sum_t  \sum_i \Big(   c_{i} \cdot p_{i,t}  +  c_i^{ru} \cdot r_{i,t}^{u}  + c_i^{rd} \cdot r_{i,t}^d \Big) + \sum_t \sum_i \left(c_{i,t}^{sd} + c_{i,t}^{su} \right)&#10;$$" src="svgs/0bae60050d2b1dcc3f4e474c99d7980d.png?invert_in_darkmode" align=middle width="475.84845pt" height="38.29683pt"/></p>
<p align="center"><img alt="$$&#10;SDC_w = \sum_t \Big(  \sum_i  c_{i} \cdot \left( r_{i,t,w}^u + r_{i,t,w}^d \right) + \sum_j v_j^{lol} \cdot l_{j,t}^{s}  + \sum_w v_w^{ws}  \cdot s_{w,t,s} \Big)&#10;$$" src="svgs/258bedea3470cd5fd2caf1f7f68cb2ce.png?invert_in_darkmode" align=middle width="498.762pt" height="40.52598pt"/></p>
<p align="center"><img alt="$$&#10;\text{subject to}\quad &amp; 0 \leq r_{i,t}^{u} \leq ru_{i} \cdot u_{i,t} \hspace{.5cm} \forall \, i,t&#10;$$" src="svgs/fc9b6bffb0a174329a161e84376e55e5.png?invert_in_darkmode" align=middle width="274.2135pt" height="18.01602pt"/></p>
<p align="center"><img alt="$$&#10;0 \leq r_{i,t}^{d} \leq rd_{i} \cdot u_{i,t} \hspace{.5cm} \forall \, i,t&#10;$$" src="svgs/8c4d08beb3e10bfc8faf8d602fea35fe.png?invert_in_darkmode" align=middle width="185.1432pt" height="21.04113pt"/></p>
<p align="center"><img alt="$$&#10;0 \leq r_{i,t}^{u} \leq r_{i,t}^{u,max}  \label{eq:schedu} \hspace{.5cm} \forall \, i ,t&#10;$$" src="svgs/76b00dc0b7c0e5fe4df989a852f13ec2.png?invert_in_darkmode" align=middle width="174.32085pt" height="19.646385pt"/></p>
<p align="center"><img alt="$$&#10;0 \leq r_{i,t}^{d} \leq r_{i,t}^{d,max}  \label{eq:schedd}\hspace{.5cm}&#10;$$" src="svgs/24b9fd0b2956f4e60fbb51c46fc48cc5.png?invert_in_darkmode" align=middle width="118.36341pt" height="22.67166pt"/></p>
<p align="center"><img alt="$$&#10;0 \leq l_{j,t}^{s} \leq l_{j,t} \label{eq:lvol} \hspace{.5cm} \forall \, j,t,w&#10;$$" src="svgs/3bb49df3e46360342eac927e4000b59b.png?invert_in_darkmode" align=middle width="166.5312pt" height="18.01602pt"/></p>
<p align="center"><img alt="$$&#10;0 \leq s_{i,t,w} \leq p_{i,t,w}^{ \varphi} \label{eq:wind} \hspace{.5cm}&#10;\forall \, i,t,s&#10;$$" src="svgs/19e76c368053714aa942e1e08bc76441.png?invert_in_darkmode" align=middle width="193.0104pt" height="19.646385pt"/></p>
<p align="center"><img alt="$$&#10;  0 \leq p_{w,t}^{wp} \leq + \infty \label{eq:pw} \hspace{.5cm} \forall \, w,t&#10;$$" src="svgs/2894e97096ef5064899dad43370ea4a5.png?invert_in_darkmode" align=middle width="169.38735pt" height="19.10997pt"/></p>
<p align="center"><img alt="$$&#10;\sum_i p_{i,t} + \sum_w \left( p_{i,t,w}^{ \varphi} - s_{i,t,w} \right) = \sum_j \left( l_{j,t} - l_{j,t}^{s} \right) \label{eq:balance}&#10;$$" src="svgs/a11e2cb5dfc256df69a4c6ece23bdbef.png?invert_in_darkmode" align=middle width="326.24955pt" height="38.878455pt"/></p>



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
