<?php

namespace martingerdzhev\ImageAnnotatorBundle\Controller;

use Symfony\Component\HttpFoundation\Request;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class HomeController extends Controller
{
    /**
     * The 'homepage' controller, shows recent activity in 3 areas: Forums, Threads, and Posts
     * 
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
	public function indexAction(Request $request)
	{
		// check if user logged in
		if (!$this->container->get('image_annotator.authentication_manager')->isAuthenticated($request)) {
			return $this->redirect($this->generateUrl('image_annotator_homepage'));
		}

		return $this->render('ImageAnnotatorBundle:_Home:index.html.twig');
	}
}
