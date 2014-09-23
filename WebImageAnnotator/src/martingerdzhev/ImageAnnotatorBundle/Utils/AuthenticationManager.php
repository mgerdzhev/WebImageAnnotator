<?php
namespace martingerdzhev\ImageAnnotatorBundle\Utils;
use Symfony\Component\Security\Core\SecurityContext;

use Symfony\Component\HttpFoundation\Request;

class AuthenticationManager
{
	
	private $securityContext;
	
	public function __construct(SecurityContext $securityContext)
	{
		$this->securityContext = $securityContext;
	}

	public function isAuthenticated(Request $request)
	{
		if (!$this->securityContext->isGranted('IS_AUTHENTICATED_REMEMBERED'))
		{
			//$request->getSession()->getFlashBag()->add('notice', 'Please log in first');
			$request->getSession()->set('redirectUrl', $request->getUri());
			//return $this->redirect($this->generateUrl('fos_user_security_login'));
			return false;
		}
		return true;
	}

}
?>