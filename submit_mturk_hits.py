import boto
from boto.mturk.connection import MTurkConnection
from boto.mturk.question import HTMLQuestion
from boto.mturk.layoutparam import LayoutParameter
from boto.mturk.layoutparam import LayoutParameters
# Create your connection to MTurk
mtc = MTurkConnection(aws_access_key_id='your_access_key_here',
aws_secret_access_key='your_secret_key_here',
host='mechanicalturk.amazonaws.com')
image_url = LayoutParameter('image_url', 'http://turk.s3.amazonaws.com/stop_sign_picture.jpg')
obj_to_find = LayoutParameter('objects_to_find','stop sign')
params   = LayoutParameters([ image_url, obj_to_find ])
response = mtc.create_hit(
  hit_layout    = "3ASV3OFR42CJPPALP03SPQPR0GRDYI",
  layout_params = params, 
  hit_type      = "3UTQDPKCBDPS43G3N3YCFJLHPDX514"
)
                          
# The response included several fields that will be helpful later
hit_type_id = response[0].HITTypeId
hit_id = response[0].HITId
print("Your HIT has been created. You can see it at this link:")
print("https://www.mturk.com/mturk/preview?groupId={}".format(hit_type_id))
print("Your HIT ID is: {}".format(hit_id))