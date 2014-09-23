<?php

namespace martingerdzhev\ImageAnnotatorBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Image
 */
class Image
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @var string
     */
    private $title;

    /**
     * @var \martingerdzhev\ImageAnnotatorBundle\Entity\MetaData
     */
    private $metaData;

    /**
     * @var \martingerdzhev\ImageAnnotatorBundle\Entity\ResourceFile
     */
    private $resource;


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
     * Set title
     *
     * @param string $title
     * @return Image
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string 
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set metaData
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\MetaData $metaData
     * @return Image
     */
    public function setMetaData(\martingerdzhev\ImageAnnotatorBundle\Entity\MetaData $metaData = null)
    {
        $this->metaData = $metaData;

        return $this;
    }

    /**
     * Get metaData
     *
     * @return \martingerdzhev\ImageAnnotatorBundle\Entity\MetaData 
     */
    public function getMetaData()
    {
        return $this->metaData;
    }

    /**
     * Set resource
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\ResourceFile $resource
     * @return Image
     */
    public function setResource(\martingerdzhev\ImageAnnotatorBundle\Entity\ResourceFile $resource = null)
    {
        $this->resource = $resource;

        return $this;
    }

    /**
     * Get resource
     *
     * @return \martingerdzhev\ImageAnnotatorBundle\Entity\ResourceFile 
     */
    public function getResource()
    {
        return $this->resource;
    }
}
