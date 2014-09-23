<?php
 
namespace martingerdzhev\ImageAnnotatorBundle\Component\Authentication\Handler;
 
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\SecurityContext;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Router;
 
class LoginSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    
	protected $router;
	protected $security;
	
	public function __construct(Router $router, SecurityContext $security)
	{
		$this->router = $router;
		$this->security = $security;	
	}
	
    public function onAuthenticationSuccess(Request $request, TokenInterface $token)
    {
    	//Redirect users according to roles
    		if ($request->getSession()->has('redirectUrl'))
    			$redirectURL = $request->getSession()->remove('redirectUrl');
    		else 
    			$redirectURL = $this->router->generate('image_annotator_user_home');
            $response = new RedirectResponse($redirectURL);            
       
            
        return $response;
    }
    
}
?>