<?php

namespace martingerdzhev\ImageAnnotatorBundle\Controller;

use Symfony\Component\Form\FormFactory;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use FOS\UserBundle\FOSUserEvents;
use FOS\UserBundle\Event\FormEvent;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\Event\GetResponseUserEvent;
use FOS\UserBundle\Model\UserInterface;

use FOS\UserBundle\Controller\ProfileController as BaseController;

// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class ProfileController extends Controller
{

	/**
	 * Show your own profile
	 * @throws AccessDeniedException - occurs if you are not logged in
	 */
	public function showAction() // edit to match fosuserbundle declaration
	{
	    $request = $this->container->get('request'); //edited to match fosuserbundle declaration
		$user = $this->container->get('security.context')->getToken()->getUser();
		if (!$this->container->get('imdc_terptube.authentication_manager')->isAuthenticated($request))
		{
			return new RedirectResponse($this->container->get('router')->generate('fos_user_security_login'));
		}
		$response = new RedirectResponse(
				$this->container->get('router')
						->generate('imdc_profile_user', array('userName' => $user->getUsername())));
		return $response;

	}

	/**
	 * Show the profile of a specific user
	 * @param unknown_type $userName - The user's profile to show
	 * @throws AccessDeniedException - occurs if you are not logged in
	 * @throws NotFoundHttpException - occurs if the user does not exist
	 */
	public function showSpecificAction(Request $request, $userName)
	{
		$user = $this->container->get('security.context')->getToken()->getUser();
		if (!$this->container->get('imdc_terptube.authentication_manager')->isAuthenticated($request))
		{
			return new RedirectResponse($this->container->get('router')->generate('fos_user_security_login'));
		}
		$userManager = $this->container->get('fos_user.user_manager');
		$userObject = $userManager->findUserByUsername($userName);
		if ($userObject == null)
		{
			throw new NotFoundHttpException("This user does not exist");
		}
		//$profile = $userObject->getProfile();
		/*8return $this->container->get('templating')
				->renderResponse(
						'IMDCTerpTubeBundle:Profile:show.html.'
								. $this->container->getParameter('fos_user.template.engine'),
						array('user' => $userObject, 'profile' => $profile));*/
        return $this->render('ImageAnnotatorBundle:_Profile:view.html.twig', array(
            'user' => $userObject,
            'profile' => $userObject->getProfile()
        ));
	}

	/**
	 * Edit the user
	 * If you try to edit a different user, not your own, you are redirected to only show their profile
	 */
	public function editAction(Request $request) //edit to match fosuserbundle declaration
	{
		$user = $this->container->get('security.context')->getToken()->getUser();
		if (!$this->container->get('imdc_terptube.authentication_manager')->isAuthenticated($request))
		{
			return new RedirectResponse($this->container->get('router')->generate('fos_user_security_login'));
		}
		
		/*
		$userName = $request->query->get('userName');
		if ($user->getUsername() != $userName)
		{
			$response = new RedirectResponse(
					$this->container->get('router')
							->generate('imdc_profile_user', array('userName' => $userName)));
			return $response;
		}
		*/
		
		$userManager = $this->container->get('fos_user.user_manager');
		$userObject = $userManager->findUserByUsername($user->getUsername());
		$profile = $userObject->getProfile();

		/** @var $dispatcher \Symfony\Component\EventDispatcher\EventDispatcherInterface */
		$dispatcher = $this->container->get('event_dispatcher');

		$event = new GetResponseUserEvent($user, $request);
		$dispatcher->dispatch(FOSUserEvents::PROFILE_EDIT_INITIALIZE, $event);

		if (null !== $event->getResponse())
		{
			return $event->getResponse();
		}

		/** @var $formFactory \FOS\UserBundle\Form\Factory\FactoryInterface */
		$formFactory = $this->container->get('fos_user.profile.form.factory');

		$form = $formFactory->createForm();
		$form->setData($profile);

		if ('POST' === $request->getMethod())
		{
			$form->bind($request);

			if ($form->isValid())
			{
				/** @var $userManager \FOS\UserBundle\Model\UserManagerInterface */
				$userManager = $this->container->get('fos_user.user_manager');

				$event = new FormEvent($form, $request);
				$dispatcher->dispatch(FOSUserEvents::PROFILE_EDIT_SUCCESS, $event);
				$userManager->updateUser($user);

				if (null === $response = $event->getResponse())
				{
					$url = $this->container->get('router')->generate('imdc_profile_me');
					$response = new RedirectResponse($url);
				}

				$dispatcher
						->dispatch(FOSUserEvents::PROFILE_EDIT_COMPLETED,
								new FilterUserResponseEvent($user, $request, $response));

				return $response;
			}
		}

		/*return $this->container->get('templating')
				->renderResponse(
						'IMDCTerpTubeBundle:Profile:edit.html.'
								. $this->container->getParameter('fos_user.template.engine'),
						array('form' => $form->createView()));*/
        return $this->render('ImageAnnotatorBundle:_Profile:edit.html.twig', array(
            'form' => $form->createView()
        ));
	}
}
