<?php
namespace martingerdzhev\ImageAnnotatorBundle\Model;

use martingerdzhev\ImageAnnotatorBundle\Entity\ResourceFile;
use martingerdzhev\ImageAnnotatorBundle\Entity\MetaData;
use martingerdzhev\ImageAnnotatorBundle\Entity\Image;
use martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType;
use martingerdzhev\ImageAnnotatorBundle\Entity\Annotation;

class JSEntities
{

	public static function getAnnotationTypeObject(AnnotationType $annotationType)
	{
		return array('id' => $annotationType->getId(), 'name' => $annotationType->getName());
	}
	
	public static function getAnnotationObject(Annotation $annotation)
	{
		return array('id' => $annotation->getId(), 'type' => JSEntities::getAnnotationTypeObject($annotation->getType()), 'polygon' => $annotation->getPolygon(), 'image' => JSEntities::getMediaObject($annotation->getImage()));
	}
	
	public static function getMediaObject(Image $media)
	{
		return array('id' => $media->getId(), 'title' => $media->getTitle(),
			 	'metaData' => JSEntities::getMetaDataObject($media->getMetaData()),
				'resource' => JSEntities::getResourceObject($media->getResource()));
	}

	public static function getMetaDataObject(MetaData $metaData)
	{
		return array('timeUploaded' => $metaData->getTimeUploaded(), 
				'width' => $metaData->getWidth(), 'height' => $metaData->getHeight(), 'size' => $metaData->getSize(),
				'id' => $metaData->getId());
	}

	public static function getResourceObject(ResourceFile $resource)
	{
		return array('path' => $resource->getWebPath());
	}
}
