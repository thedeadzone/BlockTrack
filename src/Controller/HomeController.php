<?php
namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;


class HomeController extends AbstractController
{
    /**
     * @Route("/");
     *
     * Shows all the parcels the receiver is receiving
     */
    public function indexAction()
    {
        return $this->render('home/index.html.twig', [

        ]);
    }
}