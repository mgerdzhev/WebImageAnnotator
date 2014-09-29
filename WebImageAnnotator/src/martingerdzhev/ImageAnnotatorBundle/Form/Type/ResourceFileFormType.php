<?php

namespace martingerdzhev\ImageAnnotatorBundle\Form\Type;

use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\FormBuilderInterface;

use Symfony\Component\Form\AbstractType;
use martingerdzhev\ImageAnnotatorBundle\Entity\Image;

class ResourceFileFormType extends AbstractType
{
	public function buildForm(FormBuilderInterface $builder, array $options)
	{
//		parent::buildForm($builder, $options);
		$builder->add('file', 'file');
		
	}
	

	public function getName()
	{
		return 'image_annotator_resource_file';
	}

	public function setDefaultOptions(OptionsResolverInterface $resolver)
	{
		$resolver->setDefaults(array('data_class' => 'martingerdzhev\ImageAnnotatorBundle\Entity\ResourceFile',));
	}
}
?>