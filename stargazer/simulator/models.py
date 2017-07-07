from django.db import models
import hashlib
import time
import sys


def _createHash():
    hash = hashlib.sha1()
    hash.update(str(time.time()).encode('utf-8'))
    return  hash.hexdigest()[:-10]

class Session(models.Model):
    data = models.CharField(max_length=sys.maxsize)
    hash = models.CharField(max_length=10,default=_createHash,unique=True)