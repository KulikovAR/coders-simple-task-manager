<?php

namespace Tests\Unit;

use App\Enums\TaskStatusType;
use PHPUnit\Framework\TestCase;

class TaskStatusTypeTest extends TestCase
{
    public function test_enum_has_all_required_statuses(): void
    {
        $this->assertTrue(enum_exists(TaskStatusType::class));
        
        $this->assertEquals('To Do', TaskStatusType::TODO->value);
        $this->assertEquals('In Progress', TaskStatusType::IN_PROGRESS->value);
        $this->assertEquals('Review', TaskStatusType::REVIEW->value);
        $this->assertEquals('Testing', TaskStatusType::TESTING->value);
        $this->assertEquals('Ready for Release', TaskStatusType::READY_FOR_RELEASE->value);
        $this->assertEquals('Done', TaskStatusType::DONE->value);
    }

    public function test_enum_has_correct_orders(): void
    {
        $this->assertEquals(1, TaskStatusType::TODO->getOrder());
        $this->assertEquals(2, TaskStatusType::IN_PROGRESS->getOrder());
        $this->assertEquals(3, TaskStatusType::REVIEW->getOrder());
        $this->assertEquals(4, TaskStatusType::TESTING->getOrder());
        $this->assertEquals(5, TaskStatusType::READY_FOR_RELEASE->getOrder());
        $this->assertEquals(6, TaskStatusType::DONE->getOrder());
    }

    public function test_enum_has_correct_colors(): void
    {
        $this->assertEquals('#6B7280', TaskStatusType::TODO->getColor());
        $this->assertEquals('#3B82F6', TaskStatusType::IN_PROGRESS->getColor());
        $this->assertEquals('#F59E0B', TaskStatusType::REVIEW->getColor());
        $this->assertEquals('#8B5CF6', TaskStatusType::TESTING->getColor());
        $this->assertEquals('#EC4899', TaskStatusType::READY_FOR_RELEASE->getColor());
        $this->assertEquals('#10B981', TaskStatusType::DONE->getColor());
    }

    public function test_get_default_statuses_returns_correct_array(): void
    {
        $defaultStatuses = TaskStatusType::getDefaultStatuses();
        
        $this->assertIsArray($defaultStatuses);
        $this->assertCount(6, $defaultStatuses);
        
        // Проверяем первый статус
        $this->assertEquals('To Do', $defaultStatuses[0]['name']);
        $this->assertEquals(1, $defaultStatuses[0]['order']);
        $this->assertEquals('#6B7280', $defaultStatuses[0]['color']);
        
        // Проверяем последний статус
        $this->assertEquals('Done', $defaultStatuses[5]['name']);
        $this->assertEquals(6, $defaultStatuses[5]['order']);
        $this->assertEquals('#10B981', $defaultStatuses[5]['color']);
    }
} 