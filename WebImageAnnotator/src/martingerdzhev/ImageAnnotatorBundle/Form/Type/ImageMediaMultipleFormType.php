<?php

namespace martingerdzhev\ImageAnnotatorBundle\Form\Type;

use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\FormBuilderInterface;

use Symfony\Component\Form\AbstractType;
use martingerdzhev\ImageAnnotatorBundle\Entity\Image;

class ImageMediaMultipleFormType extends AbstractType
{
	public function buildForm(FormBuilderInterface $builder, array $options)
	{
		$builder->add('titles', 'collection', array('label'=> 'form.media.title', 'translation_domain' => 'ImageAnnotatorBundle', 'allow_add'=>true, 'prototype'=>true));
		$builder->add('dataset', 'entity', array('class' => 'ImageAnnotatorBundle:Dataset', 'property' => 'id'));
		$builder->add('resource', new ImageResourceMultipleFileFormType());
	}
	

	public function getName()
	{
		return 'image_annotator_image_media';
	}

	public function setDefaultOptions(OptionsResolverInterface $resolver)
	{
	}
}
?>