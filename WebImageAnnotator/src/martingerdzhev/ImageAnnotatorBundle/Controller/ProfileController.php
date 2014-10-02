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
		if (!$this->container->get('image_annotator.authentication_manager')->isAuthenticated($request))
		{
			return new RedirectResponse($this->container->get('router')->generate('fos_user_security_login'));
		}
		$response = new RedirectResponse(
				$this->container->get('router')
						->generate('image_annotator_profile_user', array('userName' => $user->getUsername())));
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
		if (!$this->container->get('image_annotator.authentication_manager')->isAuthenticated($request))
		{
			return new RedirectResponse($this->container->get('router')->generate('fos_user_security_login'));
		}
		$userManager = $this->container->get('fos_user.user_manager');
		$userObject = $userManager->findUserByUsername($userName);
		if ($userObject == null)
		{
			throw new NotFoundHttpException("This user does not exist");
		}
        return $this->render('ImageAnnotatorBundle:Profile:view.html.twig', array(
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
		if (!$this->container->get('image_annotator.authentication_manager')->isAuthenticated($request))
		{
			return new RedirectResponse($this->container->get('router')->generate('fos_user_security_login'));
		}
		
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
					$url = $this->container->get('router')->generate('image_annotator_profile_me');
					$response = new RedirectResponse($url);
				}

				$dispatcher
						->dispatch(FOSUserEvents::PROFILE_EDIT_COMPLETED,
								new FilterUserResponseEvent($user, $request, $response));

				return $response;
			}
		}

        return $this->render('ImageAnnotatorBundle:Profile:edit.html.twig', array(
            'form' => $form->createView()
        ));
	}
	
	public function updateAvatarAction(Request $request, $userName)
	{
		$user = $this->container->get('security.context')->getToken()->getUser();
		if (!$this->container->get('image_annotator.authentication_manager')->isAuthenticated($request))
		{
			return new RedirectResponse($this->container->get('router')->generate('fos_user_security_login'));
		}
		if ($user->getUsername() != $userName)
		{
			$response = new RedirectResponse(
					$this->container->get('router')
					->generate('image_annotator_profile_user', array('userName' => $userName)));
			return $response;
		}
		$userManager = $this->container->get('fos_user.user_manager');
		$userObject = $userManager->findUserByUsername($user->getUsername());
		$profile = $userObject->getProfile();
	
		$avatar = new Image();
		$avatar
		->setTitle(
				$this->container->get('translator')
				->trans('profile.show.avatar', array(), 'ImageAnnotatorBundle'));
	
		$formFactory = $this->container->get('form.factory');
	
		$form = $formFactory->create(new ImageMediaFormType(), $avatar, array());
	
		if ('POST' === $request->getMethod())
		{
			$form->bind($request);
	
			if ($form->isValid())
			{
				$avatar->setOwner($userObject);
				// flush object to database
				$em = $this->container->get('doctrine')->getManager();
				$em->persist($avatar);
				// Remove old avatar from DB:
				if (($oldAvatar = $profile->getAvatar()) !== null)
					$em->remove($profile->getAvatar());
				$profile->setAvatar($avatar);
	
				$em->flush();
	
				$this->container->get('session')->getFlashBag()->add('info', 'Avatar updated successfully!');
	
				$eventDispatcher = $this->container->get('event_dispatcher');
				$uploadedEvent = new UploadEvent($avatar);
				$eventDispatcher->dispatch(UploadEvent::EVENT_UPLOAD, $uploadedEvent);
	
				$url = $this->container->get('router')->generate('image_annotator_profile_me');
				$response = new RedirectResponse($url);
				return $response;
			}
		}
		return $this->render('ImageAnnotatorBundle:Profile:editAvatar.html.twig', array(
				'form' => $form->createView()
		));
	}
	
}
