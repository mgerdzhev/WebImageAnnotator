<?php
namespace martingerdzhev\ImageAnnotatorBundle\Event;

use martingerdzhev\ImageAnnotatorBundle\Entity\Image;

use martingerdzhev\ImageAnnotatorBundle\Entity\ResourceFile;
use Symfony\Component\EventDispatcher\Event;

class UploadEvent extends Event
{
	protected $media;
	const EVENT_UPLOAD = "image_annotator.event.uploadEvent";
	
	public function __construct(Image $media)
	{
		$this->media = $media;
	}
	
	public function getMedia()
	{
		return $this->media;
	}
}
