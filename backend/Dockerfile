FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    redis \
    composer \
    git \
    curl \
    libssl-dev

RUN docker-php-ext-install pdo_pgsql pgsql pcntl

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install --no-dev --optimize-autoloader

COPY . .

RUN php artisan config:cache && php artisan route:cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0"]
