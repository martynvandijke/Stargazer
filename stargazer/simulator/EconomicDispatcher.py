'''
    Economic Dispatcher

    Purpose of this module is to dispatch between the different types of economic dispatchers and calculated the minimum
    objective function

'''
from __future__ import print_function, division
import pandas
from pyomo.environ import *
import pypsa
import numpy as np
from pyomo.environ import Constraint
import pandas
import matplotlib.pyplot as plt
from  more_itertools import unique_everseen
import zipfile
import time
import datetime
import os
import pandas as pd
import logging
import re
import io
import glob


logger = logging.getLogger("exampleApp")
logger.setLevel(logging.INFO)

# create the logging file handler
fh = logging.FileHandler("logs/model.log")
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)

# add handler to logger object
logger.addHandler(fh)
logger.info("Economic dispatcher started")

#debug settings
debug = True
zip = False
class Output():
    logger.info("Writing the output")
    def zipdir(path, ziph):
        '''
        Function that stores the raw output of a folder in a zip file

        Args:
            path: folder path to be zipped
            ziph: zip handler

        Returns:

        '''
        for root, dirs, files in os.walk(path):
            for file in files:
                ziph.write(os.path.join(root, file))

    def NetworkExport(network):
        import glob, os
        test = 'json_out/*'
        r = glob.glob(test)
        for i in r:
            os.remove(i)
        StaticOutput = []
        VaryingOutput = []
        allowed_types = [float, int, str, bool] + list(np.typeDict.values())
        columns = [attr for attr in dir(network) if
                   type(getattr(network, attr)) in allowed_types and attr != "name" and attr[:2] != "__"]
        index = [network.name]
        df = pd.DataFrame(index=index, columns=columns, data=[[getattr(network, col) for col in columns]])
        df.index.name = "name"
        print(df)
        for component in pypsa.components.all_components - {"SubNetwork"}:

            list_name = network.components[component]["list_name"]
            attrs = network.components[component]["attrs"]
            df = network.df(component)
            pnl = network.pnl(component)

            '''
            Export static attributes
            '''
            df.index.name = "name"
            if df.empty:
                continue
            col_export = []
            for col in df.columns:
                # do not export derived attributes
                if col in ["sub_network", "r_pu", "x_pu", "g_pu", "b_pu"]:
                    continue
                if col in attrs.index and pd.isnull(attrs.at[col, "default"]) and pd.isnull(df[col]).all():
                    continue
                if col in attrs.index and (df[col] == attrs.at[col, "default"]).all():
                    continue

                col_export.append(col)

            df[col_export].to_json("json_out/" + list_name + ".json")

            '''
            Export varying attributes
            '''
            for attr in pnl:
                if attr not in attrs.index:
                    col_export = pnl[attr].columns
                else:
                    default = attrs.at[attr, "default"]

                    if pd.isnull(default):
                        col_export = pnl[attr].columns[(~pd.isnull(pnl[attr])).any()]
                    else:
                        col_export = pnl[attr].columns[(pnl[attr] != default).any()]

                if len(col_export) > 0:
                    pnl[attr].loc[:, col_export].to_json("json_out/" + list_name + "-" + attr + ".json")

        ts = time.time()
        '''
        If zip option is selected
        '''
        if zip:
            zipf = zipfile.ZipFile(
                'zips_out/csvdata' + "-" + datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S') + '.zip', 'w',
                zipfile.ZIP_DEFLATED)
            Output.zipdir('json_out', zipf)
            zipf.close()

        return StaticOutput, VaryingOutput




class Simple():
    '''
    Simple optimization problem, using only 3 basic constrains: Unit, Balance , Cost

    Args:
        file : file to be loaded with all the data
        solver : string that defines which optimization solver to be used e.g. the free software GLPK or the commercial software Gurobi

    Returns:

    '''


    def Main(Pmax,Pmin,CostsOrdered,LoadP):
        '''
        Main function of the simple network model

        Returns:
            solotion

        '''
        logger.info("Started the simple model")
        model = Simple.Model(Pmax,Pmin,CostsOrdered,LoadP)
        #model.system_balance = Constraint(rule=Simple.BalanceRule(model, model.T))
        #model.unitoutputcons = Constraint(rule=Simple.UnitRule(model,model.I, model.T,))
        model.cost = Objective(rule=Simple.CostRule, sense=minimize)
        results = Simple.Solver(model)
        print(results)
        Simple.Printer(model)
        return results

    def Solver(model):
        '''
        Solves the linear objective function

        Returns:
            results
        '''
        opt = SolverFactory('glpk')
        results = opt.solve(model)
        return results

    def Printer(model):
        '''
        For debugging purpose only prints the output of the result if the debug option has been set
        '''
        print('Objective function', model.cost())  # objective function value
        for t in model.T:
            print('---', t, '---')
            for i in model.I:
                print(i, model.P[i, t].value)
        print('---')

    def Load():
        '''
            Function that loads the data from an excel sheets in order to further process it.
        '''
        UnitData = pandas.read_excel('test.xlsx', sheetname='unit')
        Load = pandas.read_excel('test2.xlsx', sheetname='load')
        return UnitData, Load

    def Model(Pmax,Pmin,CostsOrdered,LoadP):
        '''
        Initialises the model in the pyomo framework
        '''

        model = ConcreteModel()
        '''
        Call the load function
        '''
        #[UnitData, Load] = Simple.Load()

        for i in range(0,len(Pmax)):
            s = str(Pmax[i])
            Pmax[i] = s[1:-1]
            Pmax[i] = float(Pmax[i])
            s = str(Pmin[i])
            Pmin[i] = s[1:-1]
            Pmin[i] = float(Pmin[i])

        for i in range(0,len(LoadP)):
            s = str(LoadP[i])
            LoadP[i] = s[1:-1]
            LoadP[i] = float(LoadP)

        print("test data:")
        data = {
            'Pmin':Pmin,
            'Pmax':Pmax,
            'Cost':CostsOrdered,
        }
        Generator = pd.DataFrame(data,columns=['Pmin','Pmax','Cost'])
        Generator.reindex(['i1','i2'])
        #Generator.set_index( [('i1','i2'),('Pmin','Pmax','Cost')] )
        print(Generator)
        print(Generator.index)

        data = {
            'LoadP':LoadP,
        }

        Load = pd.DataFrame(data)
        print(Load)
        print(Load.index)

        Load.to_excel('test2.xlsx','load')
        Generator.to_excel('test.xlsx','unit')
        # [UnitData, Load] = Simple.Load()


        '''
            Define the discrete time that is used, and  define the generators
        '''
        print(Generator.index)
        model.I = Set(ordered='True', initialize=Generator.index)
        model.T = Set(ordered='True', initialize=Load.index)
        print("model T:")
        print(model.T)
        '''
            Define the model parameters
        '''
        print("testing")
        print(Generator.Pmax.to_dict())

        def s_validate(model, v, i):
            print(v)
            print(float(v))
            print(model)

            return int(v)

        model.Pmin = Param(model.I, initialize=Generator.Pmax.to_dict() )
        model.Pmax = Param(model.I, initialize=Generator.Pmin.to_dict()  )
        model.Cost = Param(model.I, initialize=Generator.Cost.to_dict()  )
        model.Load = Param(model.T, initialize=Load.LoadP.to_dict() )
        print("model load")
        print(model.Load)
        '''
           Define the decision variables
        '''
        model.P = Var(model.I, model.T, within=PositiveReals)
        Constraint(sum(sum(model.Cost[i] * model.P[i, t] for i in model.I) for t in model.T) )
        #Constraint(model.Pmin[i] <= model.P[i, t] <= model.Pmax[i])
        #Constraint(sum(model.P[i, t] for i in model.I) == model.Load[t])

        return model

    def CostRule(model):
        '''
            Defining the cost rule that pyomo uses
                .. math::

                        \sum_{t=1}^{t=t_{end}} \Big( \sum_{i=1}^{i=j} P_{cost}[i] \cdot P[i,t]  \Big)

            where :math:`t_{end}` is the end time of the series, :math:`P_{cost}[i]` is the cost of generator at place i (e.g. the i th generator)
            :math:`P[i,t]` is the power that can be generated by an generator at time :math:`t`

        '''
        return sum(sum(model.Cost[i] * model.P[i, t] for i in model.I) for t in model.T)

    def UnitRule(model, i, t):
        '''
            Power delivered from the generator on time interval :math:`t` cannot be larger then maximum power of the generator and should be higher then the minimum power the generator must deliver
                   .. math::

                        P_{min}[i] \leq P[i,t] \leq P_{max}[i]

            Where :math:`P_{min}[i]` is the minimum power generator i can deliver , :math:`P[i,t]` is the desired power at time :math:`t`  ,  :math:`P_{max}[i]` is the maximum power generator i can deliver
        '''
        return model.Pmin[i] <= model.P[i, t] <= model.Pmax[i]

    def BalanceRule(model, t):
        '''
            Generated power and load needed should be matched, the sum off all the powers at a time instance :math:`t` needs to match the load at an time instance :math:`t`
                           .. math::

                                \sum_{i=1}^{i=j}  P[i,t]  = Load[t]

             Where :math:`Load[t]` is the load at time instance :math:`t`

        '''
        t = model.T
        return sum(model.P[i, t] for i in model.I) == model.Load[t]



class Network:
    '''
       Network constrained optimization problem

       Args:
           file
           solver

       Returns:
           solotion : Json file with simple marketclearing

    '''

    def Main(model,
            ElectricLines , ElectricLinesR, ElectricLinesC, ElectricLinesX, Buss, BussVnom, BussType, BussVset, BussVmax, BussVmin, BussConnection ,
            ElectricLinesCcap, ElectricLinesL, ElectricLinesPhaseShift, ElectricLinesAngMax, ElectricLinesAngMin, ElectricLinesLength, ElectricLinesConnection ,ElectricLinesPmax, Generators,
            CostsOrdered, PnomOrdered, RampUp, RampDown, Effciency, MinDownTime, MaxDownTime,  PminOrdered, GeneratorConnection , Time,
            PowerBlocks, PmaxOrdered, StartUpCost, ShutdownCost, Initstatus, CapCost, PsetPoint,  QsetPoint, Loads, LoadP, LoadQ, LoadTime, LoadConnection, options):
        '''
            Main network function that calls necessary network functions

        Args:
            ElectricLines (): Pandas Data Framework from the frontend
            ElectricLinesR (): Pandas Data Framework from the frontend
            ElectricLinesC (): Pandas Data Framework from the frontend
            ElectricLinesX (): Pandas Data Framework from the frontend
            Buss (): Pandas Data Framework from the frontend
            BussVnom (): Pandas Data Framework from the frontend
            BussType (): Pandas Data Framework from the frontend
            BussVset (): Pandas Data Framework from the frontend
            BussVmax (): Pandas Data Framework from the frontend
            BussVmin (): Pandas Data Framework from the frontend
            BussConnection ():
            ElectricLinesCcap (): Pandas Data Framework from the frontend
            ElectricLinesL (): Pandas Data Framework from the frontend
            ElectricLinesPhaseShift (): Pandas Data Framework from the frontend
            ElectricLinesAngMax (): Pandas Data Framework from the frontend
            ElectricLinesAngMin (): Pandas Data Framework from the frontend
            ElectricLinesLength (): Pandas Data Framework from the frontend
            ElectricLinesConnection (): Pandas Data Framework from the frontend
            ElectricLinesPmax (): Pandas Data Framework from the frontend
            Generators (): Pandas Data Framework from the frontend
            CostsOrdered (): Pandas Data Framework from the frontend
            PnomOrdered (): Pandas Data Framework from the frontend
            RampUp (): Pandas Data Framework from the frontend
            RampDown (): Pandas Data Framework from the frontend
            Effciency (): Pandas Data Framework from the frontend
            MinDownTime (): Pandas Data Framework from the frontend
            MaxDownTime (): Pandas Data Framework from the frontend
            PminOrdered (): Pandas Data Framework from the frontend
            GeneratorConnection (): Pandas Data Framework from the frontend
            PmaxOrdered (): Pandas Data Framework from the frontend
            StartUpCost (): Pandas Data Framework from the frontend
            ShutdownCost (): Pandas Data Framework from the frontend
            Initstatus (): Pandas Data Framework from the frontend
            CapCost (): Pandas Data Framework from the frontend
            PsetPoint (): Pandas Data Framework from the frontend
            QsetPoint (): Pandas Data Framework from the frontend
            Loads (): Pandas Data Framework from the frontend
            LoadP (): Pandas Data Framework from the frontend
            LoadTime (): Pandas Data Framework from the frontend
            LoadConnection (): Pandas Data Framework from the frontend
            options (): Pandas Data Framework from the frontend

        Returns:

        '''




        logger.info("Network model started")
        '''
        Calculate how many time stamps there are
        '''
        '''
        Initilize the pypsa network
        '''
        network = pypsa.Network()

        '''
        Set time indexes of the network component
        '''
        print(Time[0])
        s = str(Time[0])
        Time = s[1:-1]
        Time = Time.split(',')
        if len(Time) > 2:
            network.set_snapshots(range(0,(len(Time))))
            Time = True
        else:
            Time = False
        print(network.snapshots)

        '''
        Add the busses to the network
        '''
        Network.BussesAdder(network, Buss, BussVnom, BussVmax, BussVmin, BussVset, BussType)
        '''
        Add the electric lines to the network
        '''
        Network.ElectricLinesAdder(network, ElectricLines, ElectricLinesR, ElectricLinesX,  ElectricLinesCcap,
            ElectricLinesL, ElectricLinesPhaseShift, ElectricLinesAngMax, ElectricLinesAngMin,  ElectricLinesLength, ElectricLinesConnection ,ElectricLinesPmax)
        '''
        Add the generators to the network
        '''
        Network.GeneratorAdder(network, Generators,  GeneratorConnection , PnomOrdered, PminOrdered, PmaxOrdered,
            CostsOrdered, RampUp, RampDown, MaxDownTime, MinDownTime, Initstatus, StartUpCost, ShutdownCost, Effciency, CapCost, PsetPoint,  QsetPoint,Time )
        '''
        Add the loads to the network
        '''
        Network.LoadAdder(network, Loads, LoadP, LoadQ, LoadConnection)

        Network.Printer(network)
        '''
        Run the optimalization
        '''
        print("network check")
        print(network.consistency_check())
        StaticOutput, VaryingOutput = Network.lopf(network )
        return StaticOutput, VaryingOutput


    def BussesAdder(network,Buss, BussVnom, BussVmax, BussVmin, BussVset, BussType):
        '''
            Add all the buses to the network component

         Args:
             Buss (): Pandas dataframework from frontend
             BussVnom (): Pandas dataframework from frontend
             BussVmax (): Pandas dataframework from frontend
             BussVmin (): Pandas dataframework from frontend
             BussVset (): Pandas dataframework from frontend
             BussType (): Pandas dataframework from frontend

         Returns:

        '''
        for i in range(0,len(Buss)) :
            network.add("Bus", "electric bus {}".format(Buss[i]),
                        v_nom=BussVnom[i],
                        type=BussType[i],
                        v_mag_pu_set=BussVset[i],
                        v_mag_pu_min=BussVmin[i],
                        v_mag_pu_max=BussVmax[i],
                            )
        print(network.buses)


    def ElectricLinesAdder(network, ElectricLines, ElectricLinesR, ElectricLinesX,  ElectricLinesCcap,
        ElectricLinesL, ElectricLinesPhaseShift, ElectricLinesAngMax, ElectricLinesAngMin,  ElectricLinesLength, ElectricLinesConnection ,ElectricLinesPmax):
        '''
        Add the lines between buses to the network component

        Args:
            network (): pypsa network component
            ElectricLines (): Pandas dataframework from frontend
            ElectricLinesR (): Pandas dataframework from frontend
            ElectricLinesX (): Pandas dataframework from frontend
            ElectricLinesCcap (): Pandas dataframework from frontend
            ElectricLinesL (): Pandas dataframework from frontend
            ElectricLinesPhaseShift (): Pandas dataframework from frontend
            ElectricLinesAngMax (): Pandas dataframework from frontend
            ElectricLinesAngMin (): Pandas dataframework from frontend
            ElectricLinesLength (): Pandas dataframework from frontend
            ElectricLinesConnection (): Pandas dataframework from frontend
            ElectricLinesPmax (): Pandas dataframework from frontend

        Returns:

        '''


        for i in range(0, len(ElectricLines)):
            '''
            Split the lines and add all the individual lines
            '''
            s = str(ElectricLinesConnection[i])
            string = s[1:-1]
            Busses = string.split(',')

            if (len(Busses) != 2):
                continue
            else:

                network.add("Line", "line {}".format(ElectricLines[i]),
                                bus0="electric bus {}".format(Busses[0].lstrip()),
                                bus1="electric bus {}".format(Busses[1].lstrip()),
                                x=ElectricLinesX[i],
                                r=ElectricLinesR[i],
                                g=ElectricLinesL[i],
                                s_nom=ElectricLinesPmax[i],
                                capital_cost=ElectricLinesCcap[i],
                                length=ElectricLinesLength[i],
                                phase_shift=ElectricLinesPhaseShift[i],
                                v_ang_max=ElectricLinesAngMax[i],
                                v_ang_min=ElectricLinesAngMin[i],
                            )
        print(network.lines)




    def GeneratorAdder( network, Generators,  GeneratorConnection , PnomOrdered, PminOrdered,
                        PmaxOrdered, CostsOrdered, RampUp, RampDown, MaxDownTime, MinDownTime,
                        Initstatus, StartUpCost, ShutdownCost, Effciency, CapCost, PsetPoint,  QsetPoint,Time ):
        '''
        Add the generators to the network component

        Args:
            network (): pypsa network component
            Generators (): Pandas dataframework from frontend
            GeneratorConnection (): Pandas dataframework from frontend
            PnomOrdered (): Pandas dataframework from frontend
            PminOrdered (): Pandas dataframework from frontend
            PmaxOrdered (): Pandas dataframework from frontend
            CostsOrdered (): Pandas dataframework from frontend
            RampUp (): Pandas dataframework from frontend
            RampDown (): Pandas dataframework from frontend
            MaxDownTime (): Pandas dataframework from frontend
            MinDownTime (): Pandas dataframework from frontend
            Initstatus (): Pandas dataframework from frontend
            StartUpCost (): Pandas dataframework from frontend
            ShutdownCost (): Pandas dataframework from frontend
            Effciency (): Pandas dataframework from frontend
            CapCost (): Pandas dataframework from frontend
            PsetPoint (): Pandas dataframework from frontend
            QsetPoint (): Pandas dataframework from frontend

        Returns:

        '''
        for i in range(0, len(Generators)):

            '''
            Get connection as a string delete first and last character ([,]) get the individual info.
            '''
            s = str(GeneratorConnection[i])
            string = s[1:-1]
            print("generator stuff")
            BussTo = string.split(',')
            print(Generators[i])

            if(len(BussTo) >= 2):
                BussConnect = int(BussTo[1])
            else:
                BussConnect = int(BussTo[0])
            print(BussTo, string)


            print("cost")
            print(CostsOrdered)
            s = str(CostsOrdered[i])
            CostsOrdered[i] = s[1:-1]
            CostsOrdered[i] = CostsOrdered[i].split(',')
            print("cost i ")
            print(CostsOrdered[i])

            # print("pnom")
            # # print(PnomOrdered)
            # s = str(PnomOrdered[i])
            # PnomOrdered[i] = s[1:-1]
            # PnomOrdered[i]= PnomOrdered[i].split(',')
            print(Time)
            if Time == False:
                MaxDownTime[i] = 0
                MinDownTime[i] = 0

            print(PminOrdered[i])
            print(PsetPoint[i])
            print(QsetPoint[i])


            network.add("Generator", "Power Plant {}".format(i),
                        bus="electric bus {}".format(BussConnect),
                        p_nom=PnomOrdered[i],
                        marginal_cost=0,
                        p_min_pu=PminOrdered[i],
                        p_max_pu=PmaxOrdered[i],
                        capital_cost=CapCost[i],
                        efficiency=Effciency[i],
                        p_set=PsetPoint[i],
                        q_set=QsetPoint[i],
                        committable=True,
                        initial_status=Initstatus[i],
                        ramp_limit_up=RampUp[i],
                        ramp_limit_down=RampDown[i],
                        ramp_limit_start_up=RampUp[i],
                        ramp_limit_shut_down=RampDown[i],
                        start_up_cost=StartUpCost[i],
                        shut_down_cost=ShutdownCost[i],
                        min_up_time=MaxDownTime[i],
                        min_down_time=MinDownTime[i],

                        )
        print(network.generators)

    def LoadAdder(network,LoadName, Loads,LoadQ, LoadBus):
        '''
            Add loads to the network
        ToDo : Qload

        Args:
            LoadName : List of Load names
            Loads : List of loads that need to be edited
            LoadBus : List of the busses where the load is connected to


        '''

        for i in range(0, len(Loads)):
            # print("printing load data ")
            # print(LoadName[i])
            # print(Loads[i])
            # print(LoadBus)

            # s = str(Loads[i])
            # Loads[i] =  s[1:-1]
            # Loads[i]= Loads[i].split(',')
            s = str(LoadBus[i])
            string = s[1:-1]
            BussTo = string.split(',')
            print(BussTo[0])
            print(Loads[i])
            print(LoadQ[i])

            network.add("Load", "electric load {}".format(i),
                        bus="electric bus {}".format(BussTo[0]),
                        p_set=Loads[i],
                        q_set=LoadQ[i],
                        )
        print(network.loads)

    def Printer(network):
        '''
        Debugger that prints info

        Args:
            network : pypsa main network component

        Returns:

        '''
        print("\n \n ")
        print("lines")
        print(network.lines)
        print("generators")
        print(network.generators)
        print("busses")
        print(network.buses)
        print("loads")
        print(network.loads)

    def test(network,snapshots):
        print("test")
        # print("constrains:")
        # model = network.model
        # print(model)
        # generators = network.generators.index
        # print(generators)
        # print(network.generators.loc[generators]['ramp_limit_down'])
        # print(network.generators.ramp_limit_down)
        # model.resverdown = Var(within=PositiveReals)
        # model.ReserveLimitDown = Constraint( model.resverdown <= network.generators.loc[generators]['ramp_limit_down']  )

       # test = NumericConstant(list(generators), snapshots, domain)

        #model.block = Constraint( network.model.generator_p >= sum( 440 for i in range(0,2)  ))
        #print(network.model.generator_p)

    def lopf(network):
        '''
        Function that runs the optimization procces

        Returns:

        '''




        Network.Printer(network)
        network.lopf(solver_name="glpk", keep_files=True, solver_options={}, formulation="kirchhoff")
        #,extra_functionality=Network.test
        #print("Objective:", network.objective)

        # network.model.dual = Suffix(direction=Suffix.IMPORT)
        # print(network.model.balance.get_suffix_value(network.model.dual)  )
        Network.Printer(network)
        print("prices:")
        print(network.buses_t.marginal_price)
        return Output.NetworkExport(network)


class Stochastic:

    def Main(model, ElectricLines, ElectricLinesR, ElectricLinesC, ElectricLinesX,
                                                       Buss, BussVnom, BussType, BussVset, BussVmax, BussVmin,
                                                       BussConnection,
                                                       ElectricLinesCcap, ElectricLinesL, ElectricLinesPhaseShift,
                                                       ElectricLinesAngMax, ElectricLinesAngMin, ElectricLinesLength,
                                                       ElectricLinesConnection, ElectricLinesPmax, Generators,
                                                       CostsOrdered, PnomOrdered, RampUp, RampDown, Effciency,
                                                       MinDownTime, MaxDownTime, PminOrdered, GeneratorConnection,
                                                       PmaxOrdered, StartUpCost, ShutdownCost, Initstatus, CapCost,
                                                       PsetPoint, QsetPoint, Loads, LoadP, LoadTime, LoadConnection,
                                                       options):
        '''
        Main function for the Stochastic model, this function will load all the sub functions in correct order.
        The Stochastic model lends most functions from the network model

        Returns:
            solution
        '''

        logger.info("Stochastic model started")

        '''
        Calculate how many time stamps there are
        '''
        '''
        Initilize the pypsa network
        '''
        network = pypsa.Network()
        '''
        Set time intervals pypsa counts them as "snapshots"
        '''

        '''
        Add the busses to the network
        '''
        Network.BussesAdder(network, Buss, BussVnom, BussVmax, BussVmin, BussVset, BussType)
        '''
        Add the electric lines to the network
        '''
        Network.ElectricLinesAdder(network, ElectricLines, ElectricLinesR, ElectricLinesX,  ElectricLinesCcap,
            ElectricLinesL, ElectricLinesPhaseShift, ElectricLinesAngMax, ElectricLinesAngMin,  ElectricLinesLength,
            ElectricLinesConnection ,ElectricLinesPmax)
        '''
        Add the generators to the network
        '''
        Network.GeneratorAdder(network, Generators,  GeneratorConnection , PnomOrdered, PminOrdered, PmaxOrdered,
            CostsOrdered, RampUp, RampDown, MaxDownTime, MinDownTime, Initstatus, StartUpCost, ShutdownCost, Effciency,
            CapCost, PsetPoint,  QsetPoint)
        '''
        Add the loads to the network
        '''
        Network.LoadAdder(network, Loads, LoadP, LoadConnection)

        Network.Printer(network)

        '''
        Run the optimalization
        '''
        Network.lopf(network )

    def Constrains(network,snapshots):
        model = network.model
        gen = network.generator.index
        sn = snapshots
        model.ReserveLimitUp = Constraint( 0 >= network.generator.loc[gen,sn] <= network.generator.loc[gen].ramp_limit_up)

        model.ReserveLimitDown = Constraint( 0 >= network.generator.loc[gen,sn] <= network.generator.loc[gen].ramp_limit_down)

    def lop(network):
        network.lopf(snapshots=network.snapshots,extra_functionality=Stochastic.Constrains, keep_files=True)
        Output.NetworkExport(network)


    def Constrains(network,snapshots):
        print("test")

#Pandas Data Framework from the frontend
def Dispatch(model, *data):
    '''

    Args:


    Returns: json file with the solutions of the model

    '''
    print(model)
    logger.info("Getting incoming data")
    print("dispatcher")

    if model == "basic":
        Pmax = data[0]
        Pmin = data[1]
        CostsOrdered = data[2]
        LoadP = data[3]

        Simple.Main(Pmax,Pmin,CostsOrdered,LoadP)
        logger.info("Done , with basic model !")

    if model == "network":
        ElectricLines = data[0]
        ElectricLinesR =data[1]
        ElectricLinesC = data[2]
        ElectricLinesX =data[3]
        Buss =data[4]
        BussVnom = data[5]
        BussType =data[6]
        BussVset=data[7]
        BussVmax =data[8]
        BussVmin= data[9]
        BussConnection = data[10]
        ElectricLinesCcap =data[11]
        ElectricLinesL =data[12]
        ElectricLinesPhaseShift =data[13]
        ElectricLinesAngMax = data[14]
        ElectricLinesAngMin =data[15]
        ElectricLinesLength =data[16]
        ElectricLinesConnection =data[17]
        ElectricLinesPmax =data[18]
        Generators =data[19]
        CostsOrdered =data[20]
        PnomOrdered =data[21]
        RampUp = data[22]
        RampDown = data[23]
        Effciency =data[24]
        MinDownTime =data[25]
        MaxDownTime =data[26]
        PminOrdered =data[27]
        GeneratorConnection =data[28]
        Time =data[29]
        PowerBlocks =data[30]
        PmaxOrdered =data[31]
        StartUpCost =data[32]
        ShutdownCost =data[33]
        Initstatus =data[34]
        CapCost =data[35]
        PsetPoint =data[36]
        QsetPoint =data[37]
        Loads = data[38]
        LoadP =data[39]
        LoadQ =data[40]
        LoadTime = data[41]
        LoadConnection =data[42]
        options =data[43]

        StaticOutput, VaryingOutput = Network.Main(model,
            ElectricLines , ElectricLinesR, ElectricLinesC, ElectricLinesX, Buss, BussVnom, BussType, BussVset, BussVmax, BussVmin, BussConnection ,
            ElectricLinesCcap, ElectricLinesL, ElectricLinesPhaseShift, ElectricLinesAngMax, ElectricLinesAngMin, ElectricLinesLength, ElectricLinesConnection ,ElectricLinesPmax, Generators,
            CostsOrdered, PnomOrdered, RampUp, RampDown, Effciency, MinDownTime, MaxDownTime,  PminOrdered, GeneratorConnection , Time,
            PowerBlocks, PmaxOrdered, StartUpCost, ShutdownCost, Initstatus, CapCost, PsetPoint,  QsetPoint, Loads, LoadP,LoadQ, LoadTime, LoadConnection, options)

        logger.info("Failed the network model")
        status = "ok"

        return StaticOutput, VaryingOutput,status
    if model == "stochastic":
        ElectricLines = data[0]
        ElectricLinesR =data[1]
        ElectricLinesC = data[2]
        ElectricLinesX =data[3]
        Buss =data[4]
        BussVnom = data[5]
        BussType =data[6]
        BussVset=data[7]
        BussVmax =data[8]
        BussVmin= data[9]
        BussConnection = data[10]
        ElectricLinesCcap =data[11]
        ElectricLinesL =data[12]
        ElectricLinesPhaseShift =data[13]
        ElectricLinesAngMax = data[14]
        ElectricLinesAngMin =data[15]
        ElectricLinesLength =data[16]
        ElectricLinesConnection =data[17]
        ElectricLinesPmax =data[18]
        Generators =data[19]
        CostsOrdered =data[20]
        PnomOrdered =data[21]
        RampUp = data[22]
        RampDown = data[23]
        Effciency =data[24]
        MinDownTime =data[25]
        MaxDownTime =data[26]
        PminOrdered =data[27]
        GeneratorConnection =data[28]
        Time =data[29]
        PowerBlocks =data[30]
        PmaxOrdered =data[31]
        StartUpCost =data[32]
        ShutdownCost =data[33]
        Initstatus =data[34]
        CapCost =data[35]
        PsetPoint =data[36]
        QsetPoint =data[37]
        Loads = data[38]
        LoadP =data[39]
        LoadQ =data[40]
        LoadTime = data[41]
        LoadConnection =data[42]
        options =data[43]
        Stochastic.Main(model,                         ElectricLines, ElectricLinesR, ElectricLinesC, ElectricLinesX,
                                                       Buss, BussVnom, BussType, BussVset, BussVmax, BussVmin,
                                                       BussConnection,
                                                       ElectricLinesCcap, ElectricLinesL, ElectricLinesPhaseShift,
                                                       ElectricLinesAngMax, ElectricLinesAngMin, ElectricLinesLength,
                                                       ElectricLinesConnection, ElectricLinesPmax, Generators,
                                                       CostsOrdered, PnomOrdered, RampUp, RampDown, Effciency,
                                                       MinDownTime, MaxDownTime, PminOrdered, GeneratorConnection,
                                                       PmaxOrdered, StartUpCost, ShutdownCost, Initstatus, CapCost,
                                                       PsetPoint, QsetPoint, Loads, LoadP, LoadTime, LoadConnection,
                                                       options)
        logger.info("Done , with stochastic model !")
