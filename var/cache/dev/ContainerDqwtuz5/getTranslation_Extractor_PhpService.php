<?php

use Symfony\Component\DependencyInjection\Argument\RewindableGenerator;

// This file has been auto-generated by the Symfony Dependency Injection Component for internal use.
// Returns the private 'translation.extractor.php' shared service.

include_once $this->targetDirs[3].'/vendor/symfony/translation/Extractor/AbstractFileExtractor.php';
include_once $this->targetDirs[3].'/vendor/symfony/translation/Extractor/ExtractorInterface.php';
include_once $this->targetDirs[3].'/vendor/symfony/translation/Extractor/PhpExtractor.php';

return $this->services['translation.extractor.php'] = new \Symfony\Component\Translation\Extractor\PhpExtractor();
