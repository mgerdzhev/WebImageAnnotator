<?php

namespace martingerdzhev\ImageAnnotatorBundle\Form\Type;

use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use FOS\UserBundle\Form\Type\ProfileFormType as BaseType;
use Symfony\Component\Form\FormBuilderInterface;

class ProfileFormType extends BaseType
{
	public function buildForm(FormBuilderInterface $builder, array $options)
	{
// 		parent::buildForm($builder, $options);
		$builder->add('firstName', null, array('label' => 'form.profile.firstName', 'translation_domain' => 'ImageAnnotatorBundle'));
		$builder->add('lastName', null, array('label' => 'form.profile.lastName', 'translation_domain' => 'ImageAnnotatorBundle'));
		$builder->add('institution', null, array('label' => 'form.profile.institution', 'translation_domain' => 'ImageAnnotatorBundle'));
		$builder->add('city', null, array('label' => 'form.profile.city', 'translation_domain' => 'ImageAnnotatorBundle'));
		$builder->add('country', 'country', array('label' => 'form.profile.country', 'translation_domain' => 'ImageAnnotatorBundle'));
		
	}
	

	public function getName()
	{
		return 'image_annotator_user_profile';
	}

	public function setDefaultOptions(OptionsResolverInterface $resolver)
	{
		$resolver->setDefaults(array('data_class' => 'martingerdzhev\ImageAnnotatorBundle\Entity\UserProfile',));
	}
}
?>