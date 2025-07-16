FROM php:8.3-fpm

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Установка Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Создание пользователя для CSTM
RUN useradd -G www-data,root -u 1000 -d /home/cstm cstm
RUN mkdir -p /home/cstm/.composer && \
    chown -R cstm:cstm /home/cstm

# Установка рабочей директории
WORKDIR /var/www

# Копирование файлов проекта
COPY . /var/www

# Установка прав доступа
RUN chown -R cstm:cstm /var/www

# Переключение на пользователя cstm
USER cstm

# Установка зависимостей PHP
RUN composer install --no-interaction --no-dev --optimize-autoloader

# Возврат к root для финальных настроек
USER root

# Очистка кэша
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 9000
CMD ["php-fpm"] 