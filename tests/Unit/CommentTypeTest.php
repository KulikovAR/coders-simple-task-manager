<?php

namespace Tests\Unit;

use App\Enums\CommentType;
use PHPUnit\Framework\TestCase;

class CommentTypeTest extends TestCase
{
    public function test_enum_has_all_required_types(): void
    {
        $this->assertTrue(enum_exists(CommentType::class));
        
        $this->assertEquals('general', CommentType::GENERAL->value);
        $this->assertEquals('testing_feedback', CommentType::TESTING_FEEDBACK->value);
        $this->assertEquals('review_comment', CommentType::REVIEW_COMMENT->value);
        $this->assertEquals('bug_report', CommentType::BUG_REPORT->value);
        $this->assertEquals('feature_request', CommentType::FEATURE_REQUEST->value);
    }

    public function test_enum_has_correct_labels(): void
    {
        $this->assertEquals('Общий комментарий', CommentType::GENERAL->getLabel());
        $this->assertEquals('Отзыв тестирования', CommentType::TESTING_FEEDBACK->getLabel());
        $this->assertEquals('Комментарий ревью', CommentType::REVIEW_COMMENT->getLabel());
        $this->assertEquals('Отчет об ошибке', CommentType::BUG_REPORT->getLabel());
        $this->assertEquals('Запрос функции', CommentType::FEATURE_REQUEST->getLabel());
    }

    public function test_enum_has_correct_colors(): void
    {
        $this->assertEquals('#6B7280', CommentType::GENERAL->getColor());
        $this->assertEquals('#8B5CF6', CommentType::TESTING_FEEDBACK->getColor());
        $this->assertEquals('#F59E0B', CommentType::REVIEW_COMMENT->getColor());
        $this->assertEquals('#EF4444', CommentType::BUG_REPORT->getColor());
        $this->assertEquals('#10B981', CommentType::FEATURE_REQUEST->getColor());
    }

    public function test_enum_has_correct_icons(): void
    {
        $this->assertEquals('💬', CommentType::GENERAL->getIcon());
        $this->assertEquals('🧪', CommentType::TESTING_FEEDBACK->getIcon());
        $this->assertEquals('👁️', CommentType::REVIEW_COMMENT->getIcon());
        $this->assertEquals('🐛', CommentType::BUG_REPORT->getIcon());
        $this->assertEquals('💡', CommentType::FEATURE_REQUEST->getIcon());
    }

    public function test_enum_identifies_special_comments(): void
    {
        $this->assertFalse(CommentType::GENERAL->isSpecial());
        $this->assertTrue(CommentType::TESTING_FEEDBACK->isSpecial());
        $this->assertFalse(CommentType::REVIEW_COMMENT->isSpecial());
        $this->assertFalse(CommentType::BUG_REPORT->isSpecial());
        $this->assertFalse(CommentType::FEATURE_REQUEST->isSpecial());
    }
} 