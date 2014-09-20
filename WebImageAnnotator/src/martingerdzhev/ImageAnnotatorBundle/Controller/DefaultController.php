<?php

namespace martingerdzhev\ImageAnnotatorBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('ImageAnnotatorBundle:Default:index.html.twig', array('name' => $name));
    }
}
