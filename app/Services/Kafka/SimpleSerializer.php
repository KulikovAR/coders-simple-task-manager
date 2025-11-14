<?php

namespace App\Services\Kafka;

use Enqueue\RdKafka\RdKafkaMessage;
use Enqueue\RdKafka\Serializer;

class SimpleSerializer implements Serializer
{
    public function toString(RdKafkaMessage $message): string
    {
        return $message->getBody();
    }

    public function toMessage(string $string): RdKafkaMessage
    {
        $message = new RdKafkaMessage();
        $message->setBody($string);
        return $message;
    }
}
