<?php

namespace martingerdzhev\ImageAnnotatorBundle\Form\Type;

use Symfony\Component\Validator\Constraints\Image;

use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\FormBuilderInterface;

use Symfony\Component\Form\AbstractType;

class ImageResourceMultipleFileFormType extends AbstractType
{
	public function buildForm(FormBuilderInterface $builder, array $options)
	{
		$builder->add('file', 'file', array('attr'=>array('accept'=>'image/jpeg,image/gif,image/png','multiple'=>true)));
		
	}
	

	public function getName()
	{
		return 'image_annotator_image_resource_file';
	}

	public function setDefaultOptions(OptionsResolverInterface $resolver)
	{
	}
}
?>