<?php

namespace martingerdzhev\ImageAnnotatorBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use FOS\UserBundle\Model\User as BaseUser;

/**
 * User
 */
class User extends BaseUser
{
    /**
     * @var integer
     */
    protected $id;

    /**
     * @var \DateTime
     */
    protected $joinDate;

    /**
     * @var \martingerdzhev\ImageAnnotatorBundle\Entity\UserProfile
     */
    protected $profile;

    /**
     * @var \Doctrine\Common\Collections\Collection
     */
    protected $annotations;

    /**
     * Constructor
     */
    public function __construct()
    {
    	parent::__construct();
        $this->annotations = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set joinDate
     *
     * @param \DateTime $joinDate
     * @return User
     */
    public function setJoinDate($joinDate)
    {
        $this->joinDate = $joinDate;

        return $this;
    }

    /**
     * Get joinDate
     *
     * @return \DateTime 
     */
    public function getJoinDate()
    {
        return $this->joinDate;
    }

    /**
     * Set profile
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\UserProfile $profile
     * @return User
     */
    public function setProfile(\martingerdzhev\ImageAnnotatorBundle\Entity\UserProfile $profile = null)
    {
        $this->profile = $profile;

        return $this;
    }

    /**
     * Get profile
     *
     * @return \martingerdzhev\ImageAnnotatorBundle\Entity\UserProfile 
     */
    public function getProfile()
    {
        return $this->profile;
    }

    /**
     * Add annotations
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\Annotation $annotations
     * @return User
     */
    public function addAnnotation(\martingerdzhev\ImageAnnotatorBundle\Entity\Annotation $annotations)
    {
        $this->annotations[] = $annotations;

        return $this;
    }

    /**
     * Remove annotations
     *
     * @param \martingerdzhev\ImageAnnotatorBundle\Entity\Annotation $annotations
     */
    public function removeAnnotation(\martingerdzhev\ImageAnnotatorBundle\Entity\Annotation $annotations)
    {
        $this->annotations->removeElement($annotations);
    }

    /**
     * Get annotations
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getAnnotations()
    {
        return $this->annotations;
    }
    /**
     * @ORM\PrePersist
     */
	public function setJoinDateToNow()
    {
        $this->joinDate = new \DateTime('NOW');
        
        return $this;
    }
}
