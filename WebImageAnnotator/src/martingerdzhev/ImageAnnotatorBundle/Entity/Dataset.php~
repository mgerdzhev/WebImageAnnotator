<?php

namespace martingerdzhev\ImageAnnotatorBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Dataset
 */
class Dataset
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @var \DateTime
     */
    private $createdDate;

    /**
     * @var string
     */
    private $name;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $images;

    /**
     * @var \martingerdzhev\ImageAnnotatorBundle\Entity\User
     */
    private $creator;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->images = new \Doctrine\Common\Collections\ArrayCollection();
    }

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
     * Set createdDate
     *
     * @param \DateTime $createdDate
     * @return Dataset
     */
    public function setCreatedDate($createdDate)
    {
        $this->createdDate = $createdDate;

        return $this;
    }

    /**
     * Get createdDate
     *
     * @return \DateTime 
     */
    public function getCreatedDate()
    {
        return $this->createdDate;
    }

    /**
     * Set name
     *
     * @param string $name
     * @return Dataset
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string 
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Add images
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\Image $images
     * @return Dataset
     */
    public function addImage(\martingerdzhev\ImageAnnotatorBundle\Entity\Image $images)
    {
        $this->images[] = $images;

        return $this;
    }

    /**
     * Remove images
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\Image $images
     */
    public function removeImage(\martingerdzhev\ImageAnnotatorBundle\Entity\Image $images)
    {
        $this->images->removeElement($images);
    }

    /**
     * Get images
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getImages()
    {
        return $this->images;
    }

    /**
     * Set creator
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\User $creator
     * @return Dataset
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
     * @ORM\PrePersist
     */
    public function setCreatedDateToNow()
    {
        $this->createdDate = new \DateTime('NOW');
    }
    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    private $annotationTypes;


    /**
     * Add annotationTypes
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType $annotationTypes
     * @return Dataset
     */
    public function addAnnotationType(\martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType $annotationTypes)
    {
        $this->annotationTypes[] = $annotationTypes;

        return $this;
    }

    /**
     * Remove annotationTypes
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType $annotationTypes
     */
    public function removeAnnotationType(\martingerdzhev\ImageAnnotatorBundle\Entity\AnnotationType $annotationTypes)
    {
        $this->annotationTypes->removeElement($annotationTypes);
    }

    /**
     * Get annotationTypes
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getAnnotationTypes()
    {
        return $this->annotationTypes;
    }
}
