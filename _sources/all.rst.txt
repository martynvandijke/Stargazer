####################################
  Explanation of front and backend
####################################
This section will dive into the intergration of the frontend and backend of the overall system.


Overview
====================================================
The figure below will provide an overview of the system hierachy, this figure also indicates how the diffrent systems (Python & Node.Js) are interconnected and operate.
Using this figure the overall structure of the web application should become clear.

.. figure::  figures/overview.png
    :align: center
    :height: 600px
    :alt: Hierachy overview
    :figclass: align-center


Backend Pyton
====================================================
The backend is writen in Python 3.5 and may be digisted further.
It consist as seen in the overview of two main part's the Django web server and the simple & network case.
The simple and network case are programmed in one 'EconomicDispatcher'.

Django
******************

Django ensure that all html request are handled well, and is a web server framework.
Django process the html requested and handles the data transfer from the front end to the backend and vice versa.
Django also provides the simple session based storage.
All html request are first handled by Django, and if an action is coupled to the html request Django will initiate that action.

.. figure::  figures/django.png
                :align: center
                :height: 600px
                :alt: Hierachy overview of django backend
                :figclass: align-center




EconomicDispatcher
*********************

The inner workings of the 'EconomicDispatcher' may be seen in this figure
An more in depth look into the simple and network case is made in ..

.. figure::  figures/EconomicDispatcher.png
                :align: center
                :width: 800px
                :alt: Hierachy overview
                :figclass: align-center

Frontend Node.Js
====================================================


.. figure::  figures/jsoverview.png
                :align: center
                :width: 800px
                :alt: Hierachy overview
                :figclass: align-center

.. figure::  figures/Toolbox.png
                :align: center
                :width: 800px
                :alt: Hierachy overview
                :figclass: align-center

.. figure::  figures/Workbench.png
                :align: center
                :width: 800px
                :alt: Hierachy overview
                :figclass: align-center
