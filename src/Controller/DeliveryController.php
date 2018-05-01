<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class DeliveryController
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
     */
    public function detailAction($slug)
    {
        return new Response(sprintf(
            'Something: %s', $slug
        ));
    }
}