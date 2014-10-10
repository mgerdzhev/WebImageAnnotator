<?php

namespace martingerdzhev\ImageAnnotatorBundle\Controller;
use Doctrine\ORM\EntityNotFoundException;

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
use martingerdzhev\ImageAnnotatorBundle\Model\JSEntities;

// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Request;

class MediaChooserGatewayController extends Controller
{
	const TYPE_ALL = 0;
	const TYPE_UPLOAD_IMAGE = 1;
	const TYPE_UPLOAD_GOOGLE = 2;
	const TYPE_UPLOAD_FLICKR = 3;

	public function chooseMediaByTypeAction(Request $request, $type)
	{
		if (!$this->container->get('image_annotator.authentication_manager')->isAuthenticated($request))
		{
			return $this->redirect($this->generateUrl('fos_user_security_login'));
		}
		return MediaChooserGatewayController::chooseMedia($request, $type);
	}

	private function chooseMedia(Request $request, $type)
	{
		$response = $this->redirect($this->generateUrl('image_annotator_user_home')); //Go home if bad type
		$prefix = "";
		if ($request->isXmlHttpRequest())
			$prefix = "ajax.";
		/*$path = array('url' => null,
				'_route' => $request->attributes->get('_route'),
				'_route_params' => $request->attributes->get('_route_params')
				);*/
		$path = array('url' => null);
		switch ($type)
		{
		case MediaChooserGatewayController::TYPE_ALL:
			$response = $this->forward('ImageAnnotatorBundle:AddFileGateway:gateway', $path);
			break;
		case MediaChooserGatewayController::TYPE_UPLOAD_IMAGE:
			$response = $this->forward('ImageAnnotatorBundle:AddFileGateway:addImage', $path);
			break;
		case MediaChooserGatewayController::TYPE_UPLOAD_GOOGLE:
			$response = $this->forward('ImageAnnotatorBundle:AddFileGateway:addImageGoogle', $path);
			break;
		case MediaChooserGatewayController::TYPE_UPLOAD_FLICKR:
			$response = $this->forward('ImageAnnotatorBundle:AddFileGateway:addImageFlickr', $path);
			break;
		}
		$this->get('session')->set('mediaChooseFinished', false);
		return $response;
	}

    public static function getUploadForms(Controller $controller) {
        $formImage = $controller->createForm(new ImageMediaFormType(), new Image(), array());

        return array(
            $formImage->createView(),
        );
    }
}
