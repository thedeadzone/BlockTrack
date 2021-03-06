<?php
namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class AdminController extends AbstractController
{
    /**
     * @Route("/admin");
     *
     * Shows all the parcels the receiver is receiving
     */
    public function homeAction()
    {
        return $this->render('admin/index.html.twig', [

        ]);
    }

    /**
     * @Route("/admin/{slug}");
     *
     * Detail page of a single parcel with all it's information on it
     *
     * @param $slug
     * @return Response
     */
    public function detailAction($slug)
    {
        return $this->render('admin/detail.html.twig', [
            'slug' => $slug,
        ]);
    }


    /**
     * @Route("/admin/create");
     *
     * Page where you can create all required tokens
     *
     * @return Response
     */
    public function createAction()
    {
        return $this->render('admin/create.html.twig', [

        ]);
    }
}