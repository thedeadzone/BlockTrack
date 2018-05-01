<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class DeliveryController extends AbstractController
{
    /**
     * @Route("/delivery");
     *
     * Shows all the parcels the delivery person has as owner currently
     */
    public function homeAction()
    {

        return new Response('Test 123');
    }

    /**
     * @Route("/delivery/{slug}");
     *
     * Detail page of a single parcel with all it's information on it
     *
     * @param $slug
     * @return Response
     */
    public function detailAction($slug)
    {
        // ACTION THAT GETS INFO FROM Blockchain

        return $this->render('delivery/detail.html.twig', [
            'title' => ucwords(str_replace('-', ' ', $slug)),
        ]);
    }
}