from django.shortcuts import render, render_to_response
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from . import EconomicDispatcher
import json
from django.utils.safestring import SafeString
import pandas as pd
from io import StringIO
import io
from pandas.io.json import json_normalize
from timeit import default_timer as timer
import os
import glob
from simulator.models import Session
from pyomo.environ import *
import pypsa
import numpy as np


def index(request):
    '''

    Args:
        request : html request from the Django web server

    Returns:

    '''
    return render_to_response('index.html')


def JsonFormatter(datafile):
    '''

    Args:
        datafile : io datafile that contains the json output.

    Returns:

    '''
    data = datafile.getvalue()
    datafile.close()
    jsondata = json.loads(data)
    model = jsondata['model']

    PowerPlants = json_normalize(jsondata['power_plants'])
    Consumers = json_normalize(jsondata['consumers'])

    '''
    Load all the power plant info
    '''
    Generators = PowerPlants['id']
    CostsOrdered = PowerPlants['parameter.cost']
    PowerBlocks = PowerPlants['parameter.power']
    Time = PowerPlants['parameter.time']
    PnomOrdered = PowerPlants['parameter.power_nom']
    RampUp = PowerPlants['parameter.ramp_up']
    RampDown = PowerPlants['parameter.ramp_down']
    MinDownTime = PowerPlants['parameter.time_down']
    MaxDownTime = PowerPlants['parameter.time_up']
    Effciency = PowerPlants['parameter.efficiency']
    PmaxOrdered = PowerPlants['parameter.power_max']
    PminOrdered = PowerPlants['parameter.power_min']
    StartUpCost = PowerPlants['parameter.start_up']
    ShutdownCost = PowerPlants['parameter.start_down']
    Initstatus = PowerPlants['parameter.init']
    CapCost = PowerPlants['parameter.ccap']
    PsetPoint = PowerPlants['parameter.pset']
    QsetPoint = PowerPlants['parameter.qset']
    GeneratorConnection = PowerPlants['connection']

    '''
    Load all the load info
    '''
    Loads = Consumers['id']
    LoadP = Consumers['parameter.load']
    LoadQ = Consumers['parameter.qload']
    LoadTime = Consumers['parameter.time']
    LoadConnection = Consumers['connection']
    options = []

    if model == "basic":
        EconomicDispatcher.Dispatch(
            model, PmaxOrdered, PminOrdered, CostsOrdered, LoadP)

    if model == "network":
        Grids = json_normalize(jsondata['grids'])
        '''
        Load all the grid (line) info
        '''
        ElectricLines = Grids['id']
        ElectricLinesConnection = Grids['connection']
        ElectricLinesR = Grids['parameter.resistance']
        ElectricLinesC = Grids['parameter.capacitance']
        ElectricLinesX = Grids['parameter.reactance']
        ElectricLinesL = Grids['parameter.length']
        ElectricLinesPmax = Grids['parameter.power_max']
        ElectricLinesLength = Grids['parameter.length']
        ElectricLinesCcap = Grids['parameter.cap_cost']
        ElectricLinesPhaseShift = Grids['parameter.phase_shift']
        ElectricLinesAngMax = Grids['parameter.ang_max']
        ElectricLinesAngMin = Grids['parameter.ang_min']
        '''
        Load all the buss data
        '''
        Bus = json_normalize(jsondata['buses'])
        Buss = Bus['id']
        BussConnection = Bus['connection']
        BussVnom = Bus['parameter.v_nom']
        BussType = Bus['parameter.type']
        BussVset = Bus['parameter.v_set']
        BussVmin = Bus['parameter.v_min']
        BussVmax = Bus['parameter.v_max']

        EconomicDispatcher.Dispatch(model,
                                    ElectricLines, ElectricLinesR, ElectricLinesC, ElectricLinesX, Buss, BussVnom, BussType, BussVset, BussVmax, BussVmin, BussConnection,
                                    ElectricLinesCcap, ElectricLinesL, ElectricLinesPhaseShift, ElectricLinesAngMax, ElectricLinesAngMin, ElectricLinesLength, ElectricLinesConnection, ElectricLinesPmax, Generators,
                                    CostsOrdered, PnomOrdered, RampUp, RampDown, Effciency, MinDownTime, MaxDownTime,  PminOrdered, GeneratorConnection, Time,
                                    PowerBlocks, PmaxOrdered, StartUpCost, ShutdownCost, Initstatus, CapCost, PsetPoint,  QsetPoint, Loads, LoadP, LoadQ, LoadTime, LoadConnection, options)


@csrf_exempt
def solve(request):
    '''
    Solve the frontend board data
    Args:
        request : html request

    Returns:

    '''
    if request.method != 'POST':
        return JsonResponse({})
    json_data = json.loads(request.body.decode('utf-8'))

    data = json_data['boardData']
    start = timer()
    datafile = io.StringIO()
    datafile.write(data)
    status = "failed"

    JsonFormatter(datafile)

    end = timer()
    delta = end - start
    data = {'status': status, 'time': delta, 'model': "network"}
    FilesList = os.listdir("json_out")
    for i in range(0, len(FilesList)):
        name = "json_out/" + FilesList[i]
        with open(name) as data_file:
            listname = str(FilesList[i]).split('.')
            data.update({listname[0]: json.load(data_file)})

    test = 'json_out/*'
    r = glob.glob(test)
    for i in r:
        os.remove(i)

    print(data)

    return JsonResponse(data, safe=True)

# ensures no exceptions are raised


@csrf_exempt
def savesession(request):
    '''
    Saves the frontend data as user session data on the server
    Args:
        request (): html request

    Returns: empty json

    '''
    if request.method != 'POST':
        return JsonResponse({})
    json_data = json.loads(request.body.decode('utf-8'))
    session_data = json_data['data']
    s = Session(data=session_data)
    s.save()
    # print(request.body)
    return JsonResponse({"hash": s.hash})


# ensures no exceptions are raised
@csrf_exempt
def session(request):
    '''
    Load the previous session of the user
    Args:
        request : html request

    Returns: json file with previous data

    '''
    json_data = json.loads(request.body.decode('utf-8'))
    id = json_data['hash']
    s = Session.objects.get(hash=id)

    return JsonResponse({'data': s.data})

# ensures no exceptions are raised


@csrf_exempt
def delsession(request):
    '''
    Delete the session data of the user
    Args:
        request :

    Returns: empty json

    '''

    json_data = json.loads(request.body.decode('utf-8'))
    id = json_data['hash']
    s = Session.objects.get(hash=id)
    s.delete()

    return JsonResponse({})


@csrf_exempt
def solvebasic(request):
    '''
    Solve for basic model from frontend
    Args:
        request (): html request

    Returns: result json

    '''
    if request.method != 'POST':
        return JsonResponse({})
    json_data = json.loads(request.body.decode('utf-8'))
    parsed = json_data['boardData']
    datafile = io.StringIO()
    datafile.write(parsed)

    data = datafile.getvalue()
    datafile.close()
    jsondata = json.loads(data)
    model = jsondata['model']

    generators = json_normalize(jsondata['generator'])
    consumers = json_normalize(jsondata['consumer'])

    power_min = generators['parameter.power_min']
    power_max = generators['parameter.power_max']
    cost = generators['parameter.marginal_cost']
    load = consumers['parameter.load'][0]

    UnitDataIndex = []
    UnitDataPmin = {}
    UnitDataPmax = {}
    UnitDataCost = {}
    for i in range(0, len(cost)):
        UnitDataIndex.append(i)
        UnitDataPmin[i] = power_min[i]
        UnitDataPmax[i] = power_max[i]
        UnitDataCost[i] = cost[i]

    LoadDataIndex = []
    LoadDataLoad = {}
    for i in range(0, len(load)):
        LoadDataIndex.append(i)
        LoadDataLoad[i] = load[i]

    model = ConcreteModel()
    model.I = Set(ordered='True', initialize=UnitDataIndex)
    model.T = Set(ordered='True', initialize=LoadDataIndex)
    model.Pmin = Param(model.I, initialize=UnitDataPmin)
    model.Pmax = Param(model.I, initialize=UnitDataPmax)
    model.Cost = Param(model.I, initialize=UnitDataCost)
    model.Load = Param(model.T, initialize=LoadDataLoad)

    # Define decision variables

    model.P = Var(model.I, model.T, within=PositiveReals)

    def cost_rule(model):
        return sum(sum(model.Cost[i] * model.P[i, t] for i in model.I) for t in model.T)
    model.cost = Objective(rule=cost_rule, sense=minimize)

    def unit_rule_1(model, i, t):
        return model.Pmin[i] <= model.P[i, t] <= model.Pmax[i]
    model.unitoutputcons = Constraint(model.I, model.T, rule=unit_rule_1)

    def balance_rule(model, t):
        return sum(model.P[i, t] for i in model.I) == model.Load[t]
    model.system_balance = Constraint(model.T, rule=balance_rule)
    # Select solver and solve the optimization problem
    opt = SolverFactory('glpk')
    results = opt.solve(model)
    cost = model.cost()

    P = []
    for i in range(len(UnitDataIndex)):
        P.append([])
    for t in model.T:
        for i in range(len(UnitDataIndex)):
            P[i].append(model.P[UnitDataIndex[i], t].value)

    return JsonResponse({"status": "success" if str(results.Solver.Status) == "ok" else "failed", "solution": {"p_out": P, "cost": cost}})


@csrf_exempt
def solvenetwork(request):
    '''
    Solve for network model from frontend
    Args:
        request (): html request

    Returns: result json

    '''
    if request.method != 'POST':
        return JsonResponse({})
    json_data = json.loads(request.body.decode('utf-8'))
    parsed = json_data['boardData']
    datafile = io.StringIO()
    datafile.write(parsed)

    data = datafile.getvalue()
    datafile.close()

    parsed = json.loads(parsed)
    jsondata = json.loads(data)
    model = jsondata['model']

    generators = json_normalize(jsondata['generator'])
    consumers = json_normalize(jsondata['consumer'])
    buses = json_normalize(jsondata['bus'])
    grids = json_normalize(jsondata['grid'])

    network = pypsa.Network()
    network.set_snapshots(range(len(consumers['parameter.load'][0])))
    # add bus
    for i in range(0, len(parsed["bus"])):
        network.add("Bus", "Bus {}".format(buses['id'][i]),
                v_nom=1,
                v_mag_pu_min=buses['parameter.v_min'][i],
                v_mag_pu_max=buses['parameter.v_max'][i])

    # add load
    for i in range(0, len(parsed["consumer"])):
        network.add("Load", "Load {}".format(consumers['id'][i]),
                bus="Bus {}".format(consumers['connection'][i][0]),
                p_set=consumers['parameter.load'][i])

    # add generator
    for i in range(0, len(parsed["generator"])):
        network.add("Generator", "Generator {}".format(generators['id'][i]),
                bus="Bus {}".format(generators['connection'][i][0]),
                p_nom=1,
                p_min_pu=generators['parameter.power_min'][i],
                p_max_pu=generators['parameter.power_max'][i],
                marginal_cost=generators['parameter.marginal_cost'][i],
                start_up_cost=generators['parameter.start_up_cost'][i],
                shut_down_cost=generators['parameter.shut_down_cost'][i],
                min_up_time=generators['parameter.minimum_up_time'][i],
                min_down_time=generators['parameter.minimum_down_time'][i],
                ramp_limit_up=generators['parameter.ramp_up_rate'][i],
                ramp_limit_down=generators['parameter.ramp_down_rate'][i],
                committable=True)

    # add grid
    for i in range(0, len(parsed["grid"])):
        network.add("Line", "Line {}".format(grids['id'][i]),
                bus0="Bus {}".format(grids['connection'][i][0]),
                bus1="Bus {}".format(grids['connection'][i][1]),
                x=grids['parameter.reactance'][i],
                r=grids['parameter.resistance'][i],
                s_nom=grids['parameter.capacity'][i])

    #print(network.consistency_check())
    result = network.lopf(solver_name="glpk", keep_files=False, solver_options={}, formulation="kirchhoff")
    print(result)
    #print(network.model)
    #print("Objective:",network.objective)
    return JsonResponse({"status": "success" if str(result[1]) == "optimal" else "failed",
    "solution":{
        "generators" : {
            "power" : json.loads(network.generators_t.p.to_json())
        },
        "bus" : {
            "control" : json.loads(network.buses.control.to_json()),
            "power" : json.loads(network.buses_t.p.to_json())
        },
        "cost" : network.objective
    }})

@csrf_exempt
def solvenetworkelastic(request):
    '''
    Solve for network model with elastic demand from frontend
    Args:
        request (): html request

    Returns: result json

    '''
    if request.method != 'POST':
        return JsonResponse({})
    json_data = json.loads(request.body.decode('utf-8'))
    parsed = json_data['boardData']
    datafile = io.StringIO()
    datafile.write(parsed)

    data = datafile.getvalue()
    datafile.close()

    parsed = json.loads(parsed)
    jsondata = json.loads(data)
    model = jsondata['model']

    generators = json_normalize(jsondata['generator'])
    consumers = json_normalize(jsondata['consumer'])
    buses = json_normalize(jsondata['bus'])
    grids = json_normalize(jsondata['grid'])

    network = pypsa.Network()
    network.set_snapshots(range(len(consumers['parameter.load'][0])))
    # add bus
    for i in range(0, len(parsed["bus"])):
        network.add("Bus", "Bus {}".format(buses['id'][i]),
                v_nom=1,
                v_mag_pu_min=buses['parameter.v_min'][i],
                v_mag_pu_max=buses['parameter.v_max'][i])

    # add load
    for i in range(0, len(parsed["consumer"])):
        network.add("Load", "Load {}".format(consumers['id'][i]),
                bus="Bus {}".format(consumers['connection'][i][0]),
                p_set=consumers['parameter.load'][i])

    # add generator
    for i in range(0, len(parsed["generator"])):
        for j in range(0, len(generators['parameter.cost_block'][i])):
            network.add("Generator", "Generator {} sub {}".format(generators['id'][i],j),
                    bus="Bus {}".format(generators['connection'][i][0]),
                    p_nom=1,
                    p_min_pu=generators['parameter.energy_block'][i][j],
                    p_max_pu=generators['parameter.energy_block'][i][j+1],
                    marginal_cost=generators['parameter.cost_block'][i][j],
                    start_up_cost=generators['parameter.start_up_cost'][i],
                    shut_down_cost=generators['parameter.shut_down_cost'][i],
                    min_up_time=generators['parameter.minimum_up_time'][i],
                    min_down_time=generators['parameter.minimum_down_time'][i],
                    ramp_limit_up=generators['parameter.ramp_up_rate'][i],
                    ramp_limit_down=generators['parameter.ramp_down_rate'][i],
                    committable=True)
    print(network.generators)

    # add grid
    for i in range(0, len(parsed["grid"])):
        network.add("Line", "Line {}".format(grids['id'][i]),
                bus0="Bus {}".format(grids['connection'][i][0]),
                bus1="Bus {}".format(grids['connection'][i][1]),
                x=grids['parameter.reactance'][i],
                r=grids['parameter.resistance'][i],
                s_nom=grids['parameter.capacity'][i])

    print(network.consistency_check())
    result = network.lopf(solver_name="glpk", keep_files=True, solver_options={}, formulation="kirchhoff")
    
    return JsonResponse({"status": "success" if str(result[1]) == "optimal" else "failed",
    "solution":{
        "generators" : {
            "power" : json.loads(network.generators_t.p.to_json())
        },
        "bus" : {
            "control" : json.loads(network.buses.control.to_json()),
            "power" : json.loads(network.buses_t.p.to_json())
        }
    }})

