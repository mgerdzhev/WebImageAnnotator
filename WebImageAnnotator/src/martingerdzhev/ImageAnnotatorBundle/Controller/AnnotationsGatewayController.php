<?php

namespace martingerdzhev\ImageAnnotatorBundle\Controller;

use Doctrine\ORM\EntityNotFoundException;
use Symfony\Component\Intl\Exception\NotImplementedException;
use martingerdzhev\ImageAnnotatorBundle\Event\UploadEvent;
use martingerdzhev\ImageAnnotatorBundle\Entity\Image;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use martingerdzhev\ImageAnnotatorBundle\Filter\FileFilter;
use martingerdzhev\ImageAnnotatorBundle\Form\Type\ImageMediaFormType;
use martingerdzhev\ImageAnnotatorBundle\Controller\MediaChooserGatewayController;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use martingerdzhev\ImageAnnotatorBundle\Model\JSEntities;
use Symfony\Component\HttpFoundation\File\File;

// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Request;

class AnnotationsGatewayController extends Controller
{
	
	const FEEDBACK_MESSAGE_NOT_OWNER = "Not the rightful owner";
	const FEEDBACK_MESSAGE_NOT_EXIST_MEDIA = "Media does not exist";
	const FEEDBACK_MESSAGE_NOT_EXIST_USER = "User does not exist";
	
	/**
	 * A gateway form for uploading/recording or selecting existing files
	 *
	 * @throws AccessDeniedException
	 * @throws NotFoundHttpException
	 * @throws BadRequestHttpException
	 * @return \Symfony\Component\HttpFoundation\Response
	 */
	public function gatewayAction(Request $request)
	{
		if (! $this->container->get('image_annotator.authentication_manager')->isAuthenticated($request)) {
			return $this->redirect($this->generateUrl('fos_user_security_login'));
		}

		$user = $this->getUser();

        $paginator = $this->get('knp_paginator');
        $resourceFiles = $paginator->paginate(
            $user->getAnnotations(),
            $this->get('request')->query->get('page', 1), /*page number*/
            25 /*limit per page*/
        );

        return $this->render('ImageAnnotatorBundle:Annotations:index.html.twig', array (
            'resourceFiles' => $resourceFiles,
            'uploadForms' => MediaChooserGatewayController::getUploadForms($this)
		));
	}
	
	/**
	 * An Ajax function that deletes a media with a specific media ID
	 *
	 * @param Request $request        	
	 * @param unknown_type $mediaId        	
	 */
	public function deleteMediaAction(Request $request, $mediaId)
	{
		if (! $this->container->get('image_annotator.authentication_manager')->isAuthenticated($request))
		{
			return $this->redirect($this->generateUrl('fos_user_security_login'));
		}
		if (! $request->isXmlHttpRequest())
			throw new BadRequestHttpException('Only Ajax POST calls accepted');
		$user = $this->getUser();
		$em = $this->get('doctrine')->getManager();
		/**
		 *
		 * @var $media martingerdzhev\ImageAnnotatorBundle\Entity\Image
		 */
		$media = $em->getRepository('ImageAnnotatorBundle:Image')->find($mediaId);
		if ($media !== null)
		{
			if ($media->getOwner() != $user)
			{
				$return = array (
						'responseCode' => 400,
						'feedback' => ImageGatewayController::FEEDBACK_MESSAGE_NOT_OWNER
				);
			}
			else {
				$em->remove($media);
				$em->flush();
				$return = array (
						'responseCode' => 200,
						'feedback' => 'Successfully removed media!' 
				);
			}
		}
		else
		{
			$return = array (
					'responseCode' => 400,
					'feedback' => ImageGatewayController::FEEDBACK_MESSAGE_NOT_EXIST_MEDIA
			);
		}
		$return = json_encode($return); // json encode the array
		return new Response($return, 200, array (
				'Content-Type' => 'application/json' 
		));
	}
	
	/**
	 * An Ajax function that previews a media with a specific media ID
	 *
	 * @param Request $request        	
	 * @param unknown_type $mediaId        	
	 */
	public function previewMediaAction(Request $request, $mediaId)
	{
		if (! $this->container->get('image_annotator.authentication_manager')->isAuthenticated($request))
		{
			return $this->redirect($this->generateUrl('fos_user_security_login'));
		}
		if (! $request->isXmlHttpRequest())
			throw new BadRequestHttpException('Only Ajax POST calls accepted');
		$user = $this->getUser();
		$em = $this->get('doctrine')->getManager();
		/**
		 *
		 * @var $media martingerdzhev\ImageAnnotatorBundle\Entity\Image
		 */
		$media = $em->getRepository('ImageAnnotatorBundle:Image')->find($mediaId);
		
		$responseURL = "";
		
		if ($request->isXmlHttpRequest())
		{
			$prefix = "ajax.";
		}
		// form not valid, show the basic form
		if ($media !== null)
		{
			$responseURL = 'ImageAnnotatorBundle:Media:' . $prefix . 'previewImage.html.twig';
		}
		else
		{
			throw new EntityNotFoundException("Cannot find media with that ID");
		}
		$response = $this->render($responseURL, array (
				'mediaFile' => $media 
		));
		
		if ($request->isXmlHttpRequest())
		{
			$return = array (
					'page' => $response->getContent(),
					'media' => JSEntities::getMediaObject($media) 
			);
			$return = json_encode($return); // json encode the array
			$response = new Response($return, 200, array (
					'Content-Type' => 'application/json' 
			));
		}
		
		return $response;
	}

	/**
	 * An Ajax function that Updates a media with a specific media ID
	 * For now it is used to only update the media title
	 *
	 * @param Request $request        	
	 * @param unknown_type $mediaId        	
	 */
	public function updateMediaAction(Request $request, $mediaId)
	{
		if (! $this->container->get('image_annotator.authentication_manager')->isAuthenticated($request))
		{
			return $this->redirect($this->generateUrl('fos_user_security_login'));
		}
		if (! $request->isXmlHttpRequest())
			throw new BadRequestHttpException('Only Ajax POST calls accepted');
		$user = $this->getUser();
		$em = $this->get('doctrine')->getManager();
		/**
		 *
		 * @var $media martingerdzhev\ImageAnnotatorBundle\Entity\Image
		 */
		$mediaToUpdate = $em->getRepository('ImageAnnotatorBundle:Image')->find($mediaId);
		
		if ($mediaToUpdate == null)
		{
			$return = array (
					'responseCode' => 400,
					'feedback' => ImagesGatewayController::FEEDBACK_MESSAGE_NOT_EXIST_MEDIA
			);
		}
		else if ($mediaToUpdate->getOwner() != $user)
		{
			$return = array (
					'responseCode' => 400,
					'feedback' => ImagesGatewayController::FEEDBACK_MESSAGE_NOT_OWNER 
			);
		}
		else
		{
			$media = json_decode($request->get('media'), true);
			if ($mediaToUpdate !== null && $media != null && $media ['title'] !== null)
			{
				$mediaToUpdate->setTitle($media ['title']);
				$em->flush();
				$return = array (
						'responseCode' => 200,
						'feedback' => 'Successfully Updated media!' 
				);
			}
			else
			{
				$return = array (
						'responseCode' => 400,
						'feedback' => ImagesGatewayController::FEEDBACK_MESSAGE_NOT_EXIST_MEDIA
				);
			}
		}
		$return = json_encode($return); // json encode the array
		return new Response($return, 200, array (
				'Content-Type' => 'application/json' 
		));
	}
}