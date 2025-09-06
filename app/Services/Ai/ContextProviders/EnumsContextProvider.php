<?php

namespace App\Services\Ai\ContextProviders;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Models\User;

use App\Enums\CommentType;

class EnumsContextProvider implements ContextProviderInterface
{
    public function getName(): string
    {
        return 'enums';
    }

    public function getContext($user): array
    {
        return [
            'comment_types' => $this->getCommentTypes(),
        ];
    }

    private function getCommentTypes(): array
    {
        $types = [];

        foreach (CommentType::cases() as $type) {
            $types[] = [
                'name' => $type->value,
                'key' => $type->name,
                'label' => $type->getLabel(),
                'color' => $type->getColor(),
                'icon' => $type->getIcon(),
                'is_special' => $type->isSpecial(),
            ];
        }

        return $types;
    }
}
