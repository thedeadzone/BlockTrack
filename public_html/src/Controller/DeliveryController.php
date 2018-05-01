<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class DeliveryController
{
    /**
     * @Route("/");
     */
    public function deliveryAction()
    {

        return new Response('Test 123');
    }

    /**
     * @Route("/delivery");
     */
    public function tryThis()
    {
        return new Response('ff');
    }
}