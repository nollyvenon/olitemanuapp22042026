FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    redis \
    composer \
    git \
    curl \
    openssl-dev \
    linux-headers \
    autoconf \
    make \
    gcc \
    musl-dev

# In Dockerfile
RUN mkdir -p /app/storage/framework/views \
    && mkdir -p /app/storage/framework/cache \
    && mkdir -p /app/storage/framework/sessions \
    && mkdir -p /app/storage \
    && mkdir -p /app/storage/logs \
    && mkdir -p /bootstrap/cache
    
RUN chown -R 775 /app/storage/framework \
    && chown -R www-data:www-data /app/storage \
    && chmod -R 775 /app/storage    

RUN docker-php-ext-install pdo_pgsql pgsql pcntl

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-session --ignore-platform-req=ext-fileinfo --ignore-platform-req=ext-sockets --ignore-platform-req=ext-tokenizer --ignore-platform-req=ext-dom

COPY . .

RUN php artisan config:cache && php artisan route:cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
