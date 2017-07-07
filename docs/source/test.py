'''
Title: Simple Economic Dispatch
Author: Dr. Nikolaos G. Paterakis, TUE
Date: 10/1/2017
Purpose:
- Import data from excel spreadsheets using pandas
- Formulate a problem
- Perform sensitivity analysis
- Print and plot results using matplotlib
'''

#Define dependencies
import pandas
from pyomo.environ import *

def Main():
    '''
    Testsfsfd
    '''
    #Load data from excel spreadsheets
    UnitData = pandas.read_excel('TestData/SimpleTest.xlsx', sheetname = 'UnitData')
    #print UnitData
    Load = pandas.read_excel('TestData/SimpleTest.xlsx', sheetname = 'Load')
    #print Load

    #------------------------ Define model
    #Define optimization model
    model= ConcreteModel()

    #Define sets
    model.I = Set(ordered='True', initialize=UnitData.index)
    model.T = Set(ordered='True', initialize=Load.index)

    #Define parameters
    model.Pmin = Param(model.I, initialize=UnitData['Pmin'].to_dict()) #to_dict() is a nice trick.
    model.Pmax = Param(model.I, initialize=UnitData['Pmax'].to_dict())
    model.Cost = Param(model.I, initialize=UnitData['Cost'].to_dict())
    model.Load = Param(model.T, initialize=Load['Load'].to_dict())

    #Define decision variables
    model.P = Var(model.I, model.T, within=PositiveReals)

    def cost_rule(model):
        return sum(sum(model.Cost[i]*model.P[i,t] for i in model.I) for t in model.T)
    model.cost = Objective(rule=cost_rule, sense=minimize)

    def unit_rule_1(model, i, t):
        return model.Pmin[i] <= model.P[i,t] <= model.Pmax[i]
    model.unitoutputcons = Constraint(model.I,model.T, rule=unit_rule_1)

    def balance_rule(model, t):
        return sum(model.P[i,t] for i in model.I) == model.Load[t]
    model.system_balance = Constraint(model.T,rule=balance_rule)

    #Select solver and solve the optimization problem
    opt=SolverFactory('glpk')
    results=opt.solve(model)

    #Print results
    print('Objective function', model.cost()) #objective function value

    #--- loop in order to print value of decision variables
    for t in model.T:
        print('---',t,'---')
        for i in model.I:
            print( i, model.P[i,t].value)

    print('---')

Main()
