<?php
namespace martingerdzhev\ImageAnnotatorBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;

use martingerdzhev\ImageAnnotatorBundle\Entity\MetaData;

use martingerdzhev\ImageAnnotatorBundle\Entity\Image;

use martingerdzhev\ImageAnnotatorBundle\Event\UploadEvent;

class UploadListener implements EventSubscriberInterface
{
	private $logger;
	private $doctrine;
	
	public function __construct($logger, $doctrine)
	{
		$this->logger = $logger;
		$this->doctrine = $doctrine;
	}
	
	public static function getSubscribedEvents()
	{
		return array(
				UploadEvent::EVENT_UPLOAD => 'onUpload',
		);
	}
	
	/**
	 * Trigerred when a file is uploaded
	 * @param UploadEvent $event
	 */
	public function onUpload(UploadEvent $event)
	{
		//TODO look into resizing images
		$media = $event->getMedia();
		$metaData = new MetaData();
		$fileSize = filesize($media->getResource()->getAbsolutePath());
		
		//TODO generate md5 hash and check if other images with same size have the same hash in order to avoid duplicates
		$metaData->setTimeUploaded(new \DateTime('now'));
		
		$em = $this->doctrine->getManager();
		//Transcode the different types and populate the metadata for the proper type
		$this->logger->info("Uploaded an image media");
		
		$imageSize = getimagesize($media->getResource()->getAbsolutePath());
		$metaData->setWidth($imageSize[0]);
		$metaData->setHeight($imageSize[1]);
		$metaData->setSize($fileSize);

		$em->persist($metaData);
		$media->setMetaData($metaData);
			
		$em->flush();
	}
}
