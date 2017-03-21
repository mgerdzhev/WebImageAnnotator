import boto
from boto.mturk.connection import MTurkConnection
from boto.mturk.question import HTMLQuestion
from boto.mturk.layoutparam import LayoutParameter
from boto.mturk.layoutparam import LayoutParameters
import json
# Create your connection to MTurk
mtc = MTurkConnection(aws_access_key_id='your_access_key_here',
aws_secret_access_key='your_secret_key_here',
host='mechanicalturk.amazonaws.com')
# This is the value you reeceived when you created the HIT
# You can also retrieve HIT IDs by calling GetReviewableHITs
# and SearchHITs. See the links to read more about these APIs.
hit_id = "386T3MLZLNVRU564VQVZSIKA8D580B"
result = mtc.get_assignments(hit_id)
assignment = result[0]
worker_id = assignment.WorkerId
for answer in assignment.answers[0]:
  if answer.qid == 'annotation_data':
    worker_answer = json.loads(answer.fields[0])
    
print("The Worker with ID {} gave the answer {}".format(worker_id, worker_answer))
left = worker_answer[0]['left']
top  = worker_answer[0]['top']
print("The top and left coordinates are {} and {}".format(top, left))