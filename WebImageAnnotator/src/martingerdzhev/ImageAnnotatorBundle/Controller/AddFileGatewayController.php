<?php

namespace martingerdzhev\ImageAnnotatorBundle\Controller;

use martingerdzhev\ImageAnnotatorBundle\Entity\MetaData;
use martingerdzhev\ImageAnnotatorBundle\Entity\ResourceFile;
use Symfony\Component\Intl\Exception\NotImplementedException;
use martingerdzhev\ImageAnnotatorBundle\Event\UploadEvent;
use martingerdzhev\ImageAnnotatorBundle\Entity\Image;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use martingerdzhev\ImageAnnotatorBundle\Filter\FileFilter;
use martingerdzhev\ImageAnnotatorBundle\Form\Type\ImageMediaFormType;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Filesystem\Exception\IOException;
use martingerdzhev\ImageAnnotatorBundle\Model\JSEntities;

class AddFileGatewayController extends Controller {
	
	/**
	 * A gateway form for uploadingor selecting existing files
	 *
	 * @throws AccessDeniedException
	 * @throws NotFoundHttpException
	 * @throws BadRequestHttpException
	 * @return \Symfony\Component\HttpFoundation\Response
	 */
	public function gatewayAction(Request $request) {
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request )) {
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$user = $this->getUser ();
		$resourceFiles = $user->getResourceFiles ();
		
		$prefix = "";
		if ($request->isXmlHttpRequest ()) {
			$prefix = "ajax.";
		}
		
		$response = $this->render('ImageAnnotator:_MyFiles:'.$prefix.'index.html.twig', array(
		    'resourceFiles' => $resourceFiles
		));
		
		// form not valid, show the basic form
		if ($request->isXmlHttpRequest ()) {
			$return = array (
					'page' => $response->getContent ()
			);
			$return = json_encode ( $return ); // json encode the array
			$response = new Response ( $return, 200, array (
					'Content-Type' => 'application/json' 
			) );
		}
		return $response;
	}
	
	public function addImageAction(Request $request, $url) {
		$user = $this->getUser ();
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request )) {
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$userManager = $this->container->get ( 'fos_user.user_manager' );
		$userObject = $userManager->findUserByUsername ( $user->getUsername () );
		if ($userObject == null) {
			throw new NotFoundHttpException ( "This user does not exist" );
		}
		$imageMedia = new Image();
		
		$formFactory = $this->container->get ( 'form.factory' );
		
		$form = $formFactory->create ( new ImageMediaFormType (), $imageMedia, array () );
		
		$prefix = "";
		if ($request->isXmlHttpRequest ()) {
			$prefix = "ajax.";
		}
		
		if ('POST' === $request->getMethod ()) {
			$form->bind ( $request );
			
			if ($form->isValid ()) {
				$imageMedia->setOwner ( $userObject );
				// flush object to database
				$em = $this->container->get ( 'doctrine' )->getManager ();
				$em->persist ( $imageMedia );
				// Remove old avatar from DB:
				$userObject->addResourceFile ( $imageMedia );
				
				$em->flush ();
				
				$this->container->get ( 'session' )->getFlashBag ()->add ( 'media', 'Image file uploaded successfully!' );
				
				$eventDispatcher = $this->container->get ( 'event_dispatcher' );
				$uploadedEvent = new UploadEvent ( $imageMedia );
				$eventDispatcher->dispatch ( UploadEvent::EVENT_UPLOAD, $uploadedEvent );
				
				// $uploadedEvent->getResponse();
				if ($request->isXmlHttpRequest ()) {
					$response = array (
							'page' => null,
							'finished' => true,
							'media' => JSEntities::getMediaObject ( $imageMedia ) 
					);
					$response = json_encode ( $response ); // json encode the array
					return new Response ( $response, 200, array (
							'Content-Type' => 'application/json' 
					) );
				} else if ($url === null) {
					$response = new RedirectResponse ( $this->generateUrl ( 'image_annotator_annotations_list_images' ) );
				} else {
					$response = new RedirectResponse ( $url );
				}
				return $response;
			}
		}
		$response = $this->render ( 'ImageAnnotatorBundle:AddFileGateway:' . $prefix . 'addFile.html.twig', array (
				'form' => $form->createView (),
				'postUrl' => $this->generateUrl ( 'image_annotator_image_add_image' )
		) );
		// form not valid, show the basic form
		if ($request->isXmlHttpRequest ()) {
			$return = array (
					'page' => $response->getContent (),
					'finished' => false 
			);
			$return = json_encode ( $return ); // json encode the array
			$response = new Response ( $return, 200, array (
					'Content-Type' => 'application/json' 
			) );
		}
		return $response;
	}
}
