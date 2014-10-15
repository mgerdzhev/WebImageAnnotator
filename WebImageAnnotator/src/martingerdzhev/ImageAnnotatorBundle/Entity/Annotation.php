<?php

namespace martingerdzhev\ImageAnnotatorBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Annotation
 */
class Annotation
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @var \DateTime
     */
    private $dateCreated;

    /**
     * @var \DateTime
     */
    private $dateModified;

    /**
     * @var \martingerdzhev\ImageAnnotatorBundle\Entity\User
     */
    private $creator;

    /**
     * @var \martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType
     */
    private $type;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set dateCreated
     *
     * @param \DateTime $dateCreated
     * @return Annotation
     */
    public function setDateCreated($dateCreated)
    {
        $this->dateCreated = $dateCreated;

        return $this;
    }

    /**
     * Get dateCreated
     *
     * @return \DateTime 
     */
    public function getDateCreated()
    {
        return $this->dateCreated;
    }

    /**
     * Set dateModified
     *
     * @param \DateTime $dateModified
     * @return Annotation
     */
    public function setDateModified($dateModified)
    {
        $this->dateModified = $dateModified;

        return $this;
    }

    /**
     * Get dateModified
     *
     * @return \DateTime 
     */
    public function getDateModified()
    {
        return $this->dateModified;
    }

    /**
     * Set creator
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\User $creator
     * @return Annotation
     */
    public function setCreator(\martingerdzhev\ImageAnnotatorBundle\Entity\User $creator = null)
    {
        $this->creator = $creator;

        return $this;
    }

    /**
     * Get creator
     *
     * @return \martingerdzhev\ImageAnnotatorBundle\Entity\User 
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * Set type
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType $type
     * @return Annotation
     */
    public function setType(\martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType $type = null)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return \martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType 
     */
    public function getType()
    {
        return $this->type;
    }
    /**
     * @var \martingerdzhev\ImageAnnotatorBundle\Entity\Image
     */
    private $image;


    /**
     * Set image
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\Image $image
     * @return Annotation
     */
    public function setImage(\martingerdzhev\ImageAnnotatorBundle\Entity\Image $image = null)
    {
        $this->image = $image;

        return $this;
    }

    /**
     * Get image
     *
     * @return \martingerdzhev\ImageAnnotatorBundle\Entity\Image 
     */
    public function getImage()
    {
        return $this->image;
    }
    /**
     * @var array
     */
    private $polygon;


    /**
     * Set polygon
     *
     * @param array $polygon
     * @return Annotation
     */
    public function setPolygon($polygon)
    {
        $this->polygon = $polygon;

        return $this;
    }

    /**
     * Get polygon
     *
     * @return array 
     */
    public function getPolygon()
    {
        return $this->polygon;
    }

    /**
     * @ORM\PrePersist
     */
    public function setCreatedDateToNow()
    {
        $this->dateCreated = new \DateTime('NOW');
        $this->dateModified = new \DateTime('NOW');
    }
}
