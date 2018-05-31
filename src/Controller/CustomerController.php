<?php
namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class CustomerController extends AbstractController
{
    /**
     * @Route("/parcels");
     *
     * Shows all the parcels the receiver is receiving
     */
    public function indexAction()
    {
        return $this->render('customer/index.html.twig', [

        ]);
    }

    /**
     * @Route("/parcels/{slug}");
     *
     * Detail page of a single parcel with all it's information on it
     *
     * @param $slug
     * @return Response
     */
    public function detailAction($slug)
    {
        return $this->render('customer/detail.html.twig', [
            'slug' => $slug,
        ]);
    }
}