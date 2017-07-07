################
 Installation
################


Getting Python
==============

This web application uses python3
To install python on a debian based linux machine simply run::

  sudo apt-get install python3


it's always helpful to use a `virtual environment
<https://pypi.python.org/pypi/virtualenv>`_ for your python
installation.



Getting a solver for linear optimisation
====================================================

The web app is known to work with the free software GLPK.
The web application should also work using the Gurobi software (and whatever else Pyomo works with).

For Debian-based systems you can get GLPK with::

    sudo apt-get install glpk-utils

There are similar packages for other GNU/Linux distributions.
For Windows there is `WinGLPK <http://winglpk.sourceforge.net/>`_. For
Mac OS X `brew <http://brew.sh/>`_ is your friend.


Installing the backend of the web app
=================================================

If you have the Python package installed ( ``pip3``)  just run::

   sudo pip3 install -r requirements.txt

Please make sure to install the dependencies for Python 3, since the web application is programmed in Python 3

Backend dependencies
=====================================

The web application relies on the following packages which are not contained in a
standard Python installation:

* pypsa
* numpy
* scipy
* pandas
* networkx
* pyomo
* moreitertools
* Django

Using above installation technique these packages are installed.

Getting Nodejs
=====================================================
NodeJs can be installed by going to `NodeJs<https://nodejs.org/en/download/ >`_
To install NodeJs run ::

    sudo apt-get install node

Also webpack is needed wich may be installed using npm::

  sudo npm install webpack -g

After installing Node.Js and webpack run ::

  npm install

In the asset folder located in mysite/assets

Also make sure to run ::

  webpack --config webpack.config.js --watch

In side the asset folder
