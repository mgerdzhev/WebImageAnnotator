<?php

namespace martingerdzhev\ImageAnnotatorBundle\Form\Type;

use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\FormBuilderInterface;

use Symfony\Component\Form\AbstractType;
use martingerdzhev\ImageAnnotatorBundle\Entity\Image;

class DatasetFormType extends AbstractType
{
	public function buildForm(FormBuilderInterface $builder, array $options)
	{
		$builder->add('name', null, array('label'=> 'form.dataset.name', 'translation_domain' => 'ImageAnnotatorBundle'));
	}

	public function getName()
	{
		return 'image_annotator_dataset';
	}

	public function setDefaultOptions(OptionsResolverInterface $resolver)
	{
		$resolver->setDefaults(array('data_class' => 'martingerdzhev\ImageAnnotatorBundle\Entity\Dataset',));
	}
}
?>