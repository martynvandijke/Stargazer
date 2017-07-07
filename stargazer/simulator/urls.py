from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^solve$', views.solve, name='solve'),
    url(r'^solvebasic$', views.solvebasic, name='solvebasic'),
    url(r'^solvenetwork$', views.solvenetwork, name='solvenetwork'),
    url(r'^solvenetworkelastic$', views.solvenetworkelastic, name='solvenetworkelastic'),
    url(r'^session$', views.session, name='session'),
    url(r'^delsession$', views.delsession, name='delsession'),
    url(r'^savesession$', views.savesession, name='savesession'),

]
'''
Server static docs files trough nginx
'''
