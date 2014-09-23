<?php
 
namespace martingerdzhev\ImageAnnotatorBundle\Component\Authentication\Handler;
 
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\SecurityContext;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Bundle\FrameworkBundle\Routing\Router;
 
class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
	
	protected $router;
	
	public function __construct(Router $router, SecurityContext $security)
	{
		$this->router = $router;
		$this->security = $security;	
	}
	
    public function onLogoutSuccess(Request $request)
    {
        // redirect the user to where they were before the login process begun.
        $referer_url = $request->headers->get('referer');
                    
        $response = new RedirectResponse($referer_url);        
        return $response;
    }
    
}


?>