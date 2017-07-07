####################################
  Network model
####################################

The network model is largely implemented in PyPSA it is recommend to read the full PyPSA documentation first.
Wich can be found at ..


Components
***********

Below you will find the components used in the web application, this list is a narrow sub list of the PyPSA documentation

.. csv-table::
    :header-rows: 1
    :file: components.csv

Network
=======

The ``Network`` is the overall container for all components.

.. csv-table::
      :header-rows: 1
      :file: component_attrs/networks.csv


Bus
===

The bus is the fundamental node of the network, to which components
like loads, generators and transmission lines attach. It enforces
energy conservation for all elements feeding in and out of it  (i.e. like Kirchhoff's Current Law).



.. csv-table::
         :header-rows: 1
         :file: component_attrs/buses.csv



Generator
=========

.. csv-table::
      :header-rows: 1
      :file: component_attrs/generators.csv

Lines
=========



.. csv-table::
      :header-rows: 1
      :file: component_attrs/lines.csv

Loads
=========



.. csv-table::
        :header-rows: 1
        :file: component_attrs/loads.csv

.. Load Flow
.. ***********
