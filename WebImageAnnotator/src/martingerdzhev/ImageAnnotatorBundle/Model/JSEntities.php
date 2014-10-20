<?php

namespace martingerdzhev\ImageAnnotatorBundle\Model;

use martingerdzhev\ImageAnnotatorBundle\Entity\ResourceFile;
use martingerdzhev\ImageAnnotatorBundle\Entity\MetaData;
use martingerdzhev\ImageAnnotatorBundle\Entity\Image;
use martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType;
use martingerdzhev\ImageAnnotatorBundle\Entity\Annotation;
use martingerdzhev\ImageAnnotatorBundle\Entity\Dataset;

class JSEntities
{
	
	public static function exportDatasetObject(Dataset $dataset)
	{
		$images = array ();
		foreach ( $dataset->getImages () as $image )
		{
			$images [] = array (
					'image' => JSEntities::exportMediaObject ( $image )
			);
		}
		$annotationTypes = array ();
		foreach ( $dataset->getAnnotationTypes () as $type )
		{
			$annotationTypes [] = JSEntities::exportAnnotationTypeObject ( $type );
		}
		return array (
				'id' => $dataset->getId (),
				'name' => $dataset->getName (),
				'images' => $images,
				'annotationTypes' => $annotationTypes
		);
	}
	
	public static function exportAnnotationTypeObject(AnnotationType $annotationType)
	{
		return $annotationType->getName ();
	}
	
	public static function exportAnnotationObject(Annotation $annotation)
	{
		return array (
				'type' => JSEntities::exportAnnotationTypeObject ( $annotation->getType () ),
				'polygon' => $annotation->getPolygon ()
		); 
	}
	
	public static function exportMediaObject(Image $media)
	{
		$annotations = array ();
		foreach ( $media->getAnnotations () as $annotation )
		{
			$annotations [] = array (
					'annotation' => JSEntities::exportAnnotationObject ( $annotation )
			);
		}
		return array (
				'title' => $media->getTitle (),
				'metaData' => JSEntities::exportMetaDataObject ( $media->getMetaData () ),
				'filename' => $media->getResource ()->getWebPath(),
				'annotations' => $annotations
		);
	}
	
	public static function exportMetaDataObject(MetaData $metaData)
	{
		return array (
				'width' => $metaData->getWidth (),
				'height' => $metaData->getHeight (),
		);
	}
	
	public static function getDatasetObject(Dataset $dataset)
	{
		$images = array ();
		foreach ( $dataset->getImages () as $image )
		{
			$images [] = array (
					'image' => JSEntities::getMediaObject ( $image ) 
			);
		}
		$annotationTypes = array ();
		foreach ( $dataset->getAnnotationTypes () as $type )
		{
			$annotationTypes [] = array (
					'annotationType' => JSEntities::getAnnotationTypeObject ( $type ) 
			);
		}
		return array (
				'id' => $dataset->getId (),
				'name' => $dataset->getName (),
				'images' => $images,
				'annotationTypes' => $annotationTypes 
		);
	}
	public static function getAnnotationTypeObject(AnnotationType $annotationType)
	{
		return array (
				'id' => $annotationType->getId (),
				'name' => $annotationType->getName () 
		);
	}
	public static function getAnnotationObject(Annotation $annotation)
	{
		return array (
				'id' => $annotation->getId (),
				'type' => JSEntities::getAnnotationTypeObject ( $annotation->getType () ),
				'polygon' => $annotation->getPolygon () 
		); // , 'image' => JSEntities::getMediaObject($annotation->getImage()));
	}
	public static function getMediaObject(Image $media)
	{
		$annotations = array ();
		foreach ( $media->getAnnotations () as $annotation )
		{
			$annotations [] = array (
					'annotation' => JSEntities::getAnnotationObject ( $annotation ) 
			);
		}
		return array (
				'id' => $media->getId (),
				'title' => $media->getTitle (),
				'metaData' => JSEntities::getMetaDataObject ( $media->getMetaData () ),
				'resource' => JSEntities::getResourceObject ( $media->getResource () ),
				'annotations' => $annotations 
		);
	}
	public static function getMetaDataObject(MetaData $metaData)
	{
		return array (
				'timeUploaded' => $metaData->getTimeUploaded (),
				'width' => $metaData->getWidth (),
				'height' => $metaData->getHeight (),
				'size' => $metaData->getSize (),
				'id' => $metaData->getId () 
		);
	}
	public static function getResourceObject(ResourceFile $resource)
	{
		return array (
				'path' => $resource->getWebPath () 
		);
	}
}
