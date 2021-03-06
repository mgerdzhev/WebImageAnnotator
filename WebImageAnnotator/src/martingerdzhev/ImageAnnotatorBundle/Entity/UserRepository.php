<?php

namespace martingerdzhev\ImageAnnotatorBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * UserRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class UserRepository extends EntityRepository
{
	public function getAnnotatedImages($user)
	{
		$query = $this->getEntityManager()->createQuery('
                    SELECT i
					FROM ImageAnnotatorBundle:User u
					JOIN u.annotations a
					JOIN ImageAnnotatorBundle:Image i 
                    WHERE u.id = :uid
					AND i.id = a.image
					ORDER BY a.dateModified DESC
                ')->setParameter('uid', $user->getId());
		
		return $query->getResult();
	}
}
