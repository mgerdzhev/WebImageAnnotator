<?php

namespace martingerdzhev\ImageAnnotatorBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * DatasetRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class DatasetRepository extends EntityRepository
{
	public function findAnnotationsOfType($dataset, $annotationType)
	{
		$query = $this->getEntityManager()->createQuery('
                    SELECT a
					FROM ImageAnnotatorBundle:Annotation a
					WHERE a.type = :aid
					AND a.id IN (SELECT e.id FROM ImageAnnotatorBundle:Dataset d JOIN d.images i JOIN i.annotations e WHERE d.id = :did)
			
                ')->setParameter('did', $dataset->getId())->setParameter('aid', $annotationType->getId());
	
		return $query->getResult();
	}
	
}
