<?php

namespace martingerdzhev\ImageAnnotatorBundle\Controller;

use Doctrine\ORM\EntityNotFoundException;
use Symfony\Component\Intl\Exception\NotImplementedException;
use martingerdzhev\ImageAnnotatorBundle\Event\UploadEvent;
use martingerdzhev\ImageAnnotatorBundle\Entity\Dataset;
use martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use martingerdzhev\ImageAnnotatorBundle\Filter\FileFilter;
use martingerdzhev\ImageAnnotatorBundle\Form\Type\DatasetFormType;
use martingerdzhev\ImageAnnotatorBundle\Controller\MediaChooserGatewayController;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use martingerdzhev\ImageAnnotatorBundle\Model\JSEntities;
use Symfony\Component\HttpFoundation\File\File;
use ZipArchive;
use Symfony\Component\Process\Process;
use Doctrine\Common\Util\Debug;
use Symfony\Component\HttpFoundation\StreamedResponse;

// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Request;

class DatasetGatewayController extends Controller
{
	const FEEDBACK_MESSAGE_NOT_OWNER = "Not the rightful owner";
	const FEEDBACK_MESSAGE_NOT_EXIST_MEDIA = "Dataset does not exist";
	const FEEDBACK_MESSAGE_NOT_EXIST_USER = "User does not exist";
	const ANNOTATION_TYPE_SHOW_ALL = "all";
	const ANNOTATION_TYPE_SHOW_DATASET = "dataset";
	const ANNOTATION_TYPE_SHOW_REMAINING = "remaining";
	
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
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		
		// $user = $this->getUser();
		$paginator = $this->get ( 'knp_paginator' );
		$resourceFiles = $paginator->paginate ( $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:Dataset' )->findAll (), $this->get ( 'request' )->query->get ( 'page', 1 ), /*page number*/
            25 /*limit per page*/
        );
		
		return $this->render ( 'ImageAnnotatorBundle:DatasetGateway:index.html.twig', array (
				'datasets' => $resourceFiles 
		) );
	}
	public function createAction(Request $request)
	{
		$user = $this->getUser ();
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$userManager = $this->container->get ( 'fos_user.user_manager' );
		$userObject = $userManager->findUserByUsername ( $user->getUsername () );
		if ($userObject == null)
		{
			throw new NotFoundHttpException ( "This user does not exist" );
		}
		$dataset = new Dataset ();
		
		$formFactory = $this->container->get ( 'form.factory' );
		
		$form = $formFactory->create ( new DatasetFormType (), $dataset, array () );
		
		if ('POST' === $request->getMethod ())
		{
			$form->bind ( $request );
			
			if ($form->isValid ())
			{
				// flush object to database
				$em = $this->container->get ( 'doctrine' )->getManager ();
				$dataset->setCreator ( $userObject );
				$em->persist ( $dataset );
				// Remove old avatar from DB:
				$em->flush ();
				
				$this->container->get ( 'session' )->getFlashBag ()->add ( 'dataset', 'Dataset created successfully!' );
				// $uploadedEvent->getResponse();
				$response = new RedirectResponse ( $this->generateUrl ( 'image_annotator_dataset_browse', array (
						'datasetId' => $dataset->getId () 
				) ) );
				return $response;
			}
		}
		$response = $this->render ( 'ImageAnnotatorBundle:DatasetGateway:' . 'create.html.twig', array (
				'form' => $form->createView (),
				'postUrl' => $this->generateUrl ( 'image_annotator_dataset_create' ) 
		) );
		// form not valid, show the basic form
		return $response;
	}
	public function showAnnotationTypesAction(Request $request, $datasetId, $type)
	{
		$user = $this->getUser ();
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$userManager = $this->container->get ( 'fos_user.user_manager' );
		$userObject = $userManager->findUserByUsername ( $user->getUsername () );
		if ($userObject == null)
		{
			throw new NotFoundHttpException ( "This user does not exist" );
		}
		if (! $request->isXmlHttpRequest ())
			throw new BadRequestHttpException ( 'Only Ajax POST calls accepted' );
		
		$logger = $this->container->get ( 'logger' );
		$logger->info ( "type:" . $type );
		$dataset = null;
		if ($type == DatasetGatewayController::ANNOTATION_TYPE_SHOW_ALL)
		{
			$annotationTypes = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:AnnotationType' )->findAll ();
		}
		else if ($type == DatasetGatewayController::ANNOTATION_TYPE_SHOW_DATASET)
		{
			$dataset = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
			if ($dataset == null)
				throw new NotFoundHttpException ( "This dataset does not exist" );
			$annotationTypes = $dataset->getAnnotationTypes ();
		}
		else if ($type == DatasetGatewayController::ANNOTATION_TYPE_SHOW_REMAINING)
		{
			$dataset = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
			if ($dataset == null)
				throw new NotFoundHttpException ( "This dataset does not exist" );
			$annotationTypes = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:AnnotationType' )->findNotInDataset ( $dataset );
		}
		else
			throw new NotFoundHttpException ( "This type does not exist" );
		
		$response = $this->render ( 'ImageAnnotatorBundle:Annotations:show.html.twig', array (
				'annotationTypes' => $annotationTypes,
				'dataset' => $dataset 
		) );
		$return = array (
				'page' => $response->getContent () 
		);
		$return = json_encode ( $return );
		$response = new Response ( $return, 200, array (
				'Content-Type' => 'application/json' 
		) );
		// form not valid, show the basic form
		return $response;
	}
	public function addAnnotationTypeAction(Request $request, $datasetId, $annotationTypeId)
	{
		$user = $this->getUser ();
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$userManager = $this->container->get ( 'fos_user.user_manager' );
		$userObject = $userManager->findUserByUsername ( $user->getUsername () );
		if ($userObject == null)
		{
			throw new NotFoundHttpException ( "This user does not exist" );
		}
		if (! $request->isXmlHttpRequest ())
			throw new BadRequestHttpException ( 'Only Ajax POST calls accepted' );
		$dataset = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
		if ($dataset == null)
			throw new NotFoundHttpException ( "This dataset does not exist" );
		
		$annotationType = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:AnnotationType' )->find ( $annotationTypeId );
		if ($annotationType == null)
			throw new NotFoundHttpException ( "This Annotation type does not exist" );
		if ($dataset->getAnnotationTypes ()->contains ( $annotationType ))
		{
			$return = array (
					'annotationType' => JSEntities::getAnnotationTypeObject ( $annotationType ),
					'responseCode' => 400 
			);
		}
		else
		{
			$em = $this->container->get ( 'doctrine' )->getManager ();
			$dataset->addAnnotationType ( $annotationType );
			$em->flush ();
			$return = array (
					'annotationType' => JSEntities::getAnnotationTypeObject ( $annotationType ),
					'responseCode' => 200 
			);
		}
		
		$return = json_encode ( $return ); // json encode the array
		return new Response ( $return, 200, array (
				'Content-Type' => 'application/json' 
		) );
	}
	public function removeAnnotationTypeAction(Request $request, $datasetId, $annotationTypeId)
	{
		$user = $this->getUser ();
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$userManager = $this->container->get ( 'fos_user.user_manager' );
		$userObject = $userManager->findUserByUsername ( $user->getUsername () );
		if ($userObject == null)
		{
			throw new NotFoundHttpException ( "This user does not exist" );
		}
		if (! $request->isXmlHttpRequest ())
			throw new BadRequestHttpException ( 'Only Ajax POST calls accepted' );
		$dataset = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
		if ($dataset == null)
			throw new NotFoundHttpException ( "This dataset does not exist" );
		if ($dataset->getCreator () != $userObject)
			throw new NotFoundHttpException ( "Not the owner of the dataset" );
		
		$logger = $this->container->get ( 'logger' );
		
		$annotationType = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:AnnotationType' )->find ( $annotationTypeId );
		if ($annotationType == null)
		{
			throw new NotFoundHttpException ( "Annotation Type not in the dataset" );
		}
		else
		{
			$em = $this->container->get ( 'doctrine' )->getManager ();
			$annotations = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:Dataset' )->findAnnotationsOfType ( $dataset, $annotationType );
			$dataset->removeAnnotationType ( $annotationType );
			// Remove all annotations of this type
			foreach ( $annotations as $annotation )
			{
				$em->remove ( $annotation );
			}
			$em->flush ();
			$return = array (
					'responseCode' => 200 
			);
		}
		$return = json_encode ( $return ); // json encode the array
		return new Response ( $return, 200, array (
				'Content-Type' => 'application/json' 
		) );
	}
	public function createAnnotationTypeAction(Request $request, $datasetId)
	{
		$user = $this->getUser ();
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$userManager = $this->container->get ( 'fos_user.user_manager' );
		$userObject = $userManager->findUserByUsername ( $user->getUsername () );
		if ($userObject == null)
		{
			throw new NotFoundHttpException ( "This user does not exist" );
		}
		if (! $request->isXmlHttpRequest ())
			throw new BadRequestHttpException ( 'Only Ajax POST calls accepted' );
		$dataset = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
		if ($dataset == null)
			throw new NotFoundHttpException ( "This dataset does not exist" );
		$name = $request->get ( 'name' );
		$logger = $this->container->get ( 'logger' );
		$logger->info ( "name:" . $name );
		if ($name == null || strlen ( $name ) < 2)
			throw new NotFoundHttpException ( "This name does not exist/Name too short" );
		
		$annotationType = $this->getDoctrine ()->getRepository ( 'ImageAnnotatorBundle:AnnotationType' )->findOneBy ( array (
				'name' => $name 
		) );
		if ($annotationType == null)
		{
			$annotationType = new AnnotationType ();
			$annotationType->setName ( $name );
			$em = $this->container->get ( 'doctrine' )->getManager ();
			$em->persist ( $annotationType );
			$dataset->addAnnotationType ( $annotationType );
			$em->flush ();
			$return = array (
					'annotationType' => JSEntities::getAnnotationTypeObject ( $annotationType ),
					'responseCode' => 200 
			);
		}
		else
		{
			return $this->forward ( 'ImageAnnotatorBundle:DatasetGateway:addAnnotationType', array (
					'datasetId' => $datasetId,
					'annotationTypeId' => $annotationType->getId () 
			) );
		}
		$return = json_encode ( $return ); // json encode the array
		return new Response ( $return, 200, array (
				'Content-Type' => 'application/json' 
		) );
	}
	
	/**
	 * An Ajax function that deletes a media with a specific media ID
	 *
	 * @param Request $request        	
	 * @param unknown_type $mediaId        	
	 */
	public function deleteDatasetAction(Request $request, $datasetId)
	{
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		if (! $request->isXmlHttpRequest ())
			throw new BadRequestHttpException ( 'Only Ajax POST calls accepted' );
		$user = $this->getUser ();
		$em = $this->get ( 'doctrine' )->getManager ();
		$dataset = $em->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
		if ($dataset !== null)
		{
			if ($dataset->getCreator () != $user)
			{
				$return = array (
						'responseCode' => 400,
						'feedback' => DatasetGatewayController::FEEDBACK_MESSAGE_NOT_OWNER 
				);
			}
			else
			{
				$em->remove ( $dataset );
				$em->flush ();
				$return = array (
						'responseCode' => 200,
						'feedback' => 'Successfully removed dataset!' 
				);
			}
		}
		else
		{
			$return = array (
					'responseCode' => 400,
					'feedback' => DatasetGatewayController::FEEDBACK_MESSAGE_NOT_EXIST_MEDIA 
			);
		}
		$return = json_encode ( $return ); // json encode the array
		return new Response ( $return, 200, array (
				'Content-Type' => 'application/json' 
		) );
	}
	
	/**
	 * An Ajax function that previews a media with a specific media ID
	 *
	 * @param Request $request        	
	 * @param unknown_type $mediaId        	
	 */
	public function browseAction(Request $request, $datasetId)
	{
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$em = $this->get ( 'doctrine' )->getManager ();
		$dataset = $em->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
		
		$responseURL = "";
		
		if ($dataset !== null)
		{
			$responseURL = 'ImageAnnotatorBundle:DatasetGateway:' . 'browse.html.twig';
		}
		else
		{
			throw new EntityNotFoundException ( "Cannot find dataset with that ID" );
		}
		$paginator = $this->get ( 'knp_paginator' );
		$resourceFiles = $paginator->paginate ( $dataset->getImages (), $this->get ( 'request' )->query->get ( 'page', 1 ), /*page number*/
				20 /*limit per page*/
				);
		$response = $this->render ( $responseURL, array (
				'dataset' => $dataset,
				'resourceFiles' => $resourceFiles,
				'uploadForms' => MediaChooserGatewayController::getUploadForms ( $this ) 
		) );
		
		return $response;
	}
	
	/**
	 * An Ajax function that Updates a media with a specific media ID
	 * For now it is used to only update the media title
	 *
	 * @param Request $request        	
	 * @param unknown_type $mediaId        	
	 */
	public function updateDatasetAction(Request $request, $datasetId)
	{
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		if (! $request->isXmlHttpRequest ())
			throw new BadRequestHttpException ( 'Only Ajax POST calls accepted' );
		$user = $this->getUser ();
		$em = $this->get ( 'doctrine' )->getManager ();
		$datasetToUpdate = $em->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
		
		if ($datasetToUpdate == null)
		{
			$return = array (
					'responseCode' => 400,
					'feedback' => DatasetGatewayController::FEEDBACK_MESSAGE_NOT_EXIST_MEDIA 
			);
		}
		else if ($datasetToUpdate->getOwner () != $user)
		{
			$return = array (
					'responseCode' => 400,
					'feedback' => DatasetGatewayController::FEEDBACK_MESSAGE_NOT_OWNER 
			);
		}
		else
		{
			$dataset = json_decode ( $request->get ( 'dataset' ), true );
			if ($datasetToUpdate !== null && $dataset != null && $dataset ['name'] !== null)
			{
				$datasetToUpdate->setName ( $dataset ['name'] );
				$em->flush ();
				$return = array (
						'responseCode' => 200,
						'feedback' => 'Successfully Updated dataset!' 
				);
			}
			else
			{
				$return = array (
						'responseCode' => 400,
						'feedback' => DatasetGatewayController::FEEDBACK_MESSAGE_NOT_EXIST_MEDIA 
				);
			}
		}
		$return = json_encode ( $return ); // json encode the array
		return new Response ( $return, 200, array (
				'Content-Type' => 'application/json' 
		) );
	}
	
	/**
	 * Action to export a specific dataset as a json array
	 *
	 * @param Request $request        	
	 * @param unknown $datasetId        	
	 * @return \martingerdzhev\ImageAnnotatorBundle\Controller\StreamedResponse
	 */
	public function exportAction(Request $request, $datasetId)
	{
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$em = $this->get ( 'doctrine' )->getManager ();
		$dataset = $em->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
		
		$responseURL = "";
		
		if ($dataset == null)
		{
			throw new EntityNotFoundException ( "Cannot find dataset with that ID" );
		}
		
		$return = array (
				'dataset' => JSEntities::exportDatasetObject ( $dataset ) 
		);
		// get the service container to pass to the closure
		$return = json_encode ( $return );
		$return = str_replace ( 'uploads\/', '', $return );
		$response = new Response ( $return, 200 );
		
		$response->headers->set ( 'Content-Type', 'application/force-download' );
		$response->headers->set ( 'Content-Disposition', 'attachment; filename="export.json"' );
		
		return $response;
	}
	public function requestDownloadImagesAction(Request $request, $datasetId)
	{
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$em = $this->get ( 'doctrine' )->getManager ();
		$dataset = $em->getRepository ( 'ImageAnnotatorBundle:Dataset' )->find ( $datasetId );
		
		if ($dataset == null)
		{
			throw new EntityNotFoundException ( "Cannot find dataset with that ID" );
		}
		
		$tmpFileName = tempnam ( "/tmp", "images" );
		$fileString = '';
		foreach ( $dataset->getImages () as $image )
		{
			$fileString .= $image->getResource ()->getAbsolutePath () . ' ';
		}
		$process = new Process ( '/usr/bin/zip -j ' . $tmpFileName . ' ' . $fileString . ' && echo 0 >' . $tmpFileName . '.done' );
		
		// $this->get('session')->set('processFile', $tmpFileName2);
		$this->get ( 'session' )->set ( 'downloadFile', $tmpFileName );
		
		$process->start ();
		
		$return = array (
				'feedback' => 'started' 
		);
		$return = json_encode ( $return );
		$response = new Response ( $return, 200, array (
				'Content-Type' => 'application/json' 
		) );
		
		return $response;
	}
	public function checkDownloadStatusAction(Request $request)
	{
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$em = $this->get ( 'doctrine' )->getManager ();
		$checkFile = $this->get ( 'session' )->get ( 'downloadFile' ) . '.zip';
		
		// $process = unserialize(file_get_contents($processFile));
		$status = file_exists ( $checkFile );
		$return = array (
				'status' => $status 
		);
		$return = json_encode ( $return );
		$response = new Response ( $return, 200, array (
				'Content-Type' => 'application/json' 
		) );
		
		return $response;
	}
	public function downloadImagesAction(Request $request)
	{
		if (! $this->container->get ( 'image_annotator.authentication_manager' )->isAuthenticated ( $request ))
		{
			return $this->redirect ( $this->generateUrl ( 'fos_user_security_login' ) );
		}
		$em = $this->get ( 'doctrine' )->getManager ();
		
		$tmpFileName = $this->get ( 'session' )->get ( 'downloadFile' );
		$fileSize = filesize ( $tmpFileName.'.zip' ) ;
		if ($tmpFileName == null)
		{
			throw new EntityNotFoundException ( "Cannot find process with that ID" );
		}
		// $this->get ( 'session' )->remove ( 'process' );
		$response = new StreamedResponse ( function () use ($tmpFileName)
		{
			$handle = fopen ( $tmpFileName . '.zip', 'rb' );
			fpassthru ( $handle );
			fclose ( $handle );
			unlink($tmpFileName);
			unlink($tmpFileName. '.zip');
		} );
		$response->headers->set ( 'Content-Type', 'application/zip' );
		$response->headers->set ( 'Content-Disposition', 'attachment; filename=images.zip' );
		$response->headers->set ( 'Content-Length', $fileSize);
		
		$this->get ( 'session' )->remove ( 'downloadFile' );
		return $response;
	}
	
	private function createZipAction($dataset)
	{
		$tmpFileName = tempnam ( "/tmp", "images" );
		$fileString = '';
		foreach ( $dataset->getImages () as $image )
		{
			$fileString .= $image->getResource ()->getAbsolutePath () . ' ';
		}
		$process = new Process ( '/usr/bin/zip -j ' . $tmpFileName . ' ' . $fileString );
		
		$process->start ();
		// $this->get('session')->set('process', $process);
		$this->get ( 'session' )->set ( 'downloadFile', $tmpFileName );
	}
}
