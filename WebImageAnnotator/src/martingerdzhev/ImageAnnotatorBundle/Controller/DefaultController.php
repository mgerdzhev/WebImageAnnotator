<?php

namespace martingerdzhev\ImageAnnotatorBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use FOS\UserBundle\Doctrine\UserManager;
use Doctrine\DBAL\DBALException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\SecurityContextInterface;

/**
 * This basic controller shows the home splash page of ImageAnnotator when a user is not
 * logged in
 */
class DefaultController extends Controller
{
	/**
	 * Matches the route for /
	 *
	 * @param Request $request        	
	 * @return \Symfony\Component\HttpFoundation\Response
	 */
	public function indexAction(Request $request)
	{
		if ($this->container->get('image_annotator.authentication_manager')->isAuthenticated($request))
		{
			return $this->redirect($this->generateUrl('image_annotator_user_home'));
		}
		
		$formFactory = $this->container->get('fos_user.registration.form.factory');
		$form = $formFactory->createForm();
		
		return $this->render('ImageAnnotatorBundle:_Default:index.html.twig', array (
				'form' => $form->createView() 
		));
	}
}